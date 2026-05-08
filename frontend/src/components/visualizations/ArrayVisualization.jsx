/**
 * AlgoVision AI — Premium Array Visualization (2D)
 * Animated bars with swap effects, action badges, pointer arrows, and step info.
 */

import React, { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowDownUp, GitCompare, CheckCircle2, Play, Zap } from 'lucide-react'

const COLOR_MAP = {
  default:    { bg: 'linear-gradient(180deg, #2a2a3e 0%, #1e1e30 100%)', border: '#3a3a50', text: '#8888a0' },
  highlight:  { bg: 'linear-gradient(180deg, #7c3aed 0%, #6d28d9 100%)', border: '#8b5cf6', text: '#fff' },
  compare:    { bg: 'linear-gradient(180deg, #d97706 0%, #b45309 100%)', border: '#f59e0b', text: '#fff' },
  swap:       { bg: 'linear-gradient(180deg, #e11d48 0%, #be123c 100%)', border: '#f43f5e', text: '#fff' },
  sorted:     { bg: 'linear-gradient(180deg, #059669 0%, #047857 100%)', border: '#10b981', text: '#fff' },
  active:     { bg: 'linear-gradient(180deg, #2563eb 0%, #1d4ed8 100%)', border: '#3b82f6', text: '#fff' },
}

const ACTION_CONFIG = {
  swap:       { icon: ArrowDownUp, label: 'SWAP', badgeClass: 'action-badge-swap', glowClass: 'glow-swap' },
  compare:    { icon: GitCompare, label: 'COMPARE', badgeClass: 'action-badge-compare', glowClass: 'glow-compare' },
  sorted:     { icon: CheckCircle2, label: 'SORTED', badgeClass: 'action-badge-sorted', glowClass: 'glow-sorted' },
  return:     { icon: CheckCircle2, label: 'DONE', badgeClass: 'action-badge-sorted', glowClass: 'glow-sorted' },
  initialize: { icon: Play, label: 'INIT', badgeClass: 'action-badge-initialize', glowClass: 'glow-violet' },
  highlight:  { icon: Zap, label: 'STEP', badgeClass: 'action-badge-highlight', glowClass: '' },
}

function getColorKey(index, highlights, action) {
  if (!highlights || !highlights.includes(index)) return 'default'
  if (action === 'swap') return 'swap'
  if (action === 'compare') return 'compare'
  if (action === 'sorted' || action === 'return') return 'sorted'
  return 'highlight'
}

