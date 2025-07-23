"use client"
import React, { Suspense, useEffect, useRef, FC, useMemo } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { Sky, Environment, Sphere, Cylinder, Plane, OrthographicCamera, Billboard, Text, Cloud } from '@react-three/drei';
import { EffectComposer, Bloom, SSAO, DepthOfField, Vignette, ChromaticAberration, Noise } from '@react-three/postprocessing';
import * as THREE from 'three';
import { create } from 'zustand';

// --- STATE MANAGEMENT (ZUSTAND) ---
interface PlayerState {
  position: THREE.Vector3;
  setPosition: (newPosition: THREE.Vector3) => void;
}

const usePlayerStore = create<PlayerState>((set) => ({
  // FIX: Moved initial position to a safe spot outside the water obstacle
  position: new THREE.Vector3(0, 1, 200), 
  setPosition: (newPosition) => set({ position: newPosition }),
}));

// --- MAIN COMPONENTS ---
const App: FC = () => <SpaceView />;
export default App;

const SpaceView: FC = () => {
    const obstacles = useMemo(() => [
        { x: -150, z: 100, width: 30, depth: 30 }, 
        { x: -125, z: 125, width: 18, depth: 18 }, 
        { x: -160, z: 115, width: 12, depth: 12 },
        { x: 200, z: -200, width: 90, depth: 90 }, 
        { x: 0, z: 0, width: 240, depth: 360 },
        { x: 300, z: 150, width: 60, depth: 60 },
        { x: -300, z: -100, width: 40, depth: 80 },
        { x: 150, z: 300, width: 50, depth: 50 },
    ], []);
    
    const mapBoundaries = useMemo(() => ({ 
        minX: -500, maxX: 500, minZ: -500, maxZ: 500 
    }), []);

    return (
        <div className="w-full h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
            {/* Enhanced UI Overlay */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-10">
                <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-lg text-white p-4 rounded-xl border border-cyan-500/30 shadow-2xl">
                    <div className="flex items-center space-x-2 mb-2">
                        <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                        <p className="font-bold text-cyan-300">VIRTUAL SPACE</p>
                    </div>
                    <p className="text-sm text-gray-300">Use Arrow Keys to navigate</p>
                    <p className="text-xs text-gray-400 mt-1">Map: 1000x1000 units</p>
                </div>
                
                <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-lg text-white p-4 rounded-xl border border-purple-500/30 shadow-2xl">
                    <p className="text-sm font-semibold text-purple-300">Status</p>
                    <div className="flex items-center space-x-2 mt-1">
                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                        <p className="text-xs text-gray-300">Systems Online</p>
                    </div>
                </div>
                
                {/* Decorative UI Elements */}
                <div className="absolute bottom-4 left-4 w-64 h-2 bg-gray-800/50 rounded-full overflow-hidden">
                    <div className="h-full w-3/4 bg-gradient-to-r from-cyan-500 to-purple-500 animate-pulse"></div>
                </div>
            </div>

            <Canvas shadows dpr={[1, 2]} gl={{ antialias: true, alpha: false }}>
                <OrthographicCamera makeDefault zoom={40} position={[0, 20, 20]} />
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

// --- ENHANCED ENVIRONMENT ---
const RealisticEnvironment: FC = () => {
    const grassTexture = useMemo(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d')!;
        
        // Create grass texture
        ctx.fillStyle = '#2d5016';
        ctx.fillRect(0, 0, 512, 512);
        
        for (let i = 0; i < 1000; i++) {
            const x = Math.random() * 512;
            const y = Math.random() * 512;
            const shade = Math.random() * 0.3 + 0.7;
            ctx.fillStyle = `rgb(${Math.floor(45 * shade)}, ${Math.floor(80 * shade)}, ${Math.floor(22 * shade)})`;
            ctx.fillRect(x, y, 2, 2);
        }
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(50, 50);
        return texture;
    }, []);

    const waterTexture = useMemo(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d')!;
        
        // Create water texture with ripples
        const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
        gradient.addColorStop(0, '#1e40af');
        gradient.addColorStop(0.5, '#3b82f6');
        gradient.addColorStop(1, '#1e3a8a');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 256, 256);
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(10, 10);
        return texture;
    }, []);

    return (
        <>
            {/* Enhanced Ground */}
            <Plane args={[1000, 1000]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                <meshStandardMaterial 
                    map={grassTexture}
                    roughness={0.9} 
                    metalness={0.1}
                    normalScale={[0.5, 0.5]}
                />
            </Plane>
            
            {/* Water Feature */}
            <Plane args={[240, 360]} position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <meshStandardMaterial 
                    map={waterTexture}
                    color="#1e40af" 
                    opacity={0.8} 
                    transparent 
                    metalness={0.8} 
                    roughness={0.1}
                    envMapIntensity={1}
                />
            </Plane>
            
            {/* Enhanced Rock Formations */}
            <group position={[-150, 0, 100]}>
                <Sphere position={[0, 15, 0]} args={[15, 32, 32]} castShadow>
                    <meshStandardMaterial color="#4a5568" roughness={0.8} metalness={0.2} />
                </Sphere>
                <Sphere position={[-5, 9, 5]} args={[9, 32, 32]} castShadow>
                    <meshStandardMaterial color="#2d3748" roughness={0.9} metalness={0.1} />
                </Sphere>
                <Sphere position={[-8, 6, -3]} args={[6, 32, 32]} castShadow>
                    <meshStandardMaterial color="#4a5568" roughness={0.7} metalness={0.3} />
                </Sphere>
            </group>
            
            {/* Enhanced Trees */}
            <group position={[200, 0, -200]}>
                {Array.from({ length: 9 }, (_, i) => {
                    const angle = (i / 9) * Math.PI * 2;
                    const radius = 20 + Math.random() * 25;
                    const x = Math.cos(angle) * radius;
                    const z = Math.sin(angle) * radius;
                    const height = 40 + Math.random() * 20;
                    
                    return (
                        <group key={i} position={[x, 0, z]}>
                            <Cylinder position={[0, height/2, 0]} args={[2 + Math.random(), 3 + Math.random(), height]} castShadow>
                                <meshStandardMaterial color="#8b4513" roughness={0.8} />
                            </Cylinder>
                            <Sphere position={[0, height + 15, 0]} args={[12 + Math.random() * 6, 16, 16]} castShadow>
                                <meshStandardMaterial color="#228b22" roughness={0.9} />
                            </Sphere>
                            <Sphere position={[5, height + 12, 3]} args={[8 + Math.random() * 3, 16, 16]} castShadow>
                                <meshStandardMaterial color="#32cd32" roughness={0.9} />
                            </Sphere>
                            <Sphere position={[-4, height + 10, -2]} args={[10 + Math.random() * 4, 16, 16]} castShadow>
                                <meshStandardMaterial color="#006400" roughness={0.9} />
                            </Sphere>
                        </group>
                    );
                })}
            </group>
            
            {/* Additional Environmental Elements */}
            <group position={[300, 0, 150]}>
                <Cylinder position={[0, 15, 0]} args={[30, 25, 30]} castShadow>
                    <meshStandardMaterial color="#8b7355" roughness={0.7} />
                </Cylinder>
            </group>
            
            <group position={[-300, 0, -100]}>
                <Cylinder position={[0, 10, 0]} args={[20, 20, 20]} castShadow>
                    <meshStandardMaterial color="#5a5a5a" roughness={0.8} />
                </Cylinder>
                <Cylinder position={[0, 30, 0]} args={[40, 35, 40]} castShadow>
                    <meshStandardMaterial color="#696969" roughness={0.7} />
                </Cylinder>
            </group>
        </>
    );
};

// --- ATMOSPHERIC EFFECTS ---
const AtmosphericEffects: FC = () => {
    const cloudsRef = useRef<THREE.Group>(null!);
    
    useFrame((state) => {
        if (cloudsRef.current) {
            cloudsRef.current.rotation.y += 0.0002;
        }
    });

    return (
        <group ref={cloudsRef}>
            {Array.from({ length: 20 }, (_, i) => (
                <Cloud
                    key={i}
                    position={[
                        (Math.random() - 0.5) * 800,
                        50 + Math.random() * 30,
                        (Math.random() - 0.5) * 800
                    ]}
                    speed={0.1}
                    opacity={0.3}
                    growth={5}
                    volume={10}
                    color="#ffffff"
                />
            ))}
        </group>
    );
};

// --- ENHANCED PLAYER ---
const createCharacterTexture = (draw: (ctx: CanvasRenderingContext2D) => void, flip = false) => {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 256;
    const context = canvas.getContext('2d')!;
    context.imageSmoothingEnabled = false;
    
    if (flip) {
        context.scale(-1, 1);
        context.translate(-canvas.width, 0);
    }
    draw(context);
    return new THREE.CanvasTexture(canvas);
};

interface PlayerProps {
    obstacles: { x: number, z: number, width: number, depth: number }[];
    boundaries: { minX: number, maxX: number, minZ: number, maxZ: number };
}

const Player: FC<PlayerProps> = ({ obstacles, boundaries }) => {
    const groupRef = useRef<THREE.Group>(null!);
    const materialRef = useRef<THREE.MeshStandardMaterial>(null!);
    const { position, setPosition } = usePlayerStore();
    const direction = useRef<'front' | 'back' | 'left' | 'right'>('front');
    const movement = useRef({ forward: false, backward: false, left: false, right: false });

    const textures = useMemo(() => {
        const drawHeadAndBody = (ctx: CanvasRenderingContext2D) => {
            // Enhanced character rendering with better details
            ctx.fillStyle = '#2c3e50'; ctx.fillRect(32, 100, 64, 100);
            ctx.fillStyle = '#f4d1a6'; 
            ctx.beginPath(); 
            ctx.arc(64, 64, 32, 0, Math.PI * 2); 
            ctx.fill();
            
            // Add shading
            ctx.fillStyle = '#e8c4a0';
            ctx.beginPath();
            ctx.arc(72, 56, 20, 0, Math.PI);
            ctx.fill();
        };
        
        const drawFront = (ctx: CanvasRenderingContext2D, step: number) => {
            drawHeadAndBody(ctx);
            // Eyes
            ctx.fillStyle = 'black'; 
            ctx.beginPath(); 
            ctx.arc(52, 64, 6, 0, Math.PI * 2); 
            ctx.arc(76, 64, 6, 0, Math.PI * 2); 
            ctx.fill();
            
            // Legs with animation
            ctx.fillStyle = '#34495e';
            if (step === 0) { 
                ctx.fillRect(36, 200, 24, 40); 
                ctx.fillRect(68, 200, 24, 40); 
            } else if (step === 1) { 
                ctx.fillRect(32, 200, 28, 40); 
                ctx.fillRect(68, 200, 28, 30); 
            } else { 
                ctx.fillRect(32, 200, 28, 30); 
                ctx.fillRect(68, 200, 28, 40); 
            }
            
            // Arms
            ctx.fillStyle = '#f4d1a6'; 
            ctx.fillRect(12, 100, 20, 70); 
            ctx.fillRect(96, 100, 20, 70);
        };
        
        const drawBack = (ctx: CanvasRenderingContext2D, step: number) => {
            drawHeadAndBody(ctx);
            // Hair
            ctx.fillStyle = '#8b4513'; 
            ctx.beginPath(); 
            ctx.arc(64, 64, 32, 0, Math.PI * 2); 
            ctx.fill();
            
            // Legs
            ctx.fillStyle = '#34495e';
            if (step === 0) { 
                ctx.fillRect(36, 200, 24, 40); 
                ctx.fillRect(68, 200, 24, 40); 
            } else if (step === 1) { 
                ctx.fillRect(32, 200, 28, 40); 
                ctx.fillRect(68, 200, 28, 30); 
            } else { 
                ctx.fillRect(32, 200, 28, 30); 
                ctx.fillRect(68, 200, 28, 40); 
            }
            
            // Arms
            ctx.fillStyle = '#f4d1a6'; 
            ctx.fillRect(12, 100, 20, 70); 
            ctx.fillRect(96, 100, 20, 70);
        };
        
        const drawSide = (ctx: CanvasRenderingContext2D, step: number) => {
            ctx.fillStyle = '#2c3e50'; 
            ctx.fillRect(48, 100, 32, 100);
            ctx.fillStyle = '#f4d1a6'; 
            ctx.beginPath(); 
            ctx.arc(64, 64, 32, 0, Math.PI * 2); 
            ctx.fill();
            
            // Eye
            ctx.fillStyle = 'black'; 
            ctx.beginPath(); 
            ctx.arc(84, 64, 6, 0, Math.PI * 2); 
            ctx.fill();
            
            // Legs
            ctx.fillStyle = '#34495e';
            if (step === 0) { 
                ctx.fillRect(48, 200, 32, 40); 
            } else if (step === 1) { 
                ctx.fillRect(40, 200, 32, 40); 
            } else { 
                ctx.fillRect(56, 200, 32, 40); 
            }
            
            // Arm
            ctx.fillStyle = '#f4d1a6'; 
            ctx.fillRect(56, 100, 20, 70);
        };

        return {
            front: { 
                idle: createCharacterTexture(ctx => drawFront(ctx, 0)), 
                walk1: createCharacterTexture(ctx => drawFront(ctx, 1)), 
                walk2: createCharacterTexture(ctx => drawFront(ctx, 2)) 
            },
            back: { 
                idle: createCharacterTexture(ctx => drawBack(ctx, 0)), 
                walk1: createCharacterTexture(ctx => drawBack(ctx, 1)), 
                walk2: createCharacterTexture(ctx => drawBack(ctx, 2)) 
            },
            left: { 
                idle: createCharacterTexture(ctx => drawSide(ctx, 0)), 
                walk1: createCharacterTexture(ctx => drawSide(ctx, 1)), 
                walk2: createCharacterTexture(ctx => drawSide(ctx, 2)) 
            },
            right: { 
                idle: createCharacterTexture(ctx => drawSide(ctx, 0), true), 
                walk1: createCharacterTexture(ctx => drawSide(ctx, 1), true), 
                walk2: createCharacterTexture(ctx => drawSide(ctx, 2), true) 
            },
        };
    }, []);

    useEffect(() => {
        const handleKey = (e: KeyboardEvent, isDown: boolean) => {
            switch (e.code) {
                case 'ArrowUp': 
                case 'KeyW': 
                    movement.current.forward = isDown; 
                    if(isDown) direction.current = 'back'; 
                    break;
                case 'ArrowDown': 
                case 'KeyS': 
                    movement.current.backward = isDown; 
                    if(isDown) direction.current = 'front'; 
                    break;
                case 'ArrowLeft': 
                case 'KeyA': 
                    movement.current.left = isDown; 
                    if(isDown) direction.current = 'left'; 
                    break;
                case 'ArrowRight': 
                case 'KeyD': 
                    movement.current.right = isDown; 
                    if(isDown) direction.current = 'right'; 
                    break;
            }
        };
        
        const onKeyDown = (e: KeyboardEvent) => handleKey(e, true);
        const onKeyUp = (e: KeyboardEvent) => handleKey(e, false);
        
        document.addEventListener('keydown', onKeyDown); 
        document.addEventListener('keyup', onKeyUp);
        
        return () => { 
            document.removeEventListener('keydown', onKeyDown); 
            document.removeEventListener('keyup', onKeyUp); 
        };
    }, []);

    useFrame((state, delta) => {
        const speed = 100 * delta; // Increased speed for larger map
        const currentPosition = groupRef.current.position;
        // FIX: Adjusted player collision size to match new visual scale
        const playerSize = { width: 3, depth: 3 }; 
        const { forward, backward, left, right } = movement.current;
        const isMoving = forward || backward || left || right;

        const checkCollision = (posX: number, posZ: number) => {
            const playerBox = { 
                minX: posX - playerSize.width / 2, 
                maxX: posX + playerSize.width / 2, 
                minZ: posZ - playerSize.depth / 2, 
                maxZ: posZ + playerSize.depth / 2 
            };
            
            for (const obs of obstacles) {
                const obsBox = { 
                    minX: obs.x - obs.width / 2, 
                    maxX: obs.x + obs.width / 2, 
                    minZ: obs.z - obs.depth / 2, 
                    maxZ: obs.z + obs.depth / 2 
                };
                if (playerBox.minX < obsBox.maxX && playerBox.maxX > obsBox.minX && 
                    playerBox.minZ < obsBox.maxZ && playerBox.maxZ > obsBox.minZ) {
                    return true;
                }
            }
            return false;
        };
        
        const moveVector = new THREE.Vector3();
        if (forward) moveVector.z -= 1;
        if (backward) moveVector.z += 1;
        if (left) moveVector.x -= 1;
        if (right) moveVector.x += 1;
        moveVector.normalize().multiplyScalar(speed);

        const targetX = currentPosition.x + moveVector.x;
        const targetZ = currentPosition.z + moveVector.z;

        if (!checkCollision(targetX, currentPosition.z)) {
            currentPosition.x = targetX;
        }
        if (!checkCollision(currentPosition.x, targetZ)) {
            currentPosition.z = targetZ;
        }

        currentPosition.x = Math.max(boundaries.minX, Math.min(boundaries.maxX, currentPosition.x));
        currentPosition.z = Math.max(boundaries.minZ, Math.min(boundaries.maxZ, currentPosition.z));
        
        const textureSet = textures[direction.current];
        if (isMoving) {
            const walkCycle = Math.floor(state.clock.getElapsedTime() * 8) % 2;
            materialRef.current.map = walkCycle === 0 ? textureSet.walk1 : textureSet.walk2;
        } else {
            materialRef.current.map = textureSet.idle;
        }
        materialRef.current.needsUpdate = true;
        
        groupRef.current.position.y = position.y;
        setPosition(currentPosition.clone());
    });

    return (
        <group ref={groupRef} position={position}>
            <Billboard>
                {/* FIX: Adjusted Plane size to be smaller and more appropriate */}
                <Plane args={[6, 12]} castShadow>
                    <meshStandardMaterial 
                        ref={materialRef} 
                        map={textures.front.idle} 
                        transparent 
                        roughness={0.8} 
                        metalness={0} 
                        alphaTest={0.1}
                    />
                </Plane>
            </Billboard>
            {/* Player shadow circle */}
            {/* FIX: Adjusted shadow size to match new player scale */}
            <Plane args={[4, 4]} position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <meshBasicMaterial color="black" opacity={0.3} transparent />
            </Plane>
        </group>
    );
};

const CameraRig: FC = () => {
    const { position: playerPosition } = usePlayerStore();
    
    useFrame((state) => {
        const offset = new THREE.Vector3(0, 300, 300); // Adjusted for larger scale
        const cameraTargetPosition = new THREE.Vector3().copy(playerPosition).add(offset);
        state.camera.position.lerp(cameraTargetPosition, 0.05);
        state.camera.lookAt(new THREE.Vector3(playerPosition.x, 0, playerPosition.z));
        state.camera.updateProjectionMatrix();
    });
    
    return null;
};
