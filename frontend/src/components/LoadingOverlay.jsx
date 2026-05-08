/**
 * AlgoVision AI — Loading Overlay
 * Shown during AI analysis with pipeline stage indicators.
 */

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Cpu, Search, Cog, Palette } from 'lucide-react'

const STAGES = [
  { icon: Search, label: 'Analyzing Code', sublabel: 'Identifying algorithm type & data structures...' },
  { icon: Cog, label: 'Generating Execution Trace', sublabel: 'Simulating step-by-step execution...' },
  { icon: Palette, label: 'Planning Visualization', sublabel: 'Selecting optimal rendering strategy...' },
]

export default function LoadingOverlay() {
  const [activeStage, setActiveStage] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStage((prev) => (prev + 1) % STAGES.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        className="glass-panel-strong p-8 max-w-md w-full mx-4 space-y-6"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      >
        {/* Header */}
        <div className="flex items-center gap-3">
          <motion.div
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center"
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          >
            <Cpu className="w-5 h-5 text-white" />
          </motion.div>
          <div>
            <h3 className="text-sm font-bold text-white">AI Agent Pipeline</h3>
            <p className="text-xs text-[var(--color-text-muted)]">Processing your code...</p>
          </div>
        </div>

        {/* Pipeline Stages */}
        <div className="space-y-3">
          {STAGES.map((stage, i) => {
            const isActive = i === activeStage
            const isDone = i < activeStage
            const Icon = stage.icon

            return (
              <motion.div
                key={i}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all ${
                  isActive
                    ? 'bg-violet-500/10 border-violet-500/20'
                    : isDone
                    ? 'bg-emerald-500/5 border-emerald-500/10'
                    : 'bg-[var(--color-bg-tertiary)] border-[var(--color-border-default)] opacity-40'
                }`}
                animate={isActive ? { scale: [1, 1.01, 1] } : {}}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                    isActive
                      ? 'bg-violet-500/20'
                      : isDone
                      ? 'bg-emerald-500/20'
                      : 'bg-[var(--color-bg-hover)]'
                  }`}
                >
                  <Icon
                    className={`w-3.5 h-3.5 ${
                      isActive
                        ? 'text-violet-400'
                        : isDone
                        ? 'text-emerald-400'
                        : 'text-[var(--color-text-muted)]'
                    }`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div
                    className={`text-xs font-semibold ${
                      isActive ? 'text-white' : isDone ? 'text-emerald-300' : 'text-[var(--color-text-muted)]'
                    }`}
                  >
                    {isDone ? `✓ ${stage.label}` : stage.label}
                  </div>
                  {isActive && (
                    <motion.div
                      className="text-[10px] text-[var(--color-text-muted)] mt-0.5"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      {stage.sublabel}
                    </motion.div>
                  )}
                </div>
                {isActive && (
                  <motion.div
                    className="w-4 h-4 border-2 border-violet-400 border-t-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  />
                )}
              </motion.div>
            )
          })}
        </div>

        {/* Progress Bar */}
        <div className="h-1 rounded-full bg-[var(--color-bg-primary)] overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-blue-500"
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 9, ease: 'linear' }}
          />
        </div>
      </motion.div>
    </motion.div>
  )
}
