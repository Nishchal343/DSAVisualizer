/**
 * AlgoVision AI — Tree & Graph Visualization (3D)
 * Uses React Three Fiber for immersive 3D rendering of trees, graphs, and recursion stacks.
 */

import React, { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Text, Line, Billboard } from '@react-three/drei'
import { motion } from 'framer-motion'
import * as THREE from 'three'

function NodeSphere({ position, value, isActive, isVisited }) {
  const ref = useRef()
  const color = isActive ? '#8b5cf6' : isVisited ? '#10b981' : '#3b3b4f'
  const emissive = isActive ? '#8b5cf6' : '#000000'
  const emissiveIntensity = isActive ? 0.4 : 0

  useFrame((state) => {
    if (ref.current && isActive) {
      ref.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 3) * 0.08)
    }
  })

  return (
    <group position={position}>
      <mesh ref={ref}>
        <sphereGeometry args={[0.4, 32, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={emissive}
          emissiveIntensity={emissiveIntensity}
          roughness={0.3}
          metalness={0.2}
        />
      </mesh>
      <Billboard>
        <Text
          position={[0, 0, 0.5]}
          fontSize={0.25}
          color="white"
          fontWeight="bold"
          anchorX="center"
          anchorY="middle"
        >
          {String(value)}
        </Text>
      </Billboard>
      {isActive && (
        <mesh>
          <sphereGeometry args={[0.55, 32, 32]} />
          <meshStandardMaterial
            color="#8b5cf6"
            transparent
            opacity={0.15}
            wireframe
          />
        </mesh>
      )}
    </group>
  )
}

function EdgeLine({ start, end, isActive }) {
  const color = isActive ? '#8b5cf6' : '#2a2a3a'
  const points = [new THREE.Vector3(...start), new THREE.Vector3(...end)]

  return (
    <Line
      points={points}
      color={color}
      lineWidth={isActive ? 3 : 1.5}
      opacity={isActive ? 1 : 0.4}
      transparent
    />
  )
}

function Scene({ nodes, edges, activeNodes, activeEdges }) {
  const positionedNodes = useMemo(() => {
    if (!nodes || nodes.length === 0) return []

    return nodes.map((node, i) => {
      // Use provided positions or auto-layout in a tree/force layout
      let x = node.x ?? 0
      let y = node.y ?? 0
      let z = node.z ?? 0

      if (node.x === undefined) {
        // Simple auto-layout: spread nodes in a circle
        const angle = (i / nodes.length) * Math.PI * 2
        const radius = Math.max(2, nodes.length * 0.4)
        x = Math.cos(angle) * radius
        y = Math.sin(angle) * radius
        z = 0
      }

      return { ...node, position: [x, -y, z] }
    })
  }, [nodes])

  const activeNodeIds = new Set(activeNodes || [])
  const activeEdgeSet = new Set((activeEdges || []).map((e) => `${e.from}-${e.to}`))

  const nodeMap = useMemo(() => {
    const map = {}
    positionedNodes.forEach((n) => {
      map[n.id] = n.position
    })
    return map
  }, [positionedNodes])

  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={0.8} />
      <pointLight position={[-10, -10, -10]} intensity={0.3} color="#8b5cf6" />

      {/* Edges */}
      {(edges || []).map((edge, i) => {
        const start = nodeMap[edge.from]
        const end = nodeMap[edge.to]
        if (!start || !end) return null
        const isActive = activeEdgeSet.has(`${edge.from}-${edge.to}`)
        return <EdgeLine key={`edge-${i}`} start={start} end={end} isActive={isActive} />
      })}

      {/* Nodes */}
      {positionedNodes.map((node) => (
        <NodeSphere
          key={node.id}
          position={node.position}
          value={node.value ?? node.id}
          isActive={activeNodeIds.has(String(node.id)) || activeNodeIds.has(Number(node.id))}
          isVisited={false}
        />
      ))}

      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        rotateSpeed={0.5}
        minDistance={3}
        maxDistance={20}
      />
    </>
  )
}

export default function TreeGraphVisualization({ stepData, vizType }) {
  const nodes = stepData?.nodes || []
  const edges = stepData?.edges || []
  const activeNodes = stepData?.activeNodes || []
  const activeEdges = stepData?.activeEdges || []
  const description = stepData?.description || ''
  const callStack = stepData?.callStack || []

  if (nodes.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-sm text-[var(--color-text-muted)]">
        No graph/tree data for this step
      </div>
    )
  }

  return (
    <div className="w-full h-full relative">
      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 0, 8], fov: 50 }}
        style={{ background: 'transparent' }}
      >
        <Scene
          nodes={nodes}
          edges={edges}
          activeNodes={activeNodes}
          activeEdges={activeEdges}
        />
      </Canvas>

      {/* Overlay: Description */}
      <motion.div
        key={stepData?.step}
        className="absolute top-4 left-4 right-4 text-sm text-[var(--color-text-secondary)] text-center font-medium bg-[var(--color-bg-primary)]/80 backdrop-blur-sm rounded-lg px-3 py-2 border border-[var(--color-border-default)]"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {description}
      </motion.div>

      {/* Call Stack Overlay */}
      {callStack.length > 0 && (
        <div className="absolute bottom-4 right-4 flex flex-col gap-1">
          <span className="text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1">
            Call Stack
          </span>
          {callStack.map((call, i) => (
            <motion.div
              key={i}
              className="px-2.5 py-1 rounded text-xs font-mono bg-violet-500/10 border border-violet-500/20 text-violet-300"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: i * 0.05 }}
            >
              {call}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
