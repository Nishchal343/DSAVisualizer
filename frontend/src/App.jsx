/**
 * AlgoVision AI — Main Application Component
 * 2-panel layout: Left (Editor) | Right (Visualization + Controls)
 * Floating AI Insights drawer on bottom-right
 */

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Header from './components/Header.jsx'
import CodeEditor from './components/CodeEditor.jsx'
import VisualizationPanel from './components/VisualizationPanel.jsx'
import ExecutionControls from './components/ExecutionControls.jsx'
import LoadingOverlay from './components/LoadingOverlay.jsx'
import AIInsightsDrawer from './components/AIInsightsDrawer.jsx'
import useStore from './store/useStore.js'
import { Brain } from 'lucide-react'

export default function App() {
  const { isAnalyzing, analysisResult } = useStore()
  const [showInsights, setShowInsights] = useState(false)

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-[var(--color-bg-primary)]">
      {/* Header */}
      <Header />

      {/* Main Content — 2 panels */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel — Code Editor */}
        <motion.div
          className="w-[400px] min-w-[340px] flex flex-col border-r border-[var(--color-border-default)]"
          initial={{ x: -40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <CodeEditor />
        </motion.div>

        {/* Right Area — Visualization + Controls (full remaining width) */}
        <motion.div
          className="flex-1 flex flex-col overflow-hidden"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <VisualizationPanel />

          {/* Execution Controls */}
          <AnimatePresence>
            {analysisResult && (
              <motion.div
                initial={{ y: 60, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 60, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <ExecutionControls />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Floating AI Insights Button */}
      {analysisResult && (
        <motion.button
          onClick={() => setShowInsights(!showInsights)}
          className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-2xl flex items-center justify-center cursor-pointer"
          style={{
            background: showInsights
              ? 'linear-gradient(135deg, #4f46e5, #7c3aed)'
              : 'linear-gradient(135deg, #7c3aed, #4f46e5, #2563eb)',
            border: '1px solid rgba(139,92,246,0.3)',
            boxShadow: '0 0 30px rgba(139,92,246,0.25), 0 8px 32px rgba(0,0,0,0.4)',
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, delay: 0.3 }}
          whileHover={{ scale: 1.1, boxShadow: '0 0 50px rgba(139,92,246,0.4), 0 8px 40px rgba(0,0,0,0.5)' }}
          whileTap={{ scale: 0.92 }}
        >
          <Brain className="w-6 h-6 text-white" />
          {!showInsights && (
            <motion.div
              className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 flex items-center justify-center"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span className="text-[8px] font-bold text-white">AI</span>
            </motion.div>
          )}
        </motion.button>
      )}

      {/* AI Insights Drawer */}
      <AnimatePresence>
        {showInsights && (
          <AIInsightsDrawer onClose={() => setShowInsights(false)} />
        )}
      </AnimatePresence>

      {/* Loading Overlay */}
      <AnimatePresence>
        {isAnalyzing && <LoadingOverlay />}
      </AnimatePresence>
    </div>
  )
}
