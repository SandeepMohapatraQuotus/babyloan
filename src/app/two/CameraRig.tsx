import { useFrame } from '@react-three/fiber';
import { usePlayerStore } from './store';
import * as THREE from 'three';

const CameraRig = () => {
  const { position: playerPosition } = usePlayerStore();

  useFrame((state) => {
    const offset = new THREE.Vector3(0, 300, 300);
    const cameraTargetPosition = new THREE.Vector3().copy(playerPosition).add(offset);
    state.camera.position.lerp(cameraTargetPosition, 0.05);
    state.camera.lookAt(new THREE.Vector3(playerPosition.x, 0, playerPosition.z));
    state.camera.updateProjectionMatrix();
  });

  return null;
};

export default CameraRig;
