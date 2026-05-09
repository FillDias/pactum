import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { View } from 'react-native'

function AbstractMesh() {
  const meshRef = useRef<THREE.Mesh>(null!)

  useFrame(({ clock }) => {
    if (!meshRef.current) return
    const geo = meshRef.current.geometry
    const pos = geo.attributes.position as THREE.BufferAttribute
    const t = clock.elapsedTime * 0.32

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i)
      const y = pos.getY(i)
      const z =
        Math.sin(x * 0.55 + t) * 0.38 +
        Math.cos(y * 0.45 + t * 0.75) * 0.28 +
        Math.sin((x - y) * 0.3 + t * 0.55) * 0.18 +
        Math.cos((x + y) * 0.2 + t * 0.4) * 0.12
      pos.setZ(i, z)
    }
    pos.needsUpdate = true
    geo.computeVertexNormals()
  })

  return (
    <mesh ref={meshRef} rotation={[-0.58, 0, 0.06]} position={[0, 0.8, 0]}>
      <planeGeometry args={[20, 20, 52, 52]} />
      <meshBasicMaterial
        color="#C0BAB2"
        wireframe
        transparent
        opacity={0.45}
      />
    </mesh>
  )
}

export default function HeroCanvas() {
  return (
    <View
      pointerEvents="none"
      style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
    >
      <Canvas
        camera={{ position: [0, 3.5, 10], fov: 52 }}
        gl={{ antialias: true, alpha: true }}
        style={{ width: '100%', height: '100%' } as any}
      >
        <AbstractMesh />
      </Canvas>
    </View>
  )
}
