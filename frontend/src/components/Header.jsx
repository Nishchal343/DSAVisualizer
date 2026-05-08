/**
 * AlgoVision AI — Premium Header
 */

import React from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Cpu, Zap, Activity } from 'lucide-react'
import useStore from '../store/useStore.js'

export default function Header() {
  const { algorithm, algorithmType, isAnalyzing, totalSteps, currentStep } = useStore()

  return (
    <header className="h-13 flex items-center justify-between px-5 border-b border-[var(--color-border-default)] bg-[var(--color-bg-secondary)]/70 backdrop-blur-2xl z-50 shrink-0 relative overflow-hidden">
      {/* Ambient gradient line at top */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-violet-500/30 to-transparent" />

      {/* Logo */}
      <div className="flex items-center gap-3">
        <motion.div
          className="w-8 h-8 rounded-xl flex items-center justify-center relative"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5, #2563eb)' }}
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ type: 'spring', stiffness: 400 }}
        >
          <Cpu className="w-4.5 h-4.5 text-white" />
          <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-transparent to-white/10" />
        </motion.div>
        <div className="flex items-baseline gap-2">
          <h1 className="text-sm font-extrabold tracking-tight gradient-text">
            AlgoVision AI
          </h1>
          <span className="text-[9px] text-[var(--color-text-muted)] font-semibold tracking-widest uppercase px-1.5 py-0.5 rounded bg-[var(--color-bg-tertiary)] border border-[var(--color-border-default)]">
            v1.0
          </span>
        </div>
      </div>

      {/* Center — Algorithm Info */}
      <div className="flex items-center gap-2.5">
        {algorithm && (
          <motion.div
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full border"
            style={{
              background: 'linear-gradient(135deg, rgba(139,92,246,0.08), rgba(59,130,246,0.08))',
              borderColor: 'rgba(139,92,246,0.15)',
            }}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <Sparkles className="w-3.5 h-3.5 text-violet-400" />
            <span className="text-xs font-bold text-[var(--color-text-primary)]">
              {algorithm}
            </span>
            {algorithmType && (
              <span className="text-[9px] font-bold uppercase tracking-wider text-violet-400/70 pl-1 border-l border-violet-500/20">
                {algorithmType}
              </span>
            )}
          </motion.div>
        )}
        {algorithm && totalSteps > 0 && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--color-bg-tertiary)] border border-[var(--color-border-default)]">
            <Activity className="w-3 h-3 text-emerald-400" />
            <span className="text-[10px] font-mono font-bold text-[var(--color-text-muted)]">
              {currentStep + 1}/{totalSteps}
            </span>
          </div>
        )}
        {isAnalyzing && (
          <motion.div
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full"
            style={{
              background: 'linear-gradient(135deg, rgba(139,92,246,0.12), rgba(236,72,153,0.12))',
              border: '1px solid rgba(139,92,246,0.2)',
            }}
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <Zap className="w-3.5 h-3.5 text-violet-400" />
            <span className="text-xs font-bold text-violet-300">
              AI Processing...
            </span>
          </motion.div>
        )}
      </div>

      {/* Right — Status */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/[0.06] border border-emerald-500/10">
          <motion.div
            className="w-2 h-2 rounded-full bg-emerald-400"
            animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <span className="text-[10px] text-emerald-400/80 font-semibold">
            Engine Ready
          </span>
        </div>
      </div>
    </header>
  )
}