export default function ArrayVisualization({ stepData, vizType }) {
  const array = stepData?.array || []
  const highlights = stepData?.highlights || []
  const pointers = stepData?.pointers || {}
  const action = stepData?.action || ''
  const description = stepData?.description || ''
  const step = stepData?.step || 0

  const maxVal = useMemo(() => Math.max(...array.map(Math.abs), 1), [array])
  const actionCfg = ACTION_CONFIG[action] || ACTION_CONFIG.highlight

  if (array.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-sm text-[var(--color-text-muted)]">
        No array data for this step
      </div>
    )
  }

  const barWidth = Math.min(64, Math.max(28, (window.innerWidth * 0.35) / array.length))
  const gap = Math.min(8, Math.max(3, 240 / array.length))

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-6 gap-5 relative overflow-hidden">

      {/* Ambient background orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-violet-500/[0.03] blur-3xl animate-orb" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-blue-500/[0.03] blur-3xl animate-orb" style={{ animationDelay: '-3s' }} />
      </div>

      {/* Top Section: Step Info + Action Badge */}
      <motion.div
        key={step}
        className="flex flex-col items-center gap-2.5 z-10"
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        {/* Action Badge */}
        <div className={`action-badge ${actionCfg.badgeClass}`}>
          <actionCfg.icon className="w-3 h-3" />
          <span>{actionCfg.label}</span>
        </div>

        {/* Step Description */}
        <p className="text-sm text-[var(--color-text-secondary)] text-center max-w-xl font-medium leading-relaxed">
          {description}
        </p>
      </motion.div>

      {/* Bar Chart */}
      <div className="flex items-end justify-center z-10" style={{ gap: `${gap}px` }}>
        <AnimatePresence mode="popLayout">
          {array.map((value, index) => {
            const height = Math.max(24, (Math.abs(value) / maxVal) * 220)
            const colorKey = getColorKey(index, highlights, action)
            const colors = COLOR_MAP[colorKey]
            const isHighlighted = highlights.includes(index)
            const isPointer = Object.values(pointers).includes(index)

            return (
              <motion.div
                key={`bar-${index}`}
                className="flex flex-col items-center"
                style={{ gap: '6px' }}
                layout
                transition={{ type: 'spring', stiffness: 280, damping: 22 }}
              >
                {/* Value Label */}
                <motion.span
                  className="font-mono font-bold text-xs"
                  style={{ color: isHighlighted ? colors.text : 'var(--color-text-muted)' }}
                  animate={{
                    scale: isHighlighted ? 1.2 : 1,
                    y: isHighlighted ? -3 : 0,
                  }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  {value}
                </motion.span>

                {/* Bar */}
                <motion.div
                  className="rounded-lg relative overflow-hidden"
                  style={{
                    width: `${barWidth}px`,
                    background: colors.bg,
                    border: `1.5px solid ${colors.border}`,
                  }}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{
                    height,
                    opacity: 1,
                    boxShadow: isHighlighted
                      ? `0 0 20px ${colors.border}55, 0 4px 30px ${colors.border}33, inset 0 1px 0 rgba(255,255,255,0.1)`
                      : `0 4px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)`,
                  }}
                  transition={{ type: 'spring', stiffness: 220, damping: 20 }}
                >
                  {/* Inner shine */}
                  <div
                    className="absolute inset-0 opacity-30"
                    style={{
                      background: 'linear-gradient(180deg, rgba(255,255,255,0.12) 0%, transparent 40%)',
                    }}
                  />

                  {/* Swap ripple effect */}
                  {isHighlighted && action === 'swap' && (
                    <motion.div
                      className="absolute inset-0 rounded-lg border-2 border-rose-400/50"
                      initial={{ scale: 0.8, opacity: 1 }}
                      animate={{ scale: 1.3, opacity: 0 }}
                      transition={{ duration: 0.6, repeat: Infinity }}
                    />
                  )}
                </motion.div>

                {/* Index */}
                <span
                  className="text-[10px] font-mono"
                  style={{ color: isPointer ? '#22d3ee' : 'var(--color-text-muted)' }}
                >
                  {index}
                </span>

                {/* Pointer Arrow */}
                {isPointer && (
                  <motion.div
                    className="flex flex-col items-center -mt-0.5"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <div className="w-0 h-0 border-l-[5px] border-r-[5px] border-b-[6px] border-l-transparent border-r-transparent border-b-cyan-400" />
                    <span className="text-[9px] font-mono font-bold text-cyan-300 mt-0.5">
                      {Object.entries(pointers).find(([, v]) => v === index)?.[0]}
                    </span>
                  </motion.div>
                )}
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {/* Bottom: Pointer Summary Bar */}
      {Object.keys(pointers).length > 0 && (
        <motion.div
          className="flex items-center gap-3 z-10"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {Object.entries(pointers).map(([name, value]) => (
            <motion.div
              key={name}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border"
              style={{
                background: 'rgba(6, 182, 212, 0.06)',
                borderColor: 'rgba(6, 182, 212, 0.15)',
              }}
              layout
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <span className="text-[10px] font-mono font-bold text-cyan-400">{name}</span>
              <span className="text-[10px] text-cyan-600">=</span>
              <motion.span
                key={`${name}-${value}`}
                className="text-xs font-mono font-bold text-cyan-200"
                initial={{ scale: 1.3, color: '#fff' }}
                animate={{ scale: 1, color: '#a5f3fc' }}
                transition={{ duration: 0.3 }}
              >
                {value}
              </motion.span>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Swap Indicator Overlay */}
      {action === 'swap' && highlights.length >= 2 && (
        <motion.div
          className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 z-20"
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 400 }}
        >
          <ArrowDownUp className="w-3.5 h-3.5 text-rose-400" />
          <span className="text-[11px] font-bold text-rose-300">
            arr[{highlights[0]}] ⇄ arr[{highlights[1]}]
          </span>
        </motion.div>
      )}
    </div>
  )
}
