// App.tsx
"use client";
import React, { Suspense, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { Sky, Environment, OrthographicCamera } from '@react-three/drei';
import { EffectComposer, Bloom, SSAO, DepthOfField, Vignette, ChromaticAberration, Noise } from '@react-three/postprocessing';
import * as THREE from 'three';
import Player from './Player';
import CameraRig from './CameraRig';
import { usePlayerStore } from './store';
import AtmosphericEffects from './AtmosphericEffects';
import RealisticEnvironment from './Environment';

// --- MAIN COMPONENTS ---
const App: React.FC = () => <SpaceView />;
export default App;

const SpaceView: React.FC = () => {
  const obstacles = useMemo(() => [
    { x: -150, z: 100, width: 30, depth: 30 },
    { x: -125, z: 125, width: 18, depth: 18 },
    { x: -160, z: 115, width: 12, depth: 12 },
    { x: 200, z: -200, width: 90, depth: 90 },
    { x: 0, z: 0, width: 240, depth: 360 }, // Water obstacle
    { x: 300, z: 150, width: 60, depth: 60 },
    { x: -300, z: -100, width: 40, depth: 80 },
    { x: 150, z: 300, width: 50, depth: 50 },
  ], []);

  const mapBoundaries = useMemo(() => ({
    minX: -500, maxX: 500, minZ: -500, maxZ: 500
  }), []);

  const { position: playerPosition } = usePlayerStore(); // Get player position for UI

  return (
    <div className="w-full h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden font-sans">
      {/* Enhanced UI Overlay */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-10 p-6">
        {/* Top-Left Info Panel */}
        <div className="absolute top-6 left-6 bg-black/60 backdrop-blur-md text-white p-5 rounded-2xl border border-cyan-600/40 shadow-xl flex flex-col space-y-3 animate-fade-in">
          <div className="flex items-center space-x-3">
            <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse-slow"></div>
            <p className="font-extrabold text-lg text-cyan-400 uppercase tracking-wider">Virtual Space Online</p>
          </div>
          <p className="text-sm text-gray-300 font-light">Navigate with <strong className="text-white">Arrow Keys</strong> or <strong className="text-white">WASD</strong></p>
          <div className="flex items-center text-xs text-gray-400 pt-2 border-t border-gray-700/50">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>Map Grid: <span className="font-semibold">1000x1000 units</span></span>
          </div>
        </div>

        {/* Top-Right Status Panel */}
        <div className="absolute top-6 right-6 bg-black/60 backdrop-blur-md text-white p-5 rounded-2xl border border-purple-600/40 shadow-xl flex flex-col space-y-3 animate-fade-in">
          <p className="text-lg font-extrabold text-purple-400 uppercase tracking-wider">System Status</p>
          <div className="flex items-center space-x-3 mt-1">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
            <p className="text-sm text-gray-300 font-light">Core Systems: <strong className="text-white">Online & Stable</strong></p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-yellow-500 rounded-full animate-bounce-slow"></div>
            <p className="text-sm text-gray-300 font-light">Network Latency: <strong className="text-white">Optimal</strong></p>
          </div>
        </div>

        {/* Bottom-Left Decorative Bar (Progress/Loading Indicator) */}
        <div className="absolute bottom-6 left-6 w-72 h-3 bg-gray-800/70 rounded-full overflow-hidden border border-gray-600/50 shadow-inner">
          <div className="h-full w-4/5 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full animate-progress-fill"></div>
          <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-white/80">
            LOADING...
          </div>
        </div>

        {/* Central Focus Element (Optional, for future use or current player info) */}
        <div className="absolute bottom-6 right-6 bg-black/60 backdrop-blur-md text-white p-4 rounded-xl border border-teal-500/40 shadow-xl flex items-center space-x-3 opacity-90 animate-fade-in-up">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm font-semibold text-teal-300">Player Coordinates: <span className="text-white">{playerPosition.x.toFixed(0)}, {playerPosition.z.toFixed(0)}</span></p>
        </div>

      </div>

      <Canvas shadows dpr={[1, 2]} gl={{ antialias: true, alpha: false }}>
        <OrthographicCamera makeDefault zoom={40} position={[0, 40, 100]} />
        <Suspense fallback={null}>
          {/* Enhanced Lighting */}
          <ambientLight intensity={0.4} color="#4a5568" />
          <directionalLight
            castShadow
            position={[10, 20, 5]}
            intensity={1.5}
            color="#ffffff"
            shadow-mapSize-width={4096}
            shadow-mapSize-height={4096}
            shadow-camera-left={-500}
            shadow-camera-right={500}
            shadow-camera-top={500}
            shadow-camera-bottom={-500}
          />
          <pointLight position={[0, 10, 0]} intensity={0.8} color="#00ffff" distance={100} />
          <pointLight position={[200, 15, -200]} intensity={0.6} color="#ff00ff" distance={150} />
          <pointLight position={[-200, 15, 200]} intensity={0.6} color="#ffff00" distance={150} />

          <Sky
            sunPosition={[10, 20, 5]}
            inclination={0.6}
            azimuth={0.25}
            mieCoefficient={0.005}
            mieDirectionalG={0.8}
            rayleigh={0.5}
          />
          <Environment preset="night" />

          <RealisticEnvironment />
          <Player obstacles={obstacles} boundaries={mapBoundaries} />
          <CameraRig />
          <AtmosphericEffects />

          {/* Enhanced Post-processing */}
          <EffectComposer multisampling={8}>
            <DepthOfField
              focusDistance={0.02}
              focalLength={0.05}
              bokehScale={3}
              height={480}
            />
            <Bloom
              intensity={1.2}
              luminanceThreshold={0.1}
              luminanceSmoothing={0.9}
              height={300}
              kernelSize={5}
            />
            <SSAO
              radius={0.3}
              intensity={25}
              luminanceInfluence={0.4}
              color={new THREE.Color('black')}
            />
            <Vignette offset={0.3} darkness={0.5} />
            <ChromaticAberration offset={[0.001, 0.001]} />
            <Noise opacity={0.025} />
          </EffectComposer>
        </Suspense>
      </Canvas>
    </div>
  );
};