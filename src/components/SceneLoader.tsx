"use client"
import dynamic from 'next/dynamic'
import React from 'react'

// Dynamically import Scene, disabling SSR
const Scene = dynamic(() => import('./Scene'), { ssr: false })

const SceneLoader: React.FC = () => {
  return <Scene />
}

export default SceneLoader
