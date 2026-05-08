/**
 * AlgoVision AI — Premium Empty State
 */

import React from 'react'
import { motion } from 'framer-motion'
import { Cpu, ArrowRight, Sparkles, Code2, Eye, Brain } from 'lucide-react'

const STEPS = [
  { icon: Code2, label: 'Write Code', color: '#a78bfa' },
  { icon: Brain, label: 'AI Analyzes', color: '#818cf8' },
  { icon: Eye, label: 'Visualize', color: '#60a5fa' },
]

export default function EmptyState() {
  return (
    <div className="w-full h-full flex items-center justify-center p-8 relative overflow-hidden">
      {/* Ambient orbs */}
      <div className="absolute top-1/3 left-1/3 w-72 h-72 rounded-full bg-violet-500/[0.03] blur-3xl animate-orb" />
      <div className="absolute bottom-1/3 right-1/3 w-80 h-80 rounded-full bg-blue-500/[0.03] blur-3xl animate-orb" style={{ animationDelay: '-4s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-indigo-500/[0.02] blur-3xl" />

      <motion.div
        className="flex flex-col items-center gap-8 max-w-lg text-center relative z-10"
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      >
        {/* Icon */}
        <motion.div className="relative" animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}>
          <div
            className="w-24 h-24 rounded-3xl flex items-center justify-center relative"
            style={{
              background: 'linear-gradient(135deg, rgba(139,92,246,0.12), rgba(59,130,246,0.12))',
              border: '1px solid rgba(139,92,246,0.1)',
              boxShadow: '0 0 60px rgba(139,92,246,0.08), 0 0 120px rgba(59,130,246,0.04)',
            }}
          >
            <Cpu className="w-10 h-10 text-violet-400/70" />
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-t from-transparent to-white/[0.03]" />
          </div>
          <motion.div
            className="absolute -top-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', boxShadow: '0 0 16px rgba(139,92,246,0.4)' }}
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </motion.div>
        </motion.div>

        {/* Text */}
        <div className="space-y-3">
          <h2 className="text-2xl font-extrabold gradient-text">Ready to Visualize</h2>
          <p className="text-sm text-[var(--color-text-muted)] leading-relaxed max-w-sm">
            Paste your algorithm code in the editor, then click{' '}
            <span className="text-violet-400 font-semibold">Visualize</span>{' '}
            to watch it execute step-by-step with AI-powered insights.
          </p>
        </div>

        {/* Step Flow */}
        <div className="flex items-center gap-2">
          {STEPS.map((step, i) => (
            <React.Fragment key={i}>
              <motion.div
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl border"
                style={{
                  background: i === 2 ? 'rgba(139,92,246,0.08)' : 'var(--color-bg-tertiary)',
                  borderColor: i === 2 ? 'rgba(139,92,246,0.2)' : 'var(--color-border-default)',
                }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
              >
                <step.icon className="w-3.5 h-3.5" style={{ color: step.color }} />
                <span className="text-xs font-semibold" style={{ color: i === 2 ? '#c4b5fd' : 'var(--color-text-muted)' }}>
                  {step.label}
                </span>
              </motion.div>
              {i < STEPS.length - 1 && (
                <ArrowRight className="w-3.5 h-3.5 text-[var(--color-text-muted)]/40" />
              )}
            </React.Fragment>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
