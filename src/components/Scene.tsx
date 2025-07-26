'use client'

import React from 'react'
import { Canvas } from '@react-three/fiber'
import {
  OrbitControls,
  Stats,
} from '@react-three/drei'
import Map from './Map' // Import the Map component

const Scene: React.FC = () => {
  return (
    <Canvas
      shadows
      camera={{ position: [0, 200, 300], fov: 45 }} // Adjusted camera position
      style={{ width: '100%', height: '100%' }}
    >
      {/* A soft ambient fill and a bright key light */}
      <ambientLight intensity={0.5} />
      <directionalLight
        castShadow
        position={[100, 200, 100]}
        intensity={1}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />

      <Map />

      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        target={[0, 0, 0]} // Center the controls on the map
      />

      <Stats />
    </Canvas>
  )
}

export default Scene
