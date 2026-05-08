/**
 * AlgoVision AI — Code Editor (Left Panel)
 * Full-featured editor with Run, Visualize, output console, and language-aware examples.
 */

import React, { useCallback, useRef } from 'react'
import Editor from '@monaco-editor/react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Play, Code2, ChevronDown, Loader2, AlertTriangle,
  CheckCircle2, Trash2, FileCode, ArrowRight, Terminal,
  X, CirclePlay
} from 'lucide-react'
import useStore from '../store/useStore.js'

const LANGUAGES = [
  { value: 'python', label: 'Python', icon: '🐍' },
  { value: 'java', label: 'Java', icon: '☕' },
  { value: 'javascript', label: 'JavaScript', icon: '⚡' },
  { value: 'cpp', label: 'C++', icon: '⚙️' },
  { value: 'c', label: 'C', icon: '🔧' },
]

const MONACO_OPTIONS = {
  fontSize: 13,
  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
  fontLigatures: true,
  lineHeight: 22,
  minimap: { enabled: false },
  scrollBeyondLastLine: false,
  renderLineHighlight: 'all',
  cursorBlinking: 'smooth',
  cursorSmoothCaretAnimation: 'on',
  smoothScrolling: true,
  padding: { top: 12, bottom: 12 },
  bracketPairColorization: { enabled: true },
  guides: { bracketPairs: true },
  overviewRulerLanes: 0,
  hideCursorInOverviewRuler: true,
  overviewRulerBorder: false,
  glyphMargin: true,
  scrollbar: { verticalScrollbarSize: 6, horizontalScrollbarSize: 6 },
}

