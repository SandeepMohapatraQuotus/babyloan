import { useMemo } from 'react';
import { Plane, Sphere, Cylinder } from '@react-three/drei';
import * as THREE from 'three';

const RealisticEnvironment = () => {
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
              <Cylinder position={[0, height / 2, 0]} args={[2 + Math.random(), 3 + Math.random(), height]} castShadow>
                <meshStandardMaterial color="#8b4513" roughness={0.8} />
              </Cylinder>
              <Sphere position={[0, height + 15, 0]} args={[12 + Math.random() * 6, 16, 16]} castShadow>
                <meshStandardMaterial color="#228b22" roughness={0.9} />
              </Sphere>
              <Sphere position={[5, height + 12, 3]} args={[8 + Math.random() * 3, 16, 16]} castShadow>
                <meshStandardMaterial color="#32cd32" roughness={0.9} />
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

export default RealisticEnvironment;
