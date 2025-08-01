import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

interface WebGLBackgroundProps {
  /** Esquema de cores do fundo */
  colorScheme?: 'purple' | 'blue' | 'green' | 'custom';
  /** Cores customizadas para luzes */
  customColors?: {
    primary: string;
    secondary: string;
    accent: string;
    particle: string;
  };
  /** Número de partículas */
  particleCount?: number;
  /** Número de estrelas cadentes */
  shootingStarCount?: number;
  /** Número de orbes flutuantes */
  orbCount?: number;
  /** Intensidade da animação */
  animationIntensity?: 'low' | 'medium' | 'high';
}

// Campo de partículas configurável
const ParticleField = ({ 
  count = 1000, 
  color = '#8b5cf6',
  intensity = 'medium'
}: { 
  count?: number; 
  color?: string;
  intensity?: 'low' | 'medium' | 'high';
}) => {
  const ref = useRef<THREE.Points>(null);
  
  const positions = new Float32Array(count * 3);
  
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 20;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
  }

  const speedMultiplier = intensity === 'low' ? 0.5 : intensity === 'high' ? 1.5 : 1;

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.x = state.clock.elapsedTime * 0.05 * speedMultiplier;
      ref.current.rotation.y = state.clock.elapsedTime * 0.075 * speedMultiplier;
    }
  });

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color={color}
        size={0.02}
        sizeAttenuation={true}
        depthWrite={false}
      />
    </Points>
  );
};

// Orbe flutuante configurável
const FloatingOrb = ({ 
  position, 
  color = '#3b82f6',
  intensity = 'medium'
}: { 
  position: [number, number, number];
  color?: string;
  intensity?: 'low' | 'medium' | 'high';
}) => {
  const ref = useRef<THREE.Mesh>(null);
  const startPosition = position;
  const speedMultiplier = intensity === 'low' ? 0.5 : intensity === 'high' ? 1.5 : 1;

  useFrame((state) => {
    if (ref.current) {
      ref.current.position.y = startPosition[1] + Math.sin(state.clock.elapsedTime * 0.5 * speedMultiplier) * 2;
      ref.current.position.x = startPosition[0] + Math.cos(state.clock.elapsedTime * 0.3 * speedMultiplier) * 1;
      ref.current.rotation.x = state.clock.elapsedTime * 0.2 * speedMultiplier;
      ref.current.rotation.y = state.clock.elapsedTime * 0.3 * speedMultiplier;
    }
  });

  return (
    <mesh ref={ref} position={startPosition}>
      <sphereGeometry args={[0.3, 16, 16]} />
      <meshBasicMaterial 
        color={color} 
        transparent 
        opacity={0.6}
        wireframe
      />
    </mesh>
  );
};

// Estrela cadente configurável
const ShootingStar = ({ 
  startPosition,
  intensity = 'medium'
}: { 
  startPosition: [number, number, number];
  intensity?: 'low' | 'medium' | 'high';
}) => {
  const ref = useRef<THREE.Mesh>(null);
  const speedMultiplier = intensity === 'low' ? 0.5 : intensity === 'high' ? 1.5 : 1;

  useFrame((state) => {
    if (ref.current) {
      // Move the star from left to right
      ref.current.position.x += 0.1 * speedMultiplier;
      
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

// Esquemas de cores predefinidos
const COLOR_SCHEMES = {
  purple: {
    primary: '#8b5cf6',
    secondary: '#3b82f6',
    accent: '#ec4899',
    particle: '#8b5cf6'
  },
  blue: {
    primary: '#3b82f6',
    secondary: '#06b6d4',
    accent: '#0ea5e9',
    particle: '#3b82f6'
  },
  green: {
    primary: '#10b981',
    secondary: '#059669',
    accent: '#34d399',
    particle: '#10b981'
  },
  custom: {
    primary: '#8b5cf6',
    secondary: '#3b82f6',
    accent: '#ec4899',
    particle: '#8b5cf6'
  }
};

const WebGLBackground: React.FC<WebGLBackgroundProps> = ({
  colorScheme = 'purple',
  customColors,
  particleCount = 1000,
  shootingStarCount = 5,
  orbCount = 6,
  animationIntensity = 'medium'
}) => {
  const colors = customColors || COLOR_SCHEMES[colorScheme];

  // Gerar posições para orbes
  const orbPositions: [number, number, number][] = [];
  for (let i = 0; i < orbCount; i++) {
    orbPositions.push([
      (Math.random() - 0.5) * 12,
      (Math.random() - 0.5) * 8,
      -3 - Math.random() * 3
    ]);
  }

  // Gerar posições para estrelas cadentes
  const starPositions: [number, number, number][] = [];
  for (let i = 0; i < shootingStarCount; i++) {
    starPositions.push([
      -15,
      (Math.random() - 0.5) * 12,
      -1 - Math.random() * 4
    ]);
  }

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
        <pointLight position={[10, 10, 10]} intensity={1.2} color={colors.primary} />
        <pointLight position={[-10, -10, -10]} intensity={0.8} color={colors.secondary} />
        <pointLight position={[5, -5, 5]} intensity={0.6} color={colors.accent} />
        
        <ParticleField 
          count={particleCount}
          color={colors.particle}
          intensity={animationIntensity}
        />
        
        {/* Orbes flutuantes */}
        {orbPositions.map((position, index) => (
          <FloatingOrb 
            key={`orb-${index}`}
            position={position}
            color={colors.secondary}
            intensity={animationIntensity}
          />
        ))}
        
        {/* Estrelas cadentes */}
        {starPositions.map((position, index) => (
          <ShootingStar 
            key={`star-${index}`}
            startPosition={position}
            intensity={animationIntensity}
          />
        ))}
      </Canvas>
    </div>
  );
};

export default WebGLBackground;
export type { WebGLBackgroundProps };