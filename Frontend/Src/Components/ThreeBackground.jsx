import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';
import * as random from 'maath/random/dist/maath-random.esm';

function LayeredParticles({ layers = 3, baseCount = 3500, mouse = {x:0.5, y:0.5} }) {
  const groupRef = useRef();
  // Reduce Particle Count On Small Screens For Performance
  const effectiveBase = typeof window !== 'undefined' && window.innerWidth < 800 ? Math.floor(baseCount * 0.35) : baseCount;
  const particles = React.useMemo(() => {
    return new Array(layers).fill(0).map((_, i) => {
      const count = Math.max(180, Math.floor(effectiveBase / (i + 1)));
      const positions = random.inSphere(new Float32Array(count * 3), { radius: 2.8 + i * 1.5 });
      return { positions, size: 0.004 * (1.4 + i * 0.5), color: i === 0 ? '#ffffff' : i === 1 ? '#ffd78a' : '#4fc3f7' };
    });
  }, [layers, effectiveBase]);

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.012;
      // Subtle Breathing Motion
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime / 9) * 0.015;
      // Mouse Parallax - smoother
      const targetX = (mouse.x - 0.5) * 1.5;
      const targetY = (mouse.y - 0.5) * -1.0;
      groupRef.current.position.x += (targetX - groupRef.current.position.x) * 0.035;
      groupRef.current.position.y += (targetY - groupRef.current.position.y) * 0.035;
    }
  });

  return (
    <group ref={groupRef} rotation={[0, 0, Math.PI / 8]}>
      {particles.map((p, idx) => (
        <Points key={idx} positions={p.positions} stride={3} frustumCulled={false}>
          <PointMaterial
            transparent
            color={p.color}
            size={p.size}
            sizeAttenuation={true}
            depthWrite={false}
            opacity={1.0 - idx * 0.15}
            blending={THREE.AdditiveBlending}
          />
        </Points>
      ))}
    </group>
  );
}

function Ribbon({ segments = 120 }) {
  const ref = useRef();
  const positions = React.useMemo(() => new Float32Array(segments * 3), [segments]);

  useEffect(() => {
    for (let i = 0; i < segments; i++) {
      const t = i / segments;
      positions[i * 3 + 0] = (t - 0.5) * 6;
      positions[i * 3 + 1] = Math.sin(t * Math.PI * 2) * 0.5;
      positions[i * 3 + 2] = -i * 0.02;
    }
  }, [positions, segments]);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    for (let i = 0; i < segments; i++) {
      const t = i / segments;
      positions[i * 3 + 1] = Math.sin(t * Math.PI * 2 + time * 0.7) * (0.25 + Math.sin(time * 0.3) * 0.1);
      positions[i * 3 + 2] = -i * 0.02 + Math.sin(time * 0.5 + i * 0.05) * 0.01;
    }
    if (ref.current && ref.current.geometry && ref.current.geometry.attributes.position) {
      ref.current.geometry.attributes.position.needsUpdate = true;
      ref.current.rotation.z = Math.sin(time / 5) * 0.06;
      ref.current.position.y = Math.sin(time / 3) * 0.15;
    }
  });

  return (
    <line ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={segments}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial color={'#d4af37'} linewidth={2} transparent opacity={0.9} />
    </line>
  );
}

function CameraRig({ scrollY, mouse }) {
  const { camera } = useThree();

  useFrame((state) => {
    const normalizedScroll = scrollY / window.innerHeight;
    // Smooth Camera Position
    camera.position.z = 5 - normalizedScroll * 1.8;
    camera.position.y = -normalizedScroll * 0.5;

    // Gentle Parallax From Mouse
    const targetX = (mouse.x - 0.5) * 0.8;
    const targetY = (mouse.y - 0.5) * -0.6;
    camera.rotation.y += (targetX - camera.rotation.y) * 0.02;
    camera.rotation.x += (targetY - camera.rotation.x) * 0.02;
  });
  
  return null;
}

export default function ThreeBackground({ enableScroll = false }) {
  const [scrollY, setScrollY] = React.useState(0);
  const [mouse, setMouse] = React.useState({ x: 0.5, y: 0.5 });
  const [hasWebGL, setHasWebGL] = React.useState(true);

  useEffect(() => {
    // Detect WebGL Availability
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      setHasWebGL(!!gl);
    } catch (e) {
      setHasWebGL(false);
    }
  }, []);

  useEffect(() => {
    if (!enableScroll) return;
    
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [enableScroll]);

  useEffect(() => {
    const handleMove = (e) => {
      const rect = document.body.getBoundingClientRect();
      setMouse({ x: (e.clientX - rect.left) / rect.width, y: (e.clientY - rect.top) / rect.height });
    };
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  // Fallback: If No WebGL, Render A Subtle Animated CSS Background
  if (!hasWebGL) {
    return (
      <div className="three-fallback" style={{ position: 'fixed', inset: 0, zIndex: -1, pointerEvents: 'none' }} />
    );
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      zIndex: -1,
      pointerEvents: 'none',
      background: 'linear-gradient(135deg, #070707 0%, #0f0f0f 100%)'
    }}>
      <Canvas
        style={{ position: 'absolute', inset: 0 }}
        camera={{ position: [0, 0, 5], fov: 65 }}
        dpr={typeof window !== 'undefined' && window.devicePixelRatio > 1 ? [1, 1.5] : [1, 1.2]}
      >
        <fog attach="fog" args={['#040404', 5, 20]} />
        <ambientLight intensity={0.5} />
        <pointLight position={[6, 6, 6]} intensity={2.0} color={'#ffd78a'} />
        <pointLight position={[-6, -3, 6]} intensity={1.2} color={'#4fc3f7'} />

        {/* Oft Glow Sphere To Simulate Bloom/Highlight */}
        <mesh position={[0, -0.6, -1.2]}>
          <sphereGeometry args={[1.2, 32, 32]} />
          <meshBasicMaterial color={'#ffd78a'} transparent opacity={0.15} blending={THREE.AdditiveBlending} />
        </mesh>

        <LayeredParticles mouse={mouse} layers={3} baseCount={3500} />
        <Ribbon />
        {enableScroll && <CameraRig scrollY={scrollY} mouse={mouse} />}
      </Canvas>
    </div>
  );
}