// Language-specific examples
const EXAMPLES = {
  python: [
    { name: 'Bubble Sort', code: `def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(0, n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
    return arr

result = bubble_sort([64, 34, 25, 12, 22, 11, 90])
print("Sorted:", result)` },
    { name: 'Binary Search', code: `def binary_search(arr, target):
    low, high = 0, len(arr) - 1
    while low <= high:
        mid = (low + high) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
    return -1

result = binary_search([2, 5, 8, 12, 16, 23, 38, 56, 72, 91], 23)
print("Found at index:", result)` },
    { name: 'BFS Graph', code: `from collections import deque

def bfs(graph, start):
    visited = set()
    queue = deque([start])
    visited.add(start)
    order = []
    while queue:
        node = queue.popleft()
        order.append(node)
        for neighbor in graph[node]:
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append(neighbor)
    return order

graph = {0: [1,2], 1: [3,4], 2: [4,5], 3: [], 4: [], 5: []}
result = bfs(graph, 0)
print("BFS order:", result)` },
    { name: 'Two Sum', code: `def two_sum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []

result = two_sum([2, 7, 11, 15], 9)
print("Indices:", result)` },
  ],
  javascript: [
    { name: 'Bubble Sort', code: `function bubbleSort(arr) {
    const n = arr.length;
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
            }
        }
    }
    return arr;
}

const result = bubbleSort([64, 34, 25, 12, 22, 11, 90]);
console.log("Sorted:", result);` },
    { name: 'Binary Search', code: `function binarySearch(arr, target) {
    let low = 0, high = arr.length - 1;
    while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        if (arr[mid] === target) return mid;
        else if (arr[mid] < target) low = mid + 1;
        else high = mid - 1;
    }
    return -1;
}

const result = binarySearch([2, 5, 8, 12, 16, 23, 38, 56, 72, 91], 23);
console.log("Found at index:", result);` },
    { name: 'Two Sum', code: `function twoSum(nums, target) {
    const seen = {};
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        if (complement in seen) {
            return [seen[complement], i];
        }
        seen[nums[i]] = i;
    }
    return [];
}

const result = twoSum([2, 7, 11, 15], 9);
console.log("Indices:", result);` },
  ],
  java: [
    { name: 'Bubble Sort', code: `public class BubbleSort {
    public static int[] bubbleSort(int[] arr) {
        int n = arr.length;
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n - i - 1; j++) {
                if (arr[j] > arr[j + 1]) {
                    int temp = arr[j];
                    arr[j] = arr[j + 1];
                    arr[j + 1] = temp;
                }
            }
        }
        return arr;
    }

    public static void main(String[] args) {
        int[] arr = {64, 34, 25, 12, 22, 11, 90};
        int[] sorted = bubbleSort(arr);
        System.out.print("Sorted: ");
        for (int x : sorted) System.out.print(x + " ");
    }
}` },
    { name: 'Binary Search', code: `public class BinarySearch {
    public static int binarySearch(int[] arr, int target) {
        int low = 0, high = arr.length - 1;
        while (low <= high) {
            int mid = (low + high) / 2;
            if (arr[mid] == target) return mid;
            else if (arr[mid] < target) low = mid + 1;
            else high = mid - 1;
        }
        return -1;
    }

    public static void main(String[] args) {
        int[] arr = {2, 5, 8, 12, 16, 23, 38, 56, 72, 91};
        System.out.println("Found at index: " + binarySearch(arr, 23));
    }
}` },
  ],
  cpp: [
    { name: 'Bubble Sort', code: `#include <iostream>
#include <vector>
using namespace std;

vector<int> bubbleSort(vector<int> arr) {
    int n = arr.size();
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                swap(arr[j], arr[j + 1]);
            }
        }
    }
    return arr;
}

int main() {
    vector<int> arr = {64, 34, 25, 12, 22, 11, 90};
    vector<int> sorted = bubbleSort(arr);
    cout << "Sorted: ";
    for (int x : sorted) cout << x << " ";
    return 0;
}` },
    { name: 'Binary Search', code: `#include <iostream>
#include <vector>
using namespace std;

int binarySearch(vector<int>& arr, int target) {
    int low = 0, high = arr.size() - 1;
    while (low <= high) {
        int mid = (low + high) / 2;
        if (arr[mid] == target) return mid;
        else if (arr[mid] < target) low = mid + 1;
        else high = mid - 1;
    }
    return -1;
}

int main() {
    vector<int> arr = {2, 5, 8, 12, 16, 23, 38, 56, 72, 91};
    cout << "Found at index: " << binarySearch(arr, 23) << endl;
    return 0;
}` },
  ],
  c: [
    { name: 'Bubble Sort', code: `#include <stdio.h>

void bubbleSort(int arr[], int n) {
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                int temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
            }
        }
    }
}

int main() {
    int arr[] = {64, 34, 25, 12, 22, 11, 90};
    int n = sizeof(arr) / sizeof(arr[0]);
    bubbleSort(arr, n);
    printf("Sorted: ");
    for (int i = 0; i < n; i++) printf("%d ", arr[i]);
    return 0;
}` },
  ],
}

