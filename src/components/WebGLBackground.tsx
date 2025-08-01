import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

// Campo de partículas simples
const ParticleField = () => {
  const ref = useRef<THREE.Points>(null);
  
  const particleCount = 1000;
  const positions = new Float32Array(particleCount * 3);
  
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 20;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
  }

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.x = state.clock.elapsedTime * 0.05;
      ref.current.rotation.y = state.clock.elapsedTime * 0.075;
    }
  });

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#8b5cf6"
        size={0.02}
        sizeAttenuation={true}
        depthWrite={false}
      />
    </Points>
  );
};

// Orbe flutuante simples
const FloatingOrb = ({ position }: { position: [number, number, number] }) => {
  const ref = useRef<THREE.Mesh>(null);
  const startPosition = position;

  useFrame((state) => {
    if (ref.current) {
      ref.current.position.y = startPosition[1] + Math.sin(state.clock.elapsedTime * 0.5) * 2;
      ref.current.position.x = startPosition[0] + Math.cos(state.clock.elapsedTime * 0.3) * 1;
      ref.current.rotation.x = state.clock.elapsedTime * 0.2;
      ref.current.rotation.y = state.clock.elapsedTime * 0.3;
    }
  });

  return (
    <mesh ref={ref} position={startPosition}>
      <sphereGeometry args={[0.3, 16, 16]} />
      <meshBasicMaterial 
        color="#3b82f6" 
        transparent 
        opacity={0.6}
        wireframe
      />
    </mesh>
  );
};

// Estrela cadente simples
const ShootingStar = ({ startPosition }: { startPosition: [number, number, number] }) => {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (ref.current) {
      // Move the star from left to right
      ref.current.position.x += 0.1;
      
      // Reset when star goes out of bounds
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