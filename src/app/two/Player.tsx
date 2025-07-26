import { FC, useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { usePlayerStore } from './store';

const createCharacterTexture = (draw: (ctx: CanvasRenderingContext2D, step: number) => void, flip = false, step = 0) => {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 256;
  const context = canvas.getContext('2d')!;
  context.imageSmoothingEnabled = false;

  if (flip) {
    context.scale(-1, 1);
    context.translate(-canvas.width, 0);
  }
  draw(context, step);
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
      ctx.fillStyle = '#2c3e50'; ctx.fillRect(32, 100, 64, 100); // Body
      ctx.fillStyle = '#f4d1a6'; // Skin color
      ctx.beginPath();
      ctx.arc(64, 64, 32, 0, Math.PI * 2); // Head
      ctx.fill();

      ctx.fillStyle = '#e8c4a0';
      ctx.beginPath();
      ctx.arc(72, 56, 20, 0, Math.PI);
      ctx.fill();

      ctx.fillStyle = '#1a2b3c';
      ctx.fillRect(44, 95, 40, 10);
    };

    const drawFront = (ctx: CanvasRenderingContext2D, step: number) => {
      drawHeadAndBody(ctx);
      ctx.fillStyle = 'black';
      ctx.beginPath();
      ctx.arc(52, 64, 6, 0, Math.PI * 2);
      ctx.arc(76, 64, 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#8b0000';
      ctx.fillRect(60, 80, 8, 4);

      ctx.fillStyle = '#34495e'; // Pants color
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

      ctx.fillStyle = '#f4d1a6'; // Skin color
      ctx.fillRect(12, 100, 20, 70);
      ctx.fillRect(96, 100, 20, 70);
    };

    const drawBack = (ctx: CanvasRenderingContext2D, step: number) => {
      drawHeadAndBody(ctx);
      ctx.fillStyle = '#8b4513';
      ctx.beginPath();
      ctx.arc(64, 64, 32, 0, Math.PI * 2);
      ctx.fill();

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

      ctx.fillStyle = '#f4d1a6';
      ctx.fillRect(12, 100, 20, 70);
      ctx.fillRect(96, 100, 20, 70);
    };

    const drawSide = (ctx: CanvasRenderingContext2D, step: number) => {
      ctx.fillStyle = '#2c3e50';
      ctx.fillRect(48, 100, 32, 100); // Body
      ctx.fillStyle = '#f4d1a6';
      ctx.beginPath();
      ctx.arc(64, 64, 32, 0, Math.PI * 2); // Head
      ctx.fill();

      ctx.fillStyle = 'black';
      ctx.beginPath();
      ctx.arc(84, 64, 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#8b0000';
      ctx.fillRect(78, 80, 4, 4);

      // Legs
      ctx.fillStyle = '#34495e';
      const legWidth = 16;
      const legHeight = 40;
      const legY = 200;
      const backLegX = 48;
      const frontLegX = 64;

      if (step === 0) { // Idle
        ctx.fillRect(backLegX, legY, legWidth, legHeight);
        ctx.fillRect(frontLegX, legY, legWidth, legHeight);
      } else if (step === 1) { // Walk step 1
        ctx.fillRect(backLegX - 4, legY, legWidth, legHeight);
        ctx.fillRect(frontLegX + 4, legY, legWidth, legHeight - 5);
      } else { // Walk step 2
        ctx.fillRect(backLegX + 4, legY, legWidth, legHeight - 5);
        ctx.fillRect(frontLegX - 4, legY, legWidth, legHeight);
      }

      ctx.fillStyle = '#f4d1a6';
      ctx.fillRect(56, 100, 20, 70);
    };

    return {
      front: {
        idle: createCharacterTexture(drawFront, false, 0),
        walk1: createCharacterTexture(drawFront, false, 1),
        walk2: createCharacterTexture(drawFront, false, 2)
      },
      back: {
        idle: createCharacterTexture(drawBack, false, 0),
        walk1: createCharacterTexture(drawBack, false, 1),
        walk2: createCharacterTexture(drawBack, false, 2)
      },
      left: {
        idle: createCharacterTexture(drawSide, true, 0),
        walk1: createCharacterTexture(drawSide, true, 1),
        walk2: createCharacterTexture(drawSide, true, 2)
      },
      right: {
        idle: createCharacterTexture(drawSide, false, 0),
        walk1: createCharacterTexture(drawSide, false, 1),
        walk2: createCharacterTexture(drawSide, false, 2)
      },
    };
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent, isDown: boolean) => {
      switch (e.code) {
        case 'ArrowUp':
        case 'KeyW':
          movement.current.forward = isDown;
          if (isDown) direction.current = 'back';
          break;
        case 'ArrowDown':
        case 'KeyS':
          movement.current.backward = isDown;
          if (isDown) direction.current = 'front';
          break;
        case 'ArrowLeft':
        case 'KeyA':
          movement.current.left = isDown;
          if (isDown) direction.current = 'left';
          break;
        case 'ArrowRight':
        case 'KeyD':
          movement.current.right = isDown;
          if (isDown) direction.current = 'right';
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
    const speed = 50 * delta;
    const playerSize = { width: 1.5, depth: 1.5 };
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

    const newPos = position.clone();
    const moveVector = new THREE.Vector3();
    if (forward) moveVector.z -= 1;
    if (backward) moveVector.z += 1;
    if (left) moveVector.x -= 1;
    if (right) moveVector.x += 1;
    moveVector.normalize().multiplyScalar(speed);

    const targetX = newPos.x + moveVector.x;
    const targetZ = newPos.z + moveVector.z;

    if (!checkCollision(targetX, newPos.z)) {
      newPos.x = targetX;
    }
    if (!checkCollision(newPos.x, targetZ)) {
      newPos.z = targetZ;
    }

    newPos.x = Math.max(boundaries.minX, Math.min(boundaries.maxX, newPos.x));
    newPos.z = Math.max(boundaries.minZ, Math.min(boundaries.maxZ, newPos.z));

    setPosition(newPos);

    groupRef.current.position.x = newPos.x;
    groupRef.current.position.z = newPos.z;
    const time = state.clock.getElapsedTime();
    groupRef.current.position.y = newPos.y + Math.sin(time * 4) * 0.2;

    const textureSet = textures[direction.current];
    if (isMoving) {
      const walkCycle = Math.floor(time * 8) % 2;
      materialRef.current.map = walkCycle === 0 ? textureSet.walk1 : textureSet.walk2;
    } else {
      materialRef.current.map = textureSet.idle;
    }
    materialRef.current.needsUpdate = true;
  });

  return (
    <group ref={groupRef} position={position} scale={[0.5, 0.5, 0.5]}>
      <mesh castShadow>
        <boxGeometry args={[4, 8, 2]} />
        <meshStandardMaterial ref={materialRef} map={textures.front.idle} transparent />
      </mesh>
    </group>
  );
};

export default Player;