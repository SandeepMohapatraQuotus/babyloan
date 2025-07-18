'use client'

import React from 'react'
import { Canvas } from '@react-three/fiber'
import {
  OrbitControls,
  Stats,
  Environment,
  ContactShadows,
  Html,
} from '@react-three/drei'
import { create } from 'zustand'

// Zustand store (same as before)
interface StoreState {
  color: string
  setColor: (color: string) => void
}
export const useStore = create<StoreState>((set) => ({
  color: 'orange',
  setColor: (color) => set({ color }),
}))

const Box: React.FC = () => {
  const color = useStore((s) => s.color)

  return (
    <mesh rotation={[0.4, 0.6, 0]}>
      {/* Use a more advanced, physically‑based material */}
      <boxGeometry args={[200, 200, 200]} />
      <meshPhysicalMaterial
        color={color}
        metalness={0.7}      // makes it reflective
        roughness={0.2}      // smooth surface
        clearcoat={1}        // adds an extra glossy layer
        clearcoatRoughness={0.1}
      />
      {/* Add a little HTML label that always faces camera */}
      <Html distanceFactor={10} position={[0, 120, 0]}>
        <div style={{
          background: 'rgba(255,255,255,0.8)',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '14px',
          fontWeight: 'bold'
        }}>
          Shiny Box
        </div>
      </Html>
    </mesh>
  )
}

const Scene: React.FC = () => {
  return (
    <Canvas
      shadows
      camera={{ position: [250, 250, 250], fov: 45 }}
      style={{ width: '100%', height: '100%' }}
    >
      {/* A soft ambient fill and a bright key light */}
      <ambientLight intensity={0.3} />
      <directionalLight
        castShadow
        position={[100, 200, 100]}
        intensity={1.2}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />

      {/* Ground shadow underneath */}
      <ContactShadows
        position={[0, -100, 0]}
        opacity={0.6}
        width={600}
        height={600}
        blur={2}
        far={200}
      />

      {/* HDRI environment for realistic reflections */}
      <Environment preset="sunset" />

      <Box />

      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
      />

      <Stats />
    </Canvas>
  )
}

export default Scene
