"use client"
import React, { Suspense, useState, useEffect, useRef, FC } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PointerLockControls, Sky, Environment, Sparkles, Box, Sphere, Cylinder, Plane } from '@react-three/drei';
import { PointerLockControls as PointerLockControlsImpl } from 'three-stdlib';
import * as THREE from 'three';

// --- TYPE DEFINITIONS ---

interface Space {
  id: string;
  name: string;
  description: string;
}

interface LobbyProps {
  spaces: Space[];
  onSelectSpace: (id: string) => void;
}

interface SpaceViewProps {
  spaceId: string;
  onExit: () => void;
}

interface SceneProps {
  spaceId: string;
}

// --- MAIN COMPONENTS ---

// Main App Component
// This component manages the state of the application, switching between the lobby and the 3D spaces.
const App: FC = () => {
  const [activeSpace, setActiveSpace] = useState<string | null>(null);

  const spaces: Space[] = [
    { id: 'zen-garden', name: 'Zen Garden', description: 'A tranquil garden for meditation and peace.' },
    { id: 'neon-rooftop', name: 'Neon Rooftop', description: 'A vibrant, futuristic city overlook.' },
    { id: 'floating-island', name: 'Floating Island', description: 'A magical island floating in the sky.' },
  ];

  if (activeSpace) {
    return <SpaceView spaceId={activeSpace} onExit={() => setActiveSpace(null)} />;
  }

  return <Lobby spaces={spaces} onSelectSpace={setActiveSpace} />;
}
export default App;


// Lobby Component: The selection screen for the spaces
const Lobby: FC<LobbyProps> = ({ spaces, onSelectSpace }) => {
  return (
    <div className="relative w-full h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-8">
       <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
       <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-gray-900 to-black"></div>
       <div className="relative z-10 text-center mb-12">
            <h1 className="text-5xl md:text-7xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
                Virtual Spaces
            </h1>
            <p className="text-lg text-gray-300">Select a world to explore</p>
       </div>
       <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
        {spaces.map((space) => (
          <div 
            key={space.id} 
            className="bg-gray-800/50 backdrop-blur-md rounded-xl p-6 border border-gray-700/50 cursor-pointer transition-all duration-300 hover:border-purple-500 hover:bg-gray-800/70 hover:scale-105"
            onClick={() => onSelectSpace(space.id)}
          >
            <h2 className="text-2xl font-bold mb-2 text-purple-300">{space.name}</h2>
            <p className="text-gray-400">{space.description}</p>
          </div>
        ))}
       </div>
       <style jsx global>{`
        .bg-grid-pattern {
            background-image: linear-gradient(rgba(255, 255, 255, 0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.07) 1px, transparent 1px);
            background-size: 2rem 2rem;
        }
       `}</style>
    </div>
  );
}

// SpaceView Component: Renders the 3D canvas and the selected scene
const SpaceView: FC<SpaceViewProps> = ({ spaceId, onExit }) => {
  return (
    <div className="w-full h-screen bg-black">
      <Canvas shadows camera={{ fov: 75, position: [0, 1.6, 5] }}>
        <Suspense fallback={null}>
          <Scene spaceId={spaceId} />
          <Player />
        </Suspense>
      </Canvas>
      <div className="absolute top-4 left-4 z-20">
        <button 
          onClick={onExit}
          className="px-4 py-2 bg-gray-800/50 text-white rounded-lg backdrop-blur-md border border-gray-700/50 hover:bg-gray-700/70 transition-colors"
        >
          Exit Space
        </button>
      </div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 z-10">
        <div className="w-2 h-2 bg-white rounded-full opacity-50"></div>
      </div>
    </div>
  );
}

// Scene Component: Contains the shared lighting and environment, and renders the specific space
const Scene: FC<SceneProps> = ({ spaceId }) => {
  return (
    <>
      {/* Shared Lighting & Environment */}
      <ambientLight intensity={0.2} />
      <directionalLight
        castShadow
        position={[5, 10, 7]}
        intensity={1.5}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-15}
        shadow-camera-right={15}
        shadow-camera-top={15}
        shadow-camera-bottom={-15}
      />
      
      {/* Conditional rendering of the selected space */}
      {spaceId === 'zen-garden' && <ZenGarden />}
      {spaceId === 'neon-rooftop' && <NeonRooftop />}
      {spaceId === 'floating-island' && <FloatingIsland />}
    </>
  );
}

// --- SPACE DEFINITIONS ---

