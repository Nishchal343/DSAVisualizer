/**
 * AlgoVision AI — Global State Store (Zustand) — Optimized
 * Manages code, execution states, visualization, and playback.
 *
 * KEY OPTIMIZATIONS:
 * - Client-side code hash caching (avoids redundant API calls)
 * - Debounce protection on analyze button
 * - 429 rate-limit-specific error handling with user-friendly messages
 * - All playback is 100% local (zero AI calls during visualization)
 */

import { create } from 'zustand'
import axios from 'axios'

const API_BASE = '/api'

const SAMPLE_CODE = `def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(0, n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
    return arr

result = bubble_sort([64, 34, 25, 12, 22, 11, 90])`

/**
 * Simple hash function for client-side cache key generation.
 * Uses djb2 algorithm — fast and collision-resistant enough for dedup.
 */
function hashCode(language, code) {
  const normalized = `${language.toLowerCase()}::${code.trim().replace(/\r\n/g, '\n')}`
  let hash = 5381
  for (let i = 0; i < normalized.length; i++) {
    hash = ((hash << 5) + hash + normalized.charCodeAt(i)) & 0xffffffff
  }
  return hash.toString(16)
}

const useStore = create((set, get) => ({
  // Code Editor State
  code: SAMPLE_CODE,
  language: 'python',
  setCode: (code) => set({ code }),
  setLanguage: (language) => set({ language }),

  // Analysis State
  isAnalyzing: false,
  analysisError: null,
  analysisResult: null,
  isRateLimited: false,      // Specific flag for 429 errors
  retryAfterSeconds: 0,      // Countdown for rate limit retry

  // Execution State
  steps: [],
  currentStep: 0,
  totalSteps: 0,

  // Visualization Config
  visualizationType: null,
  renderMode: '2d',
  vizConfig: null,

  // Algorithm Info
  algorithm: '',
  algorithmType: '',
  explanation: '',
  timeComplexity: '',
  spaceComplexity: '',
  dataStructures: [],
  codeLines: [],

  // Playback State
  isPlaying: false,
  playbackSpeed: 1,
  playbackInterval: null,

  // Client-side cache (prevents redundant API calls for identical code)
  _clientCache: {},
  _lastAnalyzeTime: 0,

  // ==========================================
  // Actions
  // ==========================================

  analyzeCode: async () => {
    const { code, language, _clientCache, _lastAnalyzeTime } = get()

    // ── Debounce: prevent rapid repeated clicks (min 1.5s between requests) ──
    const now = Date.now()
    if (now - _lastAnalyzeTime < 1500) {
      console.log('[AlgoVision] Debounced — too fast, ignoring')
      return
    }

    set({
      isAnalyzing: true,
      analysisError: null,
      isRateLimited: false,
      isPlaying: false,
      currentStep: 0,
      _lastAnalyzeTime: now,
    })

    // Clear any existing playback
    const interval = get().playbackInterval
    if (interval) clearInterval(interval)

    // ── Client-side cache check ──
    const cacheKey = hashCode(language, code)
    if (_clientCache[cacheKey]) {
      console.log('[AlgoVision] Client cache HIT — skipping API call entirely')
      const cached = _clientCache[cacheKey]
      set({
        isAnalyzing: false,
        analysisResult: cached,
        steps: cached.steps || [],
        totalSteps: cached.totalSteps || cached.steps?.length || 0,
        currentStep: 0,
        visualizationType: cached.visualizationType,
        renderMode: cached.renderMode || '2d',
        vizConfig: cached.vizConfig || {},
        algorithm: cached.algorithm || '',
        algorithmType: cached.algorithmType || '',
        explanation: cached.explanation || '',
        timeComplexity: cached.timeComplexity || '',
        spaceComplexity: cached.spaceComplexity || '',
        dataStructures: cached.dataStructures || [],
        codeLines: cached.codeLines || [],
      })
      return
    }

    // Step 1: Run code first to check for errors (all languages)
    try {
      const runResp = await axios.post(`${API_BASE}/run`, { language, code })
      const runData = runResp.data
      if (runData.error) {
        set({
          isAnalyzing: false,
          analysisError: `Fix code errors before visualizing:\n${runData.stderr}`,
          runOutput: runData,
        })
        return
      }
      // Show successful run output
      set({ runOutput: runData })
    } catch (e) {
      // Run endpoint failed — continue with visualization anyway
    }

    // Step 2: Analyze & visualize (SINGLE API call)
    try {
      const response = await axios.post(`${API_BASE}/analyze`, {
        language,
        code,
      })

      const data = response.data

      // ── Store in client-side cache ──
      const updatedCache = { ...get()._clientCache }
      updatedCache[cacheKey] = data

      // Limit client cache to 50 entries
      const cacheKeys = Object.keys(updatedCache)
      if (cacheKeys.length > 50) {
        delete updatedCache[cacheKeys[0]]
      }

      set({
        isAnalyzing: false,
        analysisResult: data,
        steps: data.steps || [],
        totalSteps: data.totalSteps || data.steps?.length || 0,
        currentStep: 0,
        visualizationType: data.visualizationType,
        renderMode: data.renderMode || '2d',
        vizConfig: data.vizConfig || {},
        algorithm: data.algorithm || '',
        algorithmType: data.algorithmType || '',
        explanation: data.explanation || '',
        timeComplexity: data.timeComplexity || '',
        spaceComplexity: data.spaceComplexity || '',
        dataStructures: data.dataStructures || [],
        codeLines: data.codeLines || [],
        _clientCache: updatedCache,
      })
    } catch (error) {
      const status = error.response?.status
      const detail = error.response?.data?.detail || ''

      // ── Handle 429 Rate Limit specifically ──
      if (status === 429) {
        const retryAfter = parseInt(error.response?.headers?.['retry-after'] || '30', 10)
        set({
          isAnalyzing: false,
          isRateLimited: true,
          retryAfterSeconds: retryAfter,
          analysisError: 'Rate limit reached. Please wait and retry.',
        })

        // Auto-clear rate limit flag after the retry period
        setTimeout(() => {
          set({ isRateLimited: false, retryAfterSeconds: 0 })
        }, retryAfter * 1000)
        return
      }

      // ── Handle other errors ──
      const message =
        detail ||
        error.message ||
        'Analysis failed. Check backend connection.'
      set({
        isAnalyzing: false,
        analysisError: message,
      })
    }
  },

  // Run Code State
  isRunning: false,
  runOutput: null, // { stdout, stderr, returnCode, error }

  runCode: async () => {
    const { code, language } = get()
    set({ isRunning: true, runOutput: null })

    try {
      const response = await axios.post(`${API_BASE}/run`, {
        language,
        code,
      })
      set({ isRunning: false, runOutput: response.data })
    } catch (error) {
      set({
        isRunning: false,
        runOutput: {
          stdout: '',
          stderr: error.response?.data?.detail || error.message || 'Run failed',
          returnCode: 1,
          error: true,
        },
      })
    }
  },

  clearRunOutput: () => set({ runOutput: null }),

  // Step Navigation (100% local — no AI calls)
  goToStep: (step) => {
    const { totalSteps } = get()
    const clamped = Math.max(0, Math.min(step, totalSteps - 1))
    set({ currentStep: clamped })
  },

  nextStep: () => {
    const { currentStep, totalSteps } = get()
    if (currentStep < totalSteps - 1) {
      set({ currentStep: currentStep + 1 })
    } else {
      // Auto-stop at end
      get().pause()
    }
  },

  prevStep: () => {
    const { currentStep } = get()
    if (currentStep > 0) {
      set({ currentStep: currentStep - 1 })
    }
  },

  // Playback Controls (100% local — no AI calls)
  play: () => {
    const { isPlaying, totalSteps, currentStep } = get()
    if (isPlaying || totalSteps === 0) return

    // If at the end, restart
    if (currentStep >= totalSteps - 1) {
      set({ currentStep: 0 })
    }

    const speed = get().playbackSpeed
    const interval = setInterval(() => {
      get().nextStep()
    }, 1000 / speed)

    set({ isPlaying: true, playbackInterval: interval })
  },

  pause: () => {
    const interval = get().playbackInterval
    if (interval) clearInterval(interval)
    set({ isPlaying: false, playbackInterval: null })
  },

  replay: () => {
    get().pause()
    set({ currentStep: 0 })
    setTimeout(() => get().play(), 100)
  },

  setPlaybackSpeed: (speed) => {
    const { isPlaying } = get()
    set({ playbackSpeed: speed })

    // Restart interval with new speed if playing
    if (isPlaying) {
      get().pause()
      setTimeout(() => get().play(), 50)
    }
  },

  // Get current step data
  getCurrentStepData: () => {
    const { steps, currentStep } = get()
    return steps[currentStep] || null
  },

  // Reset
  reset: () => {
    const interval = get().playbackInterval
    if (interval) clearInterval(interval)
    set({
      steps: [],
      currentStep: 0,
      totalSteps: 0,
      isPlaying: false,
      playbackInterval: null,
      analysisResult: null,
      analysisError: null,
      isRateLimited: false,
      retryAfterSeconds: 0,
      visualizationType: null,
      renderMode: '2d',
      vizConfig: null,
      algorithm: '',
      algorithmType: '',
      explanation: '',
      timeComplexity: '',
      spaceComplexity: '',
      dataStructures: [],
      codeLines: [],
    })
  },
}))

export default useStore