export default function CodeEditor() {
  const {
    code, setCode, language, setLanguage,
    analyzeCode, isAnalyzing, analysisError,
    analysisResult, reset, steps, currentStep,
    runCode, isRunning, runOutput, clearRunOutput,
    isRateLimited,
  } = useStore()

  const editorRef = useRef(null)
  const stepData = steps[currentStep] || null
  const hasRunError = runOutput?.error === true

  const handleEditorMount = useCallback((editor) => {
    editorRef.current = editor
    editor.focus()
  }, [])

  const handleLoadExample = (example) => {
    setCode(example.code)
    reset()
    clearRunOutput()
  }

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang)
    // Load the first example for the new language
    const langExamples = EXAMPLES[newLang] || EXAMPLES.python
    if (langExamples.length > 0) {
      setCode(langExamples[0].code)
      reset()
      clearRunOutput()
    }
  }

  const monacoLang = language === 'cpp' ? 'cpp' : language === 'c' ? 'c' : language
  const currentExamples = EXAMPLES[language] || EXAMPLES.python

  // Highlight the currently executing line
  React.useEffect(() => {
    if (!editorRef.current || !stepData?.line) return
    const editor = editorRef.current
    const decorations = editor.deltaDecorations(
      editor.__prevDecorations || [],
      [{
        range: { startLineNumber: stepData.line, startColumn: 1, endLineNumber: stepData.line, endColumn: 1 },
        options: { isWholeLine: true, className: 'active-line-highlight', glyphMarginClassName: 'active-line-glyph' },
      }]
    )
    editor.__prevDecorations = decorations
  }, [stepData?.line])

  return (
    <div className="flex flex-col h-full bg-[var(--color-bg-secondary)]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--color-border-default)] shrink-0 relative">
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-violet-500/10 to-transparent" />
        <div className="flex items-center gap-2">
          <FileCode className="w-3.5 h-3.5 text-violet-400/60" />
          <span className="text-[10px] font-bold text-[var(--color-text-muted)] tracking-widest uppercase">Code Editor</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <select
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="appearance-none bg-[var(--color-bg-primary)] text-[var(--color-text-secondary)] text-[11px] font-semibold pl-2.5 pr-7 py-1.5 rounded-lg border border-[var(--color-border-default)] cursor-pointer hover:border-violet-500/30 transition-all focus:outline-none"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.value} value={lang.value}>{lang.icon} {lang.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-[var(--color-text-muted)] pointer-events-none" />
          </div>
          <motion.button
            onClick={() => { setCode(''); reset(); clearRunOutput(); }}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--color-text-muted)] hover:text-rose-400 hover:bg-rose-500/10 cursor-pointer transition-colors"
            whileTap={{ scale: 0.9 }}
            title="Clear code"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </motion.button>
        </div>
      </div>

      {/* Example Templates (language-specific) */}
      <div className="flex items-center gap-1.5 px-3 py-2 border-b border-[var(--color-border-default)] overflow-x-auto shrink-0">
        <span className="text-[9px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider shrink-0 mr-1">Examples:</span>
        {currentExamples.map((ex) => (
          <motion.button
            key={ex.name}
            onClick={() => handleLoadExample(ex)}
            className="shrink-0 px-2.5 py-1 rounded-lg text-[10px] font-semibold text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] bg-[var(--color-bg-primary)] border border-[var(--color-border-default)] hover:border-violet-500/20 cursor-pointer transition-all"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {ex.name}
          </motion.button>
        ))}
      </div>

      {/* Monaco Editor */}
      <div className="flex-1 overflow-hidden relative">
        <Editor
          height="100%"
          language={monacoLang}
          value={code}
          onChange={(value) => { setCode(value || ''); clearRunOutput(); }}
          onMount={handleEditorMount}
          theme="vs-dark"
          options={MONACO_OPTIONS}
          loading={<div className="flex items-center justify-center h-full"><Loader2 className="w-5 h-5 text-violet-400 animate-spin" /></div>}
        />
        {stepData?.line && (
          <div className="absolute top-2 right-2 px-2 py-1 rounded-md bg-blue-500/10 border border-blue-500/15 z-10">
            <span className="text-[9px] font-mono font-bold text-blue-400">Line {stepData.line}</span>
          </div>
        )}
      </div>

      {/* Run Output Console */}
      <AnimatePresence>
        {runOutput && (
          <motion.div
            className="border-t border-[var(--color-border-default)] shrink-0 max-h-[140px] overflow-y-auto relative"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center justify-between px-3 py-1.5 bg-[var(--color-bg-primary)] border-b border-[var(--color-border-default)] sticky top-0 z-10">
              <div className="flex items-center gap-1.5">
                <Terminal className="w-3 h-3 text-[var(--color-text-muted)]" />
                <span className="text-[9px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Output</span>
                {runOutput.error ? (
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 font-bold">ERROR</span>
                ) : (
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold">OK</span>
                )}
              </div>
              <motion.button
                onClick={clearRunOutput}
                className="w-5 h-5 rounded flex items-center justify-center text-[var(--color-text-muted)] hover:text-white cursor-pointer"
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-3 h-3" />
              </motion.button>
            </div>
            <div className="px-3 py-2 bg-[var(--color-bg-primary)]">
              {runOutput.stdout && <pre className="text-[11px] font-mono text-emerald-300 whitespace-pre-wrap leading-relaxed">{runOutput.stdout}</pre>}
              {runOutput.stderr && <pre className="text-[11px] font-mono text-rose-300 whitespace-pre-wrap leading-relaxed mt-1">{runOutput.stderr}</pre>}
              {!runOutput.stdout && !runOutput.stderr && <span className="text-[11px] text-[var(--color-text-muted)] italic">No output</span>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Section: Error/Status + Buttons */}
      <div className="border-t border-[var(--color-border-default)] shrink-0">
        {/* Error Display */}
        <AnimatePresence>
          {analysisError && isRateLimited && (
            <motion.div
              className="flex items-start gap-2 px-3 py-2.5 bg-amber-500/[0.08] border-b border-amber-500/15"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
            >
              <svg className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider">Rate Limit — Please Wait</span>
                <p className="text-[11px] text-amber-300/80 mt-0.5 leading-relaxed">Rate limit reached. Please wait 30–60 seconds and try again.</p>
              </div>
            </motion.div>
          )}
          {analysisError && !isRateLimited && (
            <motion.div
              className="flex items-start gap-2 px-3 py-2.5 bg-rose-500/[0.06] border-b border-rose-500/10"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
            >
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-bold text-rose-300 uppercase tracking-wider">Error — Fix Before Visualizing</span>
                <p className="text-[11px] text-rose-300/80 mt-0.5 leading-relaxed break-words whitespace-pre-wrap">{analysisError}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Success Status */}
        <AnimatePresence>
          {analysisResult && !analysisError && (
            <motion.div
              className="flex items-center gap-2 px-3 py-2 bg-emerald-500/[0.04] border-b border-emerald-500/8"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[10px] font-semibold text-emerald-300">
                {analysisResult.algorithm} — {analysisResult.totalSteps} steps
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Buttons: Run + Visualize */}
        <div className="p-3 flex gap-2">
          {/* Run Button */}
          <motion.button
            onClick={runCode}
            disabled={isRunning || !code.trim()}
            className="flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl font-bold text-xs text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer relative overflow-hidden"
            style={{
              background: isRunning ? 'rgba(16,185,129,0.15)' : 'linear-gradient(135deg, #059669, #047857)',
              border: isRunning ? '1px solid rgba(16,185,129,0.2)' : '1px solid rgba(16,185,129,0.3)',
            }}
            whileHover={!isRunning ? { scale: 1.02, boxShadow: '0 0 25px rgba(16,185,129,0.25)' } : {}}
            whileTap={!isRunning ? { scale: 0.97 } : {}}
          >
            {isRunning ? (
              <><Loader2 className="w-3.5 h-3.5 animate-spin" /><span>Running...</span></>
            ) : (
              <><CirclePlay className="w-3.5 h-3.5" /><span>Run</span></>
            )}
          </motion.button>

          {/* Visualize Button */}
          <motion.button
            onClick={analyzeCode}
            disabled={isAnalyzing || !code.trim() || hasRunError}
            className="flex-1 flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl font-bold text-sm text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer relative overflow-hidden"
            style={{
              background: isAnalyzing ? 'rgba(139,92,246,0.15)' : hasRunError ? 'rgba(100,100,100,0.2)' : 'linear-gradient(135deg, #7c3aed, #4f46e5, #2563eb)',
              border: isAnalyzing ? '1px solid rgba(139,92,246,0.2)' : hasRunError ? '1px solid rgba(100,100,100,0.2)' : '1px solid rgba(139,92,246,0.3)',
            }}
            whileHover={!isAnalyzing && !hasRunError ? { scale: 1.02, boxShadow: '0 0 40px rgba(139,92,246,0.3)' } : {}}
            whileTap={!isAnalyzing && !hasRunError ? { scale: 0.97 } : {}}
            title={hasRunError ? 'Fix errors first — click Run to re-check' : ''}
          >
            {!isAnalyzing && !hasRunError && <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/[0.08]" />}
            {isAnalyzing ? (
              <><Loader2 className="w-4 h-4 animate-spin relative z-10" /><span className="relative z-10">Checking & Analyzing...</span></>
            ) : hasRunError ? (
              <><AlertTriangle className="w-4 h-4 relative z-10 text-rose-400" /><span className="relative z-10 text-rose-300">Fix Errors First</span></>
            ) : (
              <><Play className="w-4 h-4 relative z-10" /><span className="relative z-10">Visualize</span><ArrowRight className="w-3.5 h-3.5 relative z-10 opacity-50" /></>
            )}
          </motion.button>
        </div>
      </div>
    </div>
  )
}
