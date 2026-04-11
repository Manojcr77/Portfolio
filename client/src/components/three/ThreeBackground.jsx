import { Canvas, useFrame } from "@react-three/fiber"
import { Points, PointMaterial, Float, MeshDistortMaterial } from "@react-three/drei"
import { useRef, useMemo, useState, useEffect } from "react"
import * as THREE from "three"

// ── Star field (galaxy background) ──────────────────────────────────────────
function StarField() {
  const ref = useRef()
  const positions = useMemo(() => {
    const count = 6000
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const r = 10 + Math.random() * 40
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      arr[i * 3]     = r * Math.sin(phi) * Math.cos(theta)
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.3
      arr[i * 3 + 2] = r * Math.cos(phi)
    }
    return arr
  }, [])
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.getElapsedTime() * 0.012
  })
  return (
    <Points ref={ref} positions={positions} stride={3}>
      <PointMaterial transparent color="#e2e8f0" size={0.04} sizeAttenuation depthWrite={false} opacity={0.7} />
    </Points>
  )
}

// ── Galaxy spiral dust ───────────────────────────────────────────────────────
function GalaxyDust() {
  const ref = useRef()
  const positions = useMemo(() => {
    const count = 3000
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const arm = Math.floor(Math.random() * 3)
      const t = Math.random()
      const angle = arm * (Math.PI * 2 / 3) + t * Math.PI * 3
      const radius = 2 + t * 14
      const spread = (1 - t) * 1.5
      arr[i * 3]     = Math.cos(angle) * radius + (Math.random() - 0.5) * spread
      arr[i * 3 + 1] = (Math.random() - 0.5) * 0.6
      arr[i * 3 + 2] = Math.sin(angle) * radius + (Math.random() - 0.5) * spread
    }
    return arr
  }, [])
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.getElapsedTime() * 0.025
  })
  return (
    <Points ref={ref} positions={positions} stride={3}>
      <PointMaterial transparent color="#22d3ee" size={0.055} sizeAttenuation depthWrite={false} opacity={0.45} />
    </Points>
  )
}

// ── Sun / star center ────────────────────────────────────────────────────────
function Sun() {
  const ref = useRef()
  const glowRef = useRef()
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y = clock.getElapsedTime() * 0.08
      ref.current.rotation.x = clock.getElapsedTime() * 0.05
    }
    if (glowRef.current) {
      const pulse = Math.sin(clock.getElapsedTime() * 1.2) * 0.08
      glowRef.current.scale.setScalar(1 + pulse)
    }
  })
  return (
    <group position={[0, 0, -4]}>
      {/* Corona glow */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[1.6, 32, 32]} />
        <meshBasicMaterial color="#ff9922" transparent opacity={0.06} />
      </mesh>
      {/* Sun surface */}
      <mesh ref={ref}>
        <sphereGeometry args={[0.9, 64, 64]} />
        <MeshDistortMaterial color="#ffcc44" distort={0.25} speed={2} transparent opacity={0.95} />
      </mesh>
    </group>
  )
}

// ── Single orbiting planet ───────────────────────────────────────────────────
function Planet({ orbitRadius, orbitSpeed, orbitTilt, startAngle, size, color, distort = 0.2, hasRing = false, hasMoon = false }) {
  const groupRef  = useRef()
  const planetRef = useRef()
  const moonRef   = useRef()

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (groupRef.current) {
      const angle = startAngle + t * orbitSpeed
      groupRef.current.position.x = Math.cos(angle) * orbitRadius
      groupRef.current.position.z = Math.sin(angle) * orbitRadius - 4
      groupRef.current.position.y = Math.sin(angle) * orbitRadius * Math.tan(orbitTilt)
    }
    if (planetRef.current) {
      planetRef.current.rotation.y = t * 0.4
    }
    if (moonRef.current) {
      const ma = t * 1.4
      moonRef.current.position.x = Math.cos(ma) * (size * 2.2)
      moonRef.current.position.y = Math.sin(ma) * (size * 2.2) * 0.4
    }
  })

  return (
    <group ref={groupRef}>
      {/* Planet */}
      <Float speed={0.8} floatIntensity={0.3}>
        <mesh ref={planetRef}>
          <sphereGeometry args={[size, 48, 48]} />
          <MeshDistortMaterial color={color} distort={distort} speed={1.5} transparent opacity={0.92} />
        </mesh>

        {/* Ring system */}
        {hasRing && (
          <mesh rotation={[Math.PI / 3, 0, 0]}>
            <torusGeometry args={[size * 1.8, size * 0.18, 3, 64]} />
            <meshBasicMaterial color={color} transparent opacity={0.25} />
          </mesh>
        )}

        {/* Moon */}
        {hasMoon && (
          <mesh ref={moonRef}>
            <sphereGeometry args={[size * 0.32, 16, 16]} />
            <meshStandardMaterial color="#94a3b8" transparent opacity={0.85} />
          </mesh>
        )}
      </Float>

      {/* Planet glow */}
      <mesh>
        <sphereGeometry args={[size * 1.5, 16, 16]} />
        <meshBasicMaterial color={color} transparent opacity={0.06} />
      </mesh>
    </group>
  )
}

