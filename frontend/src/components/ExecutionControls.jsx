/**
 * AlgoVision AI — Premium Execution Controls
 */

import React, { useCallback } from 'react'
import { motion } from 'framer-motion'
import { Play, Pause, SkipForward, SkipBack, RotateCcw, Gauge, Timer } from 'lucide-react'
import useStore from '../store/useStore.js'

const SPEED_OPTIONS = [0.25, 0.5, 1, 1.5, 2, 3]

export default function ExecutionControls() {
  const {
    isPlaying, currentStep, totalSteps, playbackSpeed,
    play, pause, nextStep, prevStep, replay, goToStep, setPlaybackSpeed,
  } = useStore()

  const handleScrub = useCallback((e) => {
    goToStep(parseInt(e.target.value, 10))
  }, [goToStep])

  const progress = totalSteps > 0 ? ((currentStep + 1) / totalSteps) * 100 : 0

  return (
    <div className="border-t border-[var(--color-border-default)] bg-[var(--color-bg-secondary)]/80 backdrop-blur-2xl px-5 py-3 shrink-0 relative">
      {/* Top gradient line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-violet-500/20 to-transparent" />

      <div className="flex items-center gap-5">
        {/* Playback Controls */}
        <div className="flex items-center gap-1.5">
          <CtrlBtn icon={SkipBack} onClick={prevStep} disabled={currentStep <= 0} />

          <motion.button
            onClick={isPlaying ? pause : play}
            className="w-10 h-10 flex items-center justify-center rounded-xl text-white cursor-pointer relative overflow-hidden"
            style={{
              background: isPlaying
                ? 'linear-gradient(135deg, rgba(244,63,94,0.25), rgba(236,72,153,0.25))'
                : 'linear-gradient(135deg, #7c3aed, #4f46e5, #2563eb)',
              border: isPlaying ? '1px solid rgba(244,63,94,0.3)' : '1px solid rgba(139,92,246,0.3)',
            }}
            whileHover={{ scale: 1.1, boxShadow: isPlaying ? '0 0 25px rgba(244,63,94,0.3)' : '0 0 25px rgba(139,92,246,0.3)' }}
            whileTap={{ scale: 0.92 }}
          >
            {!isPlaying && <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/10" />}
            {isPlaying ? <Pause className="w-4 h-4 relative z-10" /> : <Play className="w-4 h-4 ml-0.5 relative z-10" />}
          </motion.button>

          <CtrlBtn icon={SkipForward} onClick={nextStep} disabled={currentStep >= totalSteps - 1} />
          <div className="w-px h-5 bg-[var(--color-border-default)] mx-1" />
          <CtrlBtn icon={RotateCcw} onClick={replay} />
        </div>

        {/* Timeline */}
        <div className="flex-1 flex items-center gap-3">
          <span className="text-[11px] font-mono font-bold text-[var(--color-text-muted)] w-16 text-right shrink-0">
            <span className="text-[var(--color-text-secondary)]">{currentStep + 1}</span>
            <span className="text-[var(--color-text-muted)]"> / {totalSteps}</span>
          </span>

          <div className="flex-1 relative h-10 flex items-center group">
            {/* Track */}
            <div className="absolute inset-x-0 h-1.5 rounded-full bg-[var(--color-bg-primary)] border border-[var(--color-border-subtle)]" />

            {/* Step markers */}
            {totalSteps <= 30 && Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 rounded-full bg-[var(--color-text-muted)]/30 top-1/2 -translate-y-1/2"
                style={{ left: `${(i / (totalSteps - 1)) * 100}%` }}
              />
            ))}

            {/* Fill */}
            <motion.div
              className="absolute left-0 h-1.5 rounded-full"
              style={{
                width: `${progress}%`,
                background: 'linear-gradient(90deg, #7c3aed, #4f46e5, #2563eb)',
                boxShadow: '0 0 12px rgba(99,102,241,0.4)',
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            />

            {/* Input */}
            <input
              type="range" min={0} max={Math.max(0, totalSteps - 1)} value={currentStep}
              onChange={handleScrub}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              style={{ zIndex: 10 }}
            />

            {/* Thumb */}
            <motion.div
              className="absolute w-4 h-4 rounded-full bg-white border-2 border-violet-500 pointer-events-none"
              style={{
                left: `calc(${progress}% - 8px)`,
                boxShadow: '0 0 12px rgba(139,92,246,0.5), 0 2px 8px rgba(0,0,0,0.4)',
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            />
          </div>
        </div>

        {/* Speed */}
        <div className="flex items-center gap-2 shrink-0">
          <Timer className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
          <div className="flex items-center gap-1 p-0.5 rounded-lg bg-[var(--color-bg-primary)] border border-[var(--color-border-default)]">
            {SPEED_OPTIONS.map((speed) => (
              <motion.button
                key={speed}
                onClick={() => setPlaybackSpeed(speed)}
                className={`px-2 py-1 rounded-md text-[10px] font-mono font-bold cursor-pointer transition-all ${
                  playbackSpeed === speed
                    ? 'bg-violet-500/20 text-violet-300 shadow-sm shadow-violet-500/20'
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {speed}x
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function CtrlBtn({ icon: Icon, onClick, disabled = false }) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--color-text-secondary)] hover:text-white hover:bg-[var(--color-bg-hover)] disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer transition-all border border-transparent hover:border-[var(--color-border-default)]"
      whileHover={!disabled ? { scale: 1.1 } : {}}
      whileTap={!disabled ? { scale: 0.9 } : {}}
    >
      <Icon className="w-4 h-4" />
    </motion.button>
  )
}
