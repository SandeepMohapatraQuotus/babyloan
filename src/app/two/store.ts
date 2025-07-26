import { create } from 'zustand';
import * as THREE from 'three';

interface PlayerState {
  position: THREE.Vector3;
  setPosition: (newPosition: THREE.Vector3) => void;
}

export const usePlayerStore = create<PlayerState>((set) => ({
  position: new THREE.Vector3(0, 1, 200),
  setPosition: (newPosition) => set({ position: newPosition }),
}));
