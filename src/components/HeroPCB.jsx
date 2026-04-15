import { Suspense, useRef, useState, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useTexture, ContactShadows, Environment } from '@react-three/drei'
import * as THREE from 'three'

/**
 * Shared alpha-silhouette layer — same mesh recipe as the detail PCBViewer
 * but exposes a ref so the parent can drive per-layer z positions
 */
function HeroLayer({
  textureUrl,
  color,
  emissive,
  emissiveIntensity = 0,
  opacity = 1,
  width,
  height,
  meshRef,
}) {
  const texture = useTexture(textureUrl)

  useMemo(() => {
    texture.anisotropy = 16
    texture.colorSpace = THREE.SRGBColorSpace
  }, [texture])

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[width, height]} />
      <meshStandardMaterial
        color={color}
        emissive={emissive ?? color}
        emissiveIntensity={emissiveIntensity}
        alphaMap={texture}
        transparent
        opacity={opacity}
        alphaTest={0.01}
        side={THREE.DoubleSide}
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  )
}


// * The substrate plane: opaque, lit, shaped by the board outline
function HeroSubstrate({ textureUrl, width, height, meshRef }) {
  const texture = useTexture(textureUrl)

  useMemo(() => {
    texture.anisotropy = 16
  }, [texture])

  return (
    <mesh ref={meshRef} castShadow receiveShadow>
      <planeGeometry args={[width, height]} />
      <meshStandardMaterial
        color="#1a2e20"
        roughness={0.9}
        metalness={0.1}
        alphaMap={texture}
        transparent
        alphaTest={0.5}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

/**
 * The full animated board
 * Animation state lives in refs — nothing here triggers a React re-render
 */
function HeroBoard({ hovered }) {
  const groupRef = useRef(null)
  const layerRefs = useRef([])
  const copperMaterialRefs = useRef([]) // for emissive modulation
  const progressRef = useRef([]) // per-layer progress 0→1
  const rotSpeedRef = useRef(0.25)
  const tiltRef = useRef(-0.35)
  const elapsedRef = useRef(0)

  const aspect = 1.995 // height/width — matches the real 50.254 × 100.254 mm board
  const W = 3.5
  const H = W * aspect

  // Layer definitions. Order is bottom-of-board → top-of-board
  const layers = useMemo(
    () => [
      {
        name: 'bottom-mask',
        url: '/layers/bottom-mask.png',
        color: '#1f7a44',
        opacity: 0.85,
        emissive: '#0a3820',
        emissiveIntensity: 0.08,
      },
      {
        name: 'bottom-copper',
        url: '/layers/bottom-copper.png',
        color: '#d4a15c',
        emissive: '#8a4a12',
        emissiveIntensity: 0.35,
        copper: true,
      },
      {
        name: 'substrate',
        url: '/layers/outline.png',
        substrate: true,
      },
      {
        name: 'top-copper',
        url: '/layers/top-copper.png',
        color: '#e8b070',
        emissive: '#a8581c',
        emissiveIntensity: 0.45,
        copper: true,
      },
      {
        name: 'top-mask',
        url: '/layers/top-mask.png',
        color: '#1f7a44',
        opacity: 0.82,
        emissive: '#0a3820',
        emissiveIntensity: 0.1,
      },
      {
        name: 'top-silk',
        url: '/layers/top-silk.png',
        color: '#f5f5f5',
        emissive: '#2a2a2a',
        emissiveIntensity: 0.2,
      },
    ],
    [],
  )

  // Init refs to correct length on first render. These store raw three.js
  // objects (mesh, material)
  if (progressRef.current.length !== layers.length) {
    progressRef.current = layers.map(() => 0)
    layerRefs.current = layers.map(() => null)
  }

  // Stable ref callbacks — one per layer index — created once when the
  // layers array is first memoized. React calls each with the mesh node
  // when it mounts (and null on unmount). Without useMemo here, a fresh
  // closure per render would make React detach/reattach every frame,
  // which would race with the useFrame loop reading the same slot

  const meshCallbacks = useMemo(
    () =>
      layers.map((layer, i) => (node) => {
        layerRefs.current[i] = node
        if (layer.copper && node) {
          node.material.userData.baseEmissive = layer.emissiveIntensity
          if (!copperMaterialRefs.current.includes(node.material)) {
            copperMaterialRefs.current.push(node.material)
          }
        }
      }),
    [layers],
  )

  const compactGap = 0.01
  const explodedGap = 0.55

  useFrame((_, delta) => {
    if (!groupRef.current) return
    elapsedRef.current += delta

    // ORBITAL ROTATION
    // Target rotation speed and tilt angle differ based on hover state.
    const targetRotSpeed = hovered ? 0.06 : 0.25
    const targetTilt = hovered
      ? -0.52
      : -0.35 + Math.sin(elapsedRef.current * 0.4) * 0.05

    // Frame-rate independent lerp for transitions
    const ease = (current, target, rate) => {
      const k = 1 - Math.exp(-delta * rate)
      return current + (target - current) * k
    }
    rotSpeedRef.current = ease(rotSpeedRef.current, targetRotSpeed, 3.5)
    tiltRef.current = ease(tiltRef.current, targetTilt, 3.5)

    groupRef.current.rotation.y += rotSpeedRef.current * delta
    groupRef.current.rotation.x = tiltRef.current

    const centerIdx = (layers.length - 1) / 2
    const target = hovered ? 1 : 0

    for (let i = 0; i < layers.length; i++) {
      const distFromCenter = Math.abs(i - centerIdx)
      const rate = 5.5 / (1 + distFromCenter * 0.28)
      progressRef.current[i] = ease(progressRef.current[i], target, rate)

      const mesh = layerRefs.current[i]
      if (!mesh) continue

      const p = progressRef.current[i]
      const gap = compactGap + (explodedGap - compactGap) * p
      mesh.position.z = (i - centerIdx) * gap
    }

    // Copper glow swells as layers expose. Using average progress so both
    // copper layers pulse in sync even though each has its own lerp rate.
    const avgProgress =
      progressRef.current.reduce((a, b) => a + b, 0) / progressRef.current.length
    for (const mat of copperMaterialRefs.current) {
      const base = mat.userData.baseEmissive ?? 0.35
      mat.emissiveIntensity = base + avgProgress * 0.9
    }
  })

  return (
    <group ref={groupRef} rotation={[-0.35, 0, 0]} position={[0, 0.2, 0]}>
      {layers.map((layer, i) =>
        layer.substrate ? (
          <HeroSubstrate
            key={layer.name}
            textureUrl={layer.url}
            width={W}
            height={H}
            meshRef={meshCallbacks[i]}
          />
        ) : (
          <HeroLayer
            key={layer.name}
            textureUrl={layer.url}
            color={layer.color}
            emissive={layer.emissive}
            emissiveIntensity={layer.emissiveIntensity}
            opacity={layer.opacity ?? 1}
            width={W}
            height={H}
            meshRef={meshCallbacks[i]}
          />
        ),
      )}
    </group>
  )
}

/*
 * Sets up the scene fog once on mount. Putting this in a component lets
 * us reach into the scene from inside Canvas without an imperative root.
 */
function SceneFx() {
  useFrame(({ scene }) => {
    if (!scene.fog) {
      scene.fog = new THREE.Fog('#050507', 9, 22)
    }
  })
  return null
}

export default function HeroPCB() {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      className="relative w-full h-full"
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      <Canvas
        shadows
        camera={{ position: [0, 0, 9.5], fov: 32 }}
        gl={{ antialias: true, toneMappingExposure: 1.15 }}
      >
        <color attach="background" args={['#050507']} />
        <SceneFx />

        <ambientLight intensity={0.18} />

        <directionalLight
          position={[5, 7, 4]}
          intensity={2.6}
          color="#fff0d4"
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-bias={-0.0005}
        />

        <directionalLight
          position={[-6, 1, -3]}
          intensity={0.55}
          color="#4a8fd1"
        />

        <directionalLight position={[0, -2, -6]} intensity={1.8} color="#00d4ff" />

        <pointLight
          position={[0, 0.5, 3.5]}
          intensity={0.9}
          color="#ffb86b"
          distance={8}
          decay={2}
        />

        <Suspense fallback={null}>
          <HeroBoard hovered={hovered} />

          <ContactShadows
            position={[0, -4.2, 0]}
            opacity={0.55}
            scale={14}
            blur={3.2}
            far={6}
            color="#000"
          />

          <Environment preset="warehouse" environmentIntensity={0.35} />
        </Suspense>
      </Canvas>

      <div className="absolute inset-0 pointer-events-none">
        {/* Vignette via a radial gradient deepens the edges */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,0.55) 100%)',
          }}
        />
        <div className="absolute bottom-6 right-6 font-mono text-[10px] text-zinc-600 uppercase tracking-wider transition-opacity duration-500">
          {hovered ? '// layers exposed' : '// hover to reveal stack'}
        </div>
        <div className="absolute bottom-6 left-6 font-mono text-[10px] text-zinc-600 uppercase tracking-wider">
          rev 22 · gerber render · live
        </div>
      </div>
    </div>
  )
}
