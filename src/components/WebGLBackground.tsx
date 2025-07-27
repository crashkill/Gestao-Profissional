import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

const ParticleField = () => {
  const ref = useRef<THREE.Points>(null);
  
  const particles = React.useMemo(() => {
    const temp = new Float32Array(2000 * 3);
    for (let i = 0; i < 2000; i++) {
      temp[i * 3] = (Math.random() - 0.5) * 20;
      temp[i * 3 + 1] = (Math.random() - 0.5) * 20;
      temp[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    return temp;
  }, []);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.3;
      ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.15) * 0.2;
      ref.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.05) * 0.1;
    }
  });

  return (
    <Points ref={ref} positions={particles} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#ffffff"
        size={0.015}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={0.8}
      />
    </Points>
  );
};

const FloatingOrb = ({ position }: { position: [number, number, number] }) => {
  const ref = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (ref.current) {
      ref.current.position.x = position[0] + Math.sin(state.clock.elapsedTime * 0.7 + position[0]) * 0.8;
      ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5 + position[1]) * 0.6;
      ref.current.position.z = position[2] + Math.sin(state.clock.elapsedTime * 0.6 + position[2]) * 0.4;
      
      ref.current.rotation.x += 0.005;
      ref.current.rotation.y += 0.008;
      
      // Pulsing glow effect
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2 + position[0]) * 0.3;
      ref.current.scale.setScalar(scale);
    }
  });

  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[0.4, 32, 32]} />
      <meshPhongMaterial 
        color="#8b5cf6" 
        transparent 
        opacity={0.3}
        emissive="#4c1d95"
        emissiveIntensity={0.4}
      />
    </mesh>
  );
};

const ShootingStar = ({ startPosition }: { startPosition: [number, number, number] }) => {
  const ref = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (ref.current) {
      const speed = 0.1;
      ref.current.position.x += speed;
      ref.current.position.y -= speed * 0.3;
      
      // Reset position when star goes out of bounds
      if (ref.current.position.x > 15) {
        ref.current.position.x = -15;
        ref.current.position.y = startPosition[1] + (Math.random() - 0.5) * 10;
        ref.current.position.z = startPosition[2] + (Math.random() - 0.5) * 5;
      }
      
      // Twinkling effect
      const opacity = 0.5 + Math.sin(state.clock.elapsedTime * 8 + startPosition[0]) * 0.3;
      if (ref.current.material instanceof THREE.MeshBasicMaterial) {
        ref.current.material.opacity = opacity;
      }
    }
  });

  return (
    <mesh ref={ref} position={startPosition}>
      <sphereGeometry args={[0.05, 8, 8]} />
      <meshBasicMaterial 
        color="#ffffff" 
        transparent 
        opacity={0.8}
      />
    </mesh>
  );
};

const WebGLBackground = () => {
  return (
    <div className="fixed inset-0 z-0">
      <Canvas 
        camera={{ position: [0, 0, 10], fov: 60 }}
        gl={{ antialias: true, alpha: true }}
        onCreated={({ gl }) => {
          gl.setClearColor('#000000', 0);
        }}
      >
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1.2} color="#8b5cf6" />
        <pointLight position={[-10, -10, -10]} intensity={0.8} color="#3b82f6" />
        <pointLight position={[5, -5, 5]} intensity={0.6} color="#ec4899" />
        
        <ParticleField />
        
        <FloatingOrb position={[-6, 4, -4]} />
        <FloatingOrb position={[6, -3, -5]} />
        <FloatingOrb position={[0, 5, -6]} />
        <FloatingOrb position={[-4, -4, -3]} />
        <FloatingOrb position={[7, 2, -4]} />
        <FloatingOrb position={[-2, 6, -5]} />
        
        {/* Shooting stars */}
        <ShootingStar startPosition={[-15, 8, -3]} />
        <ShootingStar startPosition={[-15, 4, -2]} />
        <ShootingStar startPosition={[-15, -2, -4]} />
        <ShootingStar startPosition={[-15, -6, -1]} />
        <ShootingStar startPosition={[-15, 1, -5]} />
      </Canvas>
    </div>
  );
};

export default WebGLBackground;