const ZenGarden: FC = () => {
  return (
    <>
      <Sky sunPosition={[5, 10, 7]} />
      <Environment preset="sunset" />
      <Plane args={[100, 100]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <meshStandardMaterial color="#c2b280" />
      </Plane>
      <Box args={[8, 0.2, 12]} position={[0, 0.1, 0]} castShadow>
        <meshStandardMaterial color="#334" />
      </Box>
      <Plane args={[7.8, 11.8]} position={[0, 0.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <meshStandardMaterial color="lightblue" transparent opacity={0.7} />
      </Plane>
      <Sphere position={[-3, 0.5, 2]} args={[0.5]} castShadow>
        <meshStandardMaterial color="gray" />
      </Sphere>
      <Sphere position={[-2.5, 0.3, 2.5]} args={[0.3]} castShadow>
        <meshStandardMaterial color="dimgray" />
      </Sphere>
      <Cylinder position={[5, 1.5, -5]} args={[0.2, 0.3, 3]} castShadow>
        <meshStandardMaterial color="saddlebrown" />
      </Cylinder>
      <Sphere position={[5, 3.5, -5]} args={[1.5]} castShadow>
        <meshStandardMaterial color="pink" />
      </Sphere>
    </>
  );
}

const NeonRooftop: FC = () => {
  return (
    <>
      <color attach="background" args={['#101015']} />
      <fog attach="fog" args={['#101015', 10, 40]} />
      <Environment preset="city" />
      <Plane args={[30, 30]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <meshStandardMaterial color="#333" metalness={0.8} roughness={0.4} />
      </Plane>
      <Box args={[3, 1, 0.2]} position={[-10, 5, -15]}>
        <meshStandardMaterial emissive="purple" emissiveIntensity={5} toneMapped={false}/>
      </Box>
      <Box args={[4, 1.5, 0.2]} position={[8, 7, -15]}>
        <meshStandardMaterial emissive="cyan" emissiveIntensity={5} toneMapped={false}/>
      </Box>
      <pointLight position={[-10, 5, -14]} color="purple" distance={10} intensity={10} />
      <pointLight position={[8, 7, -14]} color="cyan" distance={10} intensity={10} />
      <Box args={[5, 15, 5]} position={[-15, 7.5, 0]} castShadow>
        <meshStandardMaterial color="#222" />
      </Box>
      <Box args={[6, 10, 6]} position={[15, 5, -5]} castShadow>
        <meshStandardMaterial color="#1a1a1a" />
      </Box>
    </>
  );
}

const FloatingIsland: FC = () => {
  return (
    <>
      <Sky />
      <Environment preset="dawn" />
      <fog attach="fog" args={['#aaccff', 0, 100]} />
      <Sparkles count={200} scale={20} size={2} speed={0.4} color="orange" />
      <Cylinder args={[8, 10, 4, 16]} position={[0, -2, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="dirt" />
      </Cylinder>
      <Plane args={[16, 16]} position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <meshStandardMaterial color="green" />
      </Plane>
      <Cylinder args={[4, 5, 3, 12]} position={[15, -5, -10]} castShadow receiveShadow>
        <meshStandardMaterial color="dirt" />
      </Cylinder>
      <Plane args={[8, 8]} position={[15, -3.4, -10]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <meshStandardMaterial color="green" />
      </Plane>
      <Sphere position={[0, 2, 0]} args={[1, undefined, 6]}>
        <meshStandardMaterial color="aqua" emissive="cyan" emissiveIntensity={2} transparent opacity={0.8} />
      </Sphere>
      <pointLight position={[0, 2, 0]} color="cyan" distance={15} intensity={5} />
    </>
  );
}


// Player Component: Handles first-person controls and movement
const Player: FC = () => {
  const controlsRef = useRef<PointerLockControlsImpl>(null!);
  const moveForward = useRef(false);
  const moveBackward = useRef(false);
  const moveLeft = useRef(false);
  const moveRight = useRef(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'ArrowUp': moveForward.current = true; break;
        case 'ArrowDown': moveBackward.current = true; break;
        case 'ArrowLeft': moveLeft.current = true; break;
        case 'ArrowRight': moveRight.current = true; break;
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'ArrowUp': moveForward.current = false; break;
        case 'ArrowDown': moveBackward.current = false; break;
        case 'ArrowLeft': moveLeft.current = false; break;
        case 'ArrowRight': moveRight.current = false; break;
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useFrame((state, delta) => {
    const { camera } = state;
    const speed = 5 * delta;
    
    if (controlsRef.current?.isLocked) {
        if (moveForward.current) controlsRef.current.moveForward(speed);
        if (moveBackward.current) controlsRef.current.moveForward(-speed);
        if (moveRight.current) controlsRef.current.moveRight(speed);
        if (moveLeft.current) controlsRef.current.moveRight(-speed);
    }
    
    // A more stable way to handle gravity and ground collision
    // This simulates falling.
    let newY = camera.position.y - (9.8 * delta);
    // This prevents falling through the floor.
    if (newY < 1.6) {
        newY = 1.6;
    }
    camera.position.y = newY;
  });

  return <PointerLockControls ref={controlsRef} />;
}
