import { Suspense, useRef, useState, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, useTexture } from '@react-three/drei'
import * as THREE from 'three'

/**
 * Loads a PNG as an alpha silhouette and returns a <mesh> for it.
 * The PNG is a white-on-transparent render of a single gerber layer
 */
function Layer({
  url,
  color,
  targetZ,
  width,
  height,
  opacity = 1,
  emissive = null,
  doubleSide = false,
}) {
  const meshRef = useRef(null)
  const texture = useTexture(url)

  useMemo(() => {
    texture.anisotropy = 8
    texture.colorSpace = THREE.SRGBColorSpace
  }, [texture])

  useFrame((_, delta) => {
    if (!meshRef.current) return
    const current = meshRef.current.position.z
    // Exponential lerp
    const k = 1 - Math.exp(-delta * 6)
    meshRef.current.position.z = current + (targetZ - current) * k
  })

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <planeGeometry args={[width, height]} />
      <meshStandardMaterial
        color={color}
        emissive={emissive ?? color}
        emissiveIntensity={emissive ? 0.15 : 0}
        alphaMap={texture}
        transparent
        opacity={opacity}
        alphaTest={0.01}
        side={doubleSide ? THREE.DoubleSide : THREE.FrontSide}
        depthWrite={false}
      />
    </mesh>
  )
}


// FR4 substrate — synthesized from the outline PNG so it takes the exact board shape
function Substrate({ url, targetZ, width, height }) {
  const meshRef = useRef(null)
  const texture = useTexture(url)

  useMemo(() => {
    texture.anisotropy = 8
  }, [texture])

  useFrame((_, delta) => {
    if (!meshRef.current) return
    const z = meshRef.current.position.z
    const k = 1 - Math.exp(-delta * 6)
    meshRef.current.position.z = z + (targetZ - z) * k
  })

  return (
    <mesh ref={meshRef} position={[0, 0, 0]} castShadow receiveShadow>
      <planeGeometry args={[width, height]} />
      <meshStandardMaterial
        color="#1a3a2a"
        roughness={0.85}
        metalness={0.05}
        alphaMap={texture}
        transparent
        alphaTest={0.5}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

/*
 * The full stack. Each layer has a fixed slot index; z = index * gap when
 * exploded, z = index * compactGap when stacked.
 */
function Board({ exploded, aspect }) {
  const W = 3
  const H = W * aspect

  // Layer definitions: order is bottom-of-board to top-of-board
  const layers = [
    { name: 'bottom-silk',   url: '/layers/bottom-mask.png',   color: '#e8e8e8', opacity: 0 },  // placeholder — GBO is empty
    { name: 'bottom-mask',   url: '/layers/bottom-mask.png',   color: '#1f7a44', opacity: 0.9 },
    { name: 'bottom-copper', url: '/layers/bottom-copper.png', color: '#d4a15c', opacity: 1, emissive: '#7a4d1a' },
    { name: 'substrate',     url: '/layers/outline.png',       color: '#1a3a2a', opacity: 1, substrate: true },
    { name: 'top-copper',    url: '/layers/top-copper.png',    color: '#d4a15c', opacity: 1, emissive: '#7a4d1a' },
    { name: 'top-mask',      url: '/layers/top-mask.png',      color: '#1f7a44', opacity: 0.85 },
    { name: 'top-silk',      url: '/layers/top-silk.png',      color: '#f5f5f5', opacity: 1 },
  ].filter((l) => l.opacity > 0)

  // Centre the stack around z = 0
  const compactGap = 0.005
  const explodedGap = 0.5
  const gap = exploded ? explodedGap : compactGap
  const centerOffset = ((layers.length - 1) * gap) / 2

  // Slow idle rotation
  const groupRef = useRef(null)
  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.1
  })

  return (
    <group ref={groupRef} rotation={[-0.35, 0, 0]}>
      {layers.map((layer, i) => {
        const z = i * gap - centerOffset
        if (layer.substrate) {
          return (
            <Substrate
              key={layer.name}
              url={layer.url}
              targetZ={z}
              width={W}
              height={H}
            />
          )
        }
        return (
          <Layer
            key={layer.name}
            url={layer.url}
            color={layer.color}
            emissive={layer.emissive}
            opacity={layer.opacity}
            targetZ={z}
            width={W}
            height={H}
            doubleSide
          />
        )
      })}
    </group>
  )
}

export default function PCBViewer({ aspect = 1.995 }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      className="relative w-full h-full rounded-xl overflow-hidden border border-zinc-800/80 bg-gradient-to-br from-zinc-900 to-zinc-950"
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      <Canvas shadows camera={{ position: [0, 1.5, 7], fov: 45 }}>
        <color attach="background" args={['#0a0a0b']} />
        <ambientLight intensity={0.5} />
        <directionalLight position={[4, 6, 5]} intensity={1.2} castShadow />
        <directionalLight position={[-5, 2, -3]} intensity={0.3} color="#a5f3fc" />
        <pointLight position={[0, 0, 5]} intensity={0.4} color="#fff7e6" />

        <Suspense fallback={null}>
          <Board exploded={hovered} aspect={aspect} />
        </Suspense>

        <OrbitControls
          enableDamping
          enablePan={false}
          minDistance={4}
          maxDistance={14}
          makeDefault
        />
      </Canvas>

      <div className="absolute top-3 left-3 font-mono text-[10px] text-zinc-500 uppercase tracking-wider pointer-events-none">
        gerber · interactive
      </div>
      <div className="absolute bottom-3 right-3 font-mono text-[10px] text-zinc-500 pointer-events-none transition-opacity">
        {hovered ? 'layers exploded' : 'hover to reveal layers'}
      </div>
      <div className="absolute bottom-3 left-3 font-mono text-[10px] text-zinc-500 pointer-events-none">
        drag · rotate · scroll · zoom
      </div>
    </div>
  )
}
