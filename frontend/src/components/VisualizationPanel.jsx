/**
 * AlgoVision AI — Visualization Panel (Center)
 * Routes to 2D or 3D visualization based on backend response.
 */

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, Layers, Box } from 'lucide-react'
import useStore from '../store/useStore.js'
import ArrayVisualization from './visualizations/ArrayVisualization.jsx'
import TreeGraphVisualization from './visualizations/TreeGraphVisualization.jsx'
import DPTableVisualization from './visualizations/DPTableVisualization.jsx'
import EmptyState from './EmptyState.jsx'

export default function VisualizationPanel() {
  const { analysisResult, visualizationType, renderMode, currentStep, steps } = useStore()

  const stepData = steps[currentStep] || null

  const renderVisualization = () => {
    if (!analysisResult || !stepData) {
      return <EmptyState />
    }

    const vizType = visualizationType || '2d-array'

    // Route to correct visualization component
    if (vizType.startsWith('3d-') || renderMode === '3d') {
      return <TreeGraphVisualization stepData={stepData} vizType={vizType} />
    }

    if (vizType === '2d-grid' || vizType === '2d-table') {
      if (stepData.dpTable) {
        return <DPTableVisualization stepData={stepData} vizType={vizType} />
      }
      if (stepData.matrix) {
        return <DPTableVisualization stepData={stepData} vizType={vizType} useMatrix />
      }
    }

    // Default: array-based 2D visualization
    return <ArrayVisualization stepData={stepData} vizType={vizType} />
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Panel Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--color-border-default)] bg-[var(--color-bg-secondary)]/50 shrink-0">
        <div className="flex items-center gap-2">
          <Eye className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
          <span className="text-xs font-semibold text-[var(--color-text-secondary)] tracking-wide uppercase">
            Visualization
          </span>
        </div>
        {analysisResult && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-[var(--color-bg-tertiary)] border border-[var(--color-border-default)]">
              {renderMode === '3d' ? (
                <Box className="w-3 h-3 text-cyan-400" />
              ) : (
                <Layers className="w-3 h-3 text-violet-400" />
              )}
              <span className="text-[10px] font-medium text-[var(--color-text-muted)]">
                {renderMode?.toUpperCase()} • {visualizationType}
              </span>
            </div>
            <span className="text-[10px] font-mono text-[var(--color-text-muted)]">
              Step {currentStep + 1}/{steps.length}
            </span>
          </div>
        )}
      </div>

      {/* Visualization Canvas */}
      <div className="flex-1 viz-container viz-grid-bg overflow-hidden relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={visualizationType || 'empty'}
            className="w-full h-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {renderVisualization()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
