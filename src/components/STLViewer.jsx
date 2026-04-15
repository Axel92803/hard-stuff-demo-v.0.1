import { Suspense } from 'react'
import { Canvas, useLoader } from '@react-three/fiber'
import { OrbitControls, Environment, Center, ContactShadows } from '@react-three/drei'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js'

/*
 * useLoader suspends the tree until the geometry resolves — the <Suspense>
 * boundary in <STLViewer> below catches it
 */
function STLMesh({ url }) {
  const geometry = useLoader(STLLoader, url)
  geometry.computeVertexNormals()
  return (
    <Center>
      <mesh geometry={geometry} castShadow receiveShadow>
        <meshStandardMaterial color="#979797" metalness={0.76} roughness={0.2} />
      </mesh>
    </Center>
  )
}

export default function STLViewer({ stlUrl, variant }) {
  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden border border-zinc-800/80 bg-gradient-to-br from-zinc-900 to-zinc-950">
      <Canvas shadows camera={{ position: [4, 3, 5], fov: 50 }}>
        <color attach="background" args={['#0a0a0b']} />
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[5, 8, 5]}
          intensity={1.2}
          castShadow
          shadow-mapSize={[1024, 1024]}
        />
        <directionalLight position={[-5, 3, -5]} intensity={0.4} color="#a5f3fc" />

        <Suspense fallback={null}>
          {stlUrl ? <STLMesh url={stlUrl} /> : <ProceduralMesh variant={variant} />}
          <ContactShadows
            position={[0, -1.5, 0]}
            opacity={0.4}
            scale={10}
            blur={2.5}
            far={4}
          />
          <Environment preset="city" />
        </Suspense>
        <OrbitControls
          enableDamping
          enablePan={false}
          minDistance={150}
          maxDistance={250}
          makeDefault
        />
      </Canvas>

      {/* HUD labels */}
      <div className="absolute top-3 left-3 font-mono text-[10px] text-zinc-500 uppercase tracking-wider pointer-events-none">
        {stlUrl ? 'stl · interactive' : 'proc · interactive'}
      </div>
      <div className="absolute bottom-3 right-3 font-mono text-[10px] text-zinc-500 pointer-events-none">
        drag · rotate · scroll · zoom
      </div>
    </div>
  )
}
