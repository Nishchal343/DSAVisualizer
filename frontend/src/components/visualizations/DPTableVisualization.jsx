/**
 * AlgoVision AI — DP Table & Matrix Visualization (2D Grid)
 * Renders dynamic programming tables and matrix traversals with cell highlighting.
 */

import React from 'react'
import { motion } from 'framer-motion'

const CELL_COLORS = {
  default: 'rgba(255, 255, 255, 0.03)',
  active: 'rgba(139, 92, 246, 0.3)',
  filled: 'rgba(59, 130, 246, 0.2)',
  highlight: 'rgba(245, 158, 11, 0.3)',
}

export default function DPTableVisualization({ stepData, vizType, useMatrix = false }) {
  const table = useMatrix ? (stepData?.matrix || []) : (stepData?.dpTable || [])
  const highlights = stepData?.highlights || []
  const description = stepData?.description || ''
  const pointers = stepData?.pointers || {}

  if (!table || table.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-sm text-[var(--color-text-muted)]">
        No table data for this step
      </div>
    )
  }

  const rows = table.length
  const cols = table[0]?.length || 0
  const cellSize = Math.min(52, Math.max(32, 400 / Math.max(rows, cols)))

  // Determine highlighted cells
  const activeRow = pointers?.i ?? pointers?.row ?? -1
  const activeCol = pointers?.j ?? pointers?.col ?? -1

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-6 gap-4">
      {/* Description */}
      <motion.div
        key={stepData?.step}
        className="text-sm text-[var(--color-text-secondary)] text-center max-w-lg font-medium"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {description}
      </motion.div>

      {/* Table Grid */}
      <div className="overflow-auto max-h-[60%] max-w-full">
        <div className="inline-grid gap-1" style={{ gridTemplateColumns: `repeat(${cols}, ${cellSize}px)` }}>
          {table.map((row, i) =>
            row.map((cell, j) => {
              const isActive = i === activeRow && j === activeCol
              const isInRow = i === activeRow
              const isInCol = j === activeCol
              const cellIdx = i * cols + j
              const isHighlighted = highlights.includes(cellIdx)

              let bgColor = CELL_COLORS.default
              if (isActive) bgColor = CELL_COLORS.active
              else if (isHighlighted) bgColor = CELL_COLORS.highlight
              else if (cell !== 0 && cell !== null && cell !== undefined) bgColor = CELL_COLORS.filled

              return (
                <motion.div
                  key={`${i}-${j}`}
                  className="flex items-center justify-center rounded-md border font-mono text-xs font-semibold"
                  style={{
                    width: cellSize,
                    height: cellSize,
                    backgroundColor: bgColor,
                    borderColor: isActive
                      ? 'rgba(139, 92, 246, 0.5)'
                      : isInRow || isInCol
                      ? 'rgba(139, 92, 246, 0.15)'
                      : 'var(--color-border-default)',
                    color: isActive ? '#fff' : cell === 0 ? 'var(--color-text-muted)' : 'var(--color-text-secondary)',
                  }}
                  animate={{
                    scale: isActive ? 1.1 : 1,
                    boxShadow: isActive ? '0 0 16px rgba(139, 92, 246, 0.3)' : 'none',
                  }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                  {cell ?? '—'}
                </motion.div>
              )
            })
          )}
        </div>
      </div>

      {/* Row/Col Labels */}
      {Object.keys(pointers).length > 0 && (
        <div className="flex items-center gap-4">
          {Object.entries(pointers).map(([name, value]) => (
            <div
              key={name}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-violet-500/10 border border-violet-500/20"
            >
              <span className="text-[10px] font-mono font-bold text-violet-300">{name}</span>
              <span className="text-[10px] text-violet-400">=</span>
              <span className="text-xs font-mono font-bold text-violet-200">{value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
