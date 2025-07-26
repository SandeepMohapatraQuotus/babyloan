
'use client'

import React, { useMemo } from 'react'
import { InstancedMesh, BoxGeometry, MeshStandardMaterial } from 'three'

const Map: React.FC = () => {
  const size = 32
  const count = size * size

  const instancedMesh = useMemo(() => {
    const mesh = new InstancedMesh(
      new BoxGeometry(10, 1, 10),
      new MeshStandardMaterial({ color: 'gray' }),
      count
    )

    let i = 0
    for (let x = 0; x < size; x++) {
      for (let z = 0; z < size; z++) {
        const id = i++
        mesh.setMatrixAt(
          id,
          new (require('three').Matrix4)().setPosition(x * 10 - (size * 10) / 2, 0, z * 10 - (size * 10) / 2)
        )
      }
    }
    mesh.instanceMatrix.needsUpdate = true
    return mesh
  }, [count, size])

  return <primitive object={instancedMesh} />
}

export default Map
