/**
 * AlgoVision AI — Floating AI Insights Drawer
 * Slides in from the bottom-right as an overlay panel.
 */

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Brain, Lightbulb, Clock, HardDrive, Layers, Code2, ArrowRight, Variable, Hash, Sparkles } from 'lucide-react'
import useStore from '../store/useStore.js'

function Section({ icon: Icon, title, children, iconColor = '#a78bfa' }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5">
        <Icon className="w-3.5 h-3.5" style={{ color: iconColor }} />
        <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest">{title}</span>
      </div>
      {children}
    </div>
  )
}

export default function AIInsightsDrawer({ onClose }) {
  const {
    algorithm, algorithmType, explanation, timeComplexity, spaceComplexity,
    dataStructures, steps, currentStep, codeLines, analysisResult,
  } = useStore()

  const stepData = steps[currentStep] || null

  return (
    <motion.div
      className="fixed bottom-24 right-6 z-50 w-[380px] max-h-[70vh] flex flex-col rounded-2xl overflow-hidden"
      style={{
        background: 'rgba(8, 8, 12, 0.95)',
        backdropFilter: 'blur(30px)',
        border: '1px solid rgba(139,92,246,0.15)',
        boxShadow: '0 0 60px rgba(139,92,246,0.1), 0 20px 60px rgba(0,0,0,0.6)',
      }}
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 30, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border-default)] shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}>
            <Brain className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-xs font-bold text-[var(--color-text-primary)]">AI Insights</span>
        </div>
        <motion.button
          onClick={onClose}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--color-text-muted)] hover:text-white hover:bg-[var(--color-bg-hover)] cursor-pointer transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <X className="w-4 h-4" />
        </motion.button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Algorithm Card */}
        <div className="px-4 py-3 rounded-xl relative overflow-hidden" style={{
          background: 'linear-gradient(135deg, rgba(139,92,246,0.1), rgba(59,130,246,0.06))',
          border: '1px solid rgba(139,92,246,0.12)',
        }}>
          <div className="absolute top-0 right-0 w-20 h-20 rounded-full bg-violet-500/[0.06] blur-2xl" />
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-violet-400" />
            <span className="text-[9px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest">Detected Algorithm</span>
          </div>
          <div className="text-lg font-extrabold gradient-text">{algorithm}</div>
          <span className="inline-block mt-1.5 px-2 py-0.5 rounded-md text-[9px] font-bold bg-violet-500/12 text-violet-300 uppercase tracking-wider border border-violet-500/15">
            {algorithmType}
          </span>
        </div>

        {/* Complexity */}
        <div className="grid grid-cols-2 gap-2">
          <ComplexityCard icon={Clock} label="Time" value={timeComplexity} color="#fbbf24" bg="rgba(245,158,11,0.06)" border="rgba(245,158,11,0.12)" />
          <ComplexityCard icon={HardDrive} label="Space" value={spaceComplexity} color="#60a5fa" bg="rgba(59,130,246,0.06)" border="rgba(59,130,246,0.12)" />
        </div>

        {/* Data Structures */}
        {dataStructures.length > 0 && (
          <Section icon={Layers} title="Data Structures" iconColor="#22d3ee">
            <div className="flex flex-wrap gap-1.5">
              {dataStructures.map((ds) => (
                <span key={ds} className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-cyan-500/8 border border-cyan-500/12 text-cyan-300">{ds}</span>
              ))}
            </div>
          </Section>
        )}

        {/* Explanation */}
        <Section icon={Lightbulb} title="How It Works" iconColor="#fbbf24">
          <p className="text-[11px] text-[var(--color-text-secondary)] leading-[1.7]">{explanation}</p>
        </Section>

        {/* Current Step */}
        {stepData && (
          <>
            <div className="border-t border-[var(--color-border-default)] pt-3">
              <Section icon={ArrowRight} title={`Step ${currentStep + 1} Details`} iconColor="#a78bfa">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={currentStep}
                    className="text-[11px] text-[var(--color-text-secondary)] leading-[1.6] px-3 py-2 rounded-lg bg-[var(--color-bg-primary)]/60 border border-[var(--color-border-default)]"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    {stepData.description}
                  </motion.p>
                </AnimatePresence>
              </Section>
            </div>

            {/* Executing Line */}
            {stepData.line && codeLines[stepData.line - 1] && (
              <Section icon={Code2} title="Executing Line" iconColor="#60a5fa">
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--color-bg-primary)] border border-[var(--color-border-default)] overflow-x-auto">
                  <span className="text-[10px] font-mono font-bold text-blue-400/60 shrink-0">{stepData.line}</span>
                  <div className="w-px h-3.5 bg-[var(--color-border-default)]" />
                  <code className="text-[11px] font-mono text-blue-300 whitespace-pre">{codeLines[stepData.line - 1]?.trim()}</code>
                </div>
              </Section>
            )}

            {/* Variables */}
            {stepData.variables && Object.keys(stepData.variables).length > 0 && (
              <Section icon={Variable} title="Variables" iconColor="#34d399">
                <div className="space-y-1">
                  {Object.entries(stepData.variables).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-[var(--color-bg-primary)]/50 border border-[var(--color-border-default)]">
                      <div className="flex items-center gap-1.5">
                        <Hash className="w-2.5 h-2.5 text-emerald-500/40" />
                        <span className="text-[11px] font-mono font-bold text-emerald-300">{key}</span>
                      </div>
                      <span className="text-[11px] font-mono text-[var(--color-text-secondary)] max-w-[160px] truncate">
                        {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                      </span>
                    </div>
                  ))}
                </div>
              </Section>
            )}
          </>
        )}
      </div>
    </motion.div>
  )
}

function ComplexityCard({ icon: Icon, label, value, color, bg, border }) {
  return (
    <div className="px-3 py-2.5 rounded-xl" style={{ background: bg, border: `1px solid ${border}` }}>
      <div className="flex items-center gap-1 mb-1">
        <Icon className="w-3 h-3" style={{ color }} />
        <span className="text-[9px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">{label}</span>
      </div>
      <span className="text-sm font-extrabold font-mono" style={{ color }}>{value}</span>
    </div>
  )
}
