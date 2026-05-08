/**
 * AlgoVision AI — Premium AI Insights Panel
 */

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, Lightbulb, Clock, HardDrive, Variable, Layers, Code2, ArrowRight, TrendingUp, Hash } from 'lucide-react'
import useStore from '../store/useStore.js'

function Section({ icon: Icon, title, children, iconColor = '#a78bfa', delay = 0 }) {
  return (
    <motion.div
      className="panel-section px-3 py-2.5 space-y-2"
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay }}
    >
      <div className="flex items-center gap-1.5">
        <Icon className="w-3.5 h-3.5" style={{ color: iconColor }} />
        <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest">
          {title}
        </span>
      </div>
      {children}
    </motion.div>
  )
}

export default function AIPanel() {
  const {
    algorithm, algorithmType, explanation, timeComplexity, spaceComplexity,
    dataStructures, steps, currentStep, codeLines, analysisResult,
  } = useStore()

  const stepData = steps[currentStep] || null

  if (!analysisResult) {
    return (
      <div className="h-full flex flex-col bg-[var(--color-bg-secondary)]">
        <PanelHeader />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center space-y-4">
            <motion.div
              className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center relative"
              style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.08), rgba(59,130,246,0.08))', border: '1px solid rgba(139,92,246,0.1)' }}
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Brain className="w-7 h-7 text-violet-400/50" />
            </motion.div>
            <p className="text-xs text-[var(--color-text-muted)] leading-relaxed max-w-[200px]">
              AI-powered insights will appear here after visualization.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-[var(--color-bg-secondary)]">
      <PanelHeader />
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {/* Algorithm Card */}
        <motion.div
          className="mx-1 px-3.5 py-3 rounded-xl relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(139,92,246,0.08) 0%, rgba(59,130,246,0.06) 100%)',
            border: '1px solid rgba(139,92,246,0.12)',
          }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-violet-500/[0.04] blur-2xl" />
          <div className="text-[9px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest mb-1.5">
            Detected Algorithm
          </div>
          <div className="text-base font-extrabold gradient-text leading-tight">{algorithm}</div>
          <div className="flex items-center gap-2 mt-2">
            <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-violet-500/12 text-violet-300 uppercase tracking-wider border border-violet-500/15">
              {algorithmType}
            </span>
          </div>
        </motion.div>

        {/* Complexity Grid */}
        <div className="grid grid-cols-2 gap-1.5 px-1">
          <ComplexityCard icon={Clock} label="Time" value={timeComplexity} color="#fbbf24" bg="rgba(245,158,11,0.06)" border="rgba(245,158,11,0.12)" />
          <ComplexityCard icon={HardDrive} label="Space" value={spaceComplexity} color="#60a5fa" bg="rgba(59,130,246,0.06)" border="rgba(59,130,246,0.12)" />
        </div>

        {/* Data Structures */}
        {dataStructures.length > 0 && (
          <Section icon={Layers} title="Data Structures" iconColor="#22d3ee" delay={0.05}>
            <div className="flex flex-wrap gap-1.5">
              {dataStructures.map((ds) => (
                <span key={ds} className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-cyan-500/8 border border-cyan-500/12 text-cyan-300">
                  {ds}
                </span>
              ))}
            </div>
          </Section>
        )}

        {/* Explanation */}
        <Section icon={Lightbulb} title="How It Works" iconColor="#fbbf24" delay={0.1}>
          <p className="text-[11px] text-[var(--color-text-secondary)] leading-[1.6]">{explanation}</p>
        </Section>

        {/* Divider */}
        {stepData && <div className="mx-3 border-t border-[var(--color-border-default)]" />}

        {/* Current Step */}
        {stepData && (
          <>
            <Section icon={ArrowRight} title={`Step ${currentStep + 1}`} iconColor="#a78bfa" delay={0}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  className="text-[11px] text-[var(--color-text-secondary)] leading-[1.6] px-2.5 py-2 rounded-lg bg-[var(--color-bg-primary)]/60 border border-[var(--color-border-default)]"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                >
                  {stepData.description}
                </motion.div>
              </AnimatePresence>
            </Section>

            {/* Executing Line */}
            {stepData.line && codeLines[stepData.line - 1] && (
              <Section icon={Code2} title="Executing Line" iconColor="#60a5fa" delay={0}>
                <div className="flex items-center gap-2 px-2.5 py-2 rounded-lg bg-[var(--color-bg-primary)] border border-[var(--color-border-default)] overflow-x-auto">
                  <span className="text-[10px] font-mono font-bold text-blue-400/60 shrink-0 w-6 text-right">
                    {stepData.line}
                  </span>
                  <div className="w-px h-3.5 bg-[var(--color-border-default)]" />
                  <code className="text-[11px] font-mono text-blue-300 whitespace-pre">
                    {codeLines[stepData.line - 1]?.trim()}
                  </code>
                </div>
              </Section>
            )}

            {/* Variables */}
            {stepData.variables && Object.keys(stepData.variables).length > 0 && (
              <Section icon={Variable} title="Variables" iconColor="#34d399" delay={0}>
                <div className="space-y-1">
                  {Object.entries(stepData.variables).map(([key, value]) => (
                    <motion.div
                      key={key}
                      className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-[var(--color-bg-primary)]/50 border border-[var(--color-border-default)] group hover:border-emerald-500/15 transition-colors"
                      layout
                    >
                      <div className="flex items-center gap-1.5">
                        <Hash className="w-2.5 h-2.5 text-emerald-500/40" />
                        <span className="text-[11px] font-mono font-bold text-emerald-300">{key}</span>
                      </div>
                      <AnimatePresence mode="wait">
                        <motion.span
                          key={`${key}-${JSON.stringify(value)}`}
                          className="text-[11px] font-mono text-[var(--color-text-secondary)] max-w-[140px] truncate"
                          initial={{ opacity: 0, scale: 0.9, color: '#fff' }}
                          animate={{ opacity: 1, scale: 1, color: '#9898a8' }}
                          transition={{ duration: 0.2 }}
                        >
                          {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                        </motion.span>
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </div>
              </Section>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function PanelHeader() {
  return (
    <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[var(--color-border-default)] shrink-0 relative">
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-violet-500/10 to-transparent" />
      <Brain className="w-3.5 h-3.5 text-violet-400" />
      <span className="text-[10px] font-bold text-[var(--color-text-muted)] tracking-widest uppercase">
        AI Insights
      </span>
    </div>
  )
}

function ComplexityCard({ icon: Icon, label, value, color, bg, border }) {
  return (
    <motion.div
      className="px-3 py-2.5 rounded-xl"
      style={{ background: bg, border: `1px solid ${border}` }}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.05 }}
    >
      <div className="flex items-center gap-1 mb-1">
        <Icon className="w-3 h-3" style={{ color }} />
        <span className="text-[9px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">{label}</span>
      </div>
      <span className="text-sm font-extrabold font-mono" style={{ color }}>{value}</span>
    </motion.div>
  )
}
