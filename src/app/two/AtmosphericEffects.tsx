import { FC, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Cloud } from '@react-three/drei';
import * as THREE from 'three';

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

export default AtmosphericEffects;