// ── Orbit ring (visible ellipse) ─────────────────────────────────────────────
function OrbitRing({ radius, tilt, color = "#ffffff" }) {
  const points = useMemo(() => {
    const pts = []
    for (let i = 0; i <= 128; i++) {
      const a = (i / 128) * Math.PI * 2
      pts.push(new THREE.Vector3(Math.cos(a) * radius, Math.sin(a) * radius * Math.tan(tilt), Math.sin(a) * radius))
    }
    return pts
  }, [radius, tilt])
  const geo = useMemo(() => new THREE.BufferGeometry().setFromPoints(points), [points])
  return (
    <line geometry={geo} position={[0, 0, -4]}>
      <lineBasicMaterial color={color} transparent opacity={0.08} />
    </line>
  )
}

// ── Asteroid belt ────────────────────────────────────────────────────────────
function AsteroidBelt() {
  const ref = useRef()
  const positions = useMemo(() => {
    const count = 800
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2
      const r = 5.5 + Math.random() * 1.2
      arr[i * 3]     = Math.cos(angle) * r
      arr[i * 3 + 1] = (Math.random() - 0.5) * 0.3
      arr[i * 3 + 2] = Math.sin(angle) * r
    }
    return arr
  }, [])
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.getElapsedTime() * 0.018
  })
  return (
    <Points ref={ref} positions={positions} stride={3} position={[0, 0, -4]}>
      <PointMaterial transparent color="#94a3b8" size={0.04} sizeAttenuation depthWrite={false} opacity={0.5} />
    </Points>
  )
}

// ── Shooting stars ───────────────────────────────────────────────────────────
function ShootingStar({ offset, startX, startY, startZ }) {
  const ref = useRef()
  useFrame(({ clock }) => {
    if (!ref.current) return
    const t = (clock.getElapsedTime() * 0.3 + offset) % 3
    const progress = t / 3
    ref.current.position.x = startX - progress * 18
    ref.current.position.y = startY - progress * 10
    ref.current.position.z = startZ
    ref.current.material.opacity = progress < 0.1
      ? progress * 10
      : progress > 0.7
        ? (1 - progress) * 3.3
        : 0.85
  })
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.06, 6, 6]} />
      <meshBasicMaterial color="#ffffff" transparent opacity={0} />
    </mesh>
  )
}

// ── Main export ──────────────────────────────────────────────────────────────
export default function ThreeBackground() {
  const [mounted, setMounted] = useState(false)
  const shootingStars = useMemo(() => Array.from({ length: 5 }, (_, i) => ({
    offset: i * 1.8,
    startX: (Math.random() - 0.5) * 30,
    startY: 5 + Math.random() * 6,
    startZ: -2 - Math.random() * 6,
  })), [])

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 100)
    return () => clearTimeout(timer)
  }, [])
  if (!mounted) return null

  return (
    <Canvas
      camera={{ position: [0, 4, 14], fov: 55 }}
      style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", zIndex: -3, pointerEvents: "none" }}
      gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
      dpr={[1, 1.5]}
    >
      <ambientLight intensity={0.3} />
      <pointLight position={[0, 0, -4]}  color="#ffcc44" intensity={3}   distance={30} />
      <pointLight position={[0, 8, 2]}   color="#22d3ee" intensity={0.5} />
      <pointLight position={[-8, -4, 0]} color="#a78bfa" intensity={0.4} />

      {/* Background */}
      <StarField />
      <GalaxyDust />

      {/* Solar system */}
      <Sun />
      <AsteroidBelt />

      {/* Shooting stars */}
      {shootingStars.map((s, i) => <ShootingStar key={i} {...s} />)}

      {/* Orbit rings */}
      <OrbitRing radius={2.2} tilt={0.04} color="#22d3ee" />
      <OrbitRing radius={3.6} tilt={0.07} color="#f472b6" />
      <OrbitRing radius={5.0} tilt={0.03} color="#22d3ee" />
      <OrbitRing radius={6.8} tilt={0.10} color="#a78bfa" />
      <OrbitRing radius={8.5} tilt={0.05} color="#39ff14" />

      {/* Planets */}
      <Planet orbitRadius={2.2} orbitSpeed={0.35} orbitTilt={0.04} startAngle={0}   size={0.22} color="#22d3ee" distort={0.3}  />
      <Planet orbitRadius={3.6} orbitSpeed={0.22} orbitTilt={0.07} startAngle={1.2} size={0.32} color="#f472b6" distort={0.2}  hasMoon={true} />
      <Planet orbitRadius={5.0} orbitSpeed={0.14} orbitTilt={0.03} startAngle={2.8} size={0.28} color="#22d3ee" distort={0.15} />
      <Planet orbitRadius={6.8} orbitSpeed={0.09} orbitTilt={0.10} startAngle={4.1} size={0.48} color="#a78bfa" distort={0.25} hasRing={true} hasMoon={true} />
      <Planet orbitRadius={8.5} orbitSpeed={0.06} orbitTilt={0.05} startAngle={0.7} size={0.36} color="#39ff14" distort={0.2}  />
    </Canvas>
  )
}
