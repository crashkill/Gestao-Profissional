import React, { useState, useEffect, useRef, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Text, Box, Sphere, Cylinder, OrbitControls, Environment, Float, MeshDistortMaterial, Sparkles, Stars } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, UserPlus, Upload, BarChart3, TrendingUp, Award, Globe, Zap } from 'lucide-react';
import { Professional } from '../types/Professional';
import { supabase } from '../lib/supabaseClient';
import * as THREE from 'three';

interface ImmersiveDashboardProps {
  professionals: Professional[];
  onNavigate: (view: 'manual' | 'excel' | 'dashboard') => void;
}

// Componente 3D para estatísticas flutuantes
const FloatingStatCard = ({ position, title, value, color, delay }: {
  position: [number, number, number];
  title: string;
  value: string;
  color: string;
  delay: number;
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime + delay) * 0.1;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5 + delay) * 0.2;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
      <group position={position}>
        <Box
          ref={meshRef}
          args={[2.5, 1.5, 0.2]}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
          scale={hovered ? 1.1 : 1}
        >
          <MeshDistortMaterial
            color={color}
            transparent
            opacity={0.8}
            distort={0.1}
            speed={2}
            roughness={0.1}
            metalness={0.8}
          />
        </Box>
        <Text
          position={[0, 0.3, 0.11]}
          fontSize={0.15}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {title}
        </Text>
        <Text
          position={[0, -0.2, 0.11]}
          fontSize={0.25}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {value}
        </Text>
      </group>
    </Float>
  );
};

// Componente 3D para visualização de skills
const SkillVisualization = ({ skills, position }: {
  skills: Array<{ name: string; count: number; color: string }>;
  position: [number, number, number];
}) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {skills.map((skill, index) => {
        const angle = (index / skills.length) * Math.PI * 2;
        const radius = 2;
        const height = (skill.count / Math.max(...skills.map(s => s.count))) * 2 + 0.5;
        
        return (
          <Float key={skill.name} speed={1 + index * 0.1} rotationIntensity={0.1}>
            <group
              position={[
                Math.cos(angle) * radius,
                height / 2,
                Math.sin(angle) * radius
              ]}
            >
              <Cylinder args={[0.2, 0.2, height, 8]}>
                <MeshDistortMaterial
                  color={skill.color}
                  transparent
                  opacity={0.9}
                  distort={0.05}
                  speed={1}
                  roughness={0.2}
                  metalness={0.7}
                />
              </Cylinder>
              <Text
                position={[0, height / 2 + 0.5, 0]}
                fontSize={0.1}
                color="white"
                anchorX="center"
                anchorY="middle"
                rotation={[0, -angle, 0]}
              >
                {skill.name}
              </Text>
              <Text
                position={[0, height / 2 + 0.3, 0]}
                fontSize={0.08}
                color="#94a3b8"
                anchorX="center"
                anchorY="middle"
                rotation={[0, -angle, 0]}
              >
                {skill.count}
              </Text>
            </group>
          </Float>
        );
      })}
      <Sparkles count={50} scale={[4, 4, 4]} size={2} speed={0.5} />
    </group>
  );
};

// Componente principal da cena 3D
const Scene3D = ({ professionals }: { professionals: Professional[] }) => {
  const [contractTypeCounts, setContractTypeCounts] = useState({ cltCount: 0, pjCount: 0 });
  const [skillsData, setSkillsData] = useState<Array<{ name: string; count: number; color: string }>>([]);

  useEffect(() => {
    // Buscar dados de contrato
    const fetchContractData = async () => {
      try {
        const { data, error } = await supabase
          .from('colaboradores')
          .select('regime');

        if (error) throw error;

        let cltCount = 0;
        let pjCount = 0;

        data?.forEach((row) => {
          if (row.regime === 'CLT') cltCount++;
          else if (row.regime === 'PJ') pjCount++;
        });

        setContractTypeCounts({ cltCount, pjCount });
      } catch (error) {
        console.error('Erro ao buscar dados de contrato:', error);
      }
    };

    // Processar dados de skills
    const processSkillsData = () => {
      const skillCounts: { [key: string]: number } = {};
      const skills = ['java', 'javascript', 'python', 'react', 'angular', 'mysql', 'postgres', 'aws', 'azure', 'gcp'];
      
      professionals.forEach(prof => {
        skills.forEach(skill => {
          if (prof[skill as keyof Professional] && prof[skill as keyof Professional] !== 'Sem conhecimento') {
            skillCounts[skill] = (skillCounts[skill] || 0) + 1;
          }
        });
      });

      const colors = ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#84cc16', '#6366f1', '#f97316'];
      
      const processedSkills = Object.entries(skillCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 8)
        .map(([name, count], index) => ({
          name: name.toUpperCase(),
          count,
          color: colors[index % colors.length]
        }));

      setSkillsData(processedSkills);
    };

    fetchContractData();
    processSkillsData();
  }, [professionals]);

  return (
    <>
      <Environment preset="night" />
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      
      {/* Iluminação dinâmica */}
      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#3b82f6" />
      <pointLight position={[-10, -10, -10]} intensity={0.8} color="#8b5cf6" />
      <pointLight position={[0, 15, 0]} intensity={0.6} color="#06b6d4" />
      
      {/* Controles de câmera */}
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={5}
        maxDistance={20}
        autoRotate
        autoRotateSpeed={0.5}
      />
      
      {/* Estatísticas flutuantes */}
      <FloatingStatCard
        position={[-4, 2, 0]}
        title="Total Profissionais"
        value={professionals.length.toString()}
        color="#3b82f6"
        delay={0}
      />
      
      <FloatingStatCard
        position={[4, 2, 0]}
        title="CLT"
        value={contractTypeCounts.cltCount.toString()}
        color="#10b981"
        delay={1}
      />
      
      <FloatingStatCard
        position={[0, 3.5, -2]}
        title="PJ"
        value={contractTypeCounts.pjCount.toString()}
        color="#f59e0b"
        delay={2}
      />
      
      {/* Visualização de skills */}
      {skillsData.length > 0 && (
        <SkillVisualization
          skills={skillsData}
          position={[0, -1, 0]}
        />
      )}
      
      {/* Título principal */}
      <Float speed={2} rotationIntensity={0.1} floatIntensity={0.3}>
        <Text
          position={[0, 5, -3]}
          fontSize={0.5}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          Dashboard Imersivo
        </Text>
      </Float>
      
      {/* Partículas decorativas */}
      <Sparkles count={100} scale={[15, 15, 15]} size={3} speed={0.3} />
    </>
  );
};

const ImmersiveDashboard: React.FC<ImmersiveDashboardProps> = ({ professionals, onNavigate }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [view3D, setView3D] = useState(true);

  useEffect(() => {
    // Simular carregamento
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
      {/* Loading Screen */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900"
          >
            <div className="text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
              />
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-2xl font-bold text-white mb-2"
              >
                Carregando Dashboard Imersivo
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-gray-400"
              >
                Preparando experiência 3D...
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header com controles */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="relative z-10 p-6 bg-black/20 backdrop-blur-md border-b border-white/10"
      >
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Dashboard Imersivo</h1>
            <p className="text-gray-300">Gestão de Profissionais em 3D</p>
          </div>
          
          <div className="flex gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setView3D(!view3D)}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <Globe className="w-5 h-5" />
              {view3D ? 'Visão 2D' : 'Visão 3D'}
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onNavigate('manual')}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <UserPlus className="w-5 h-5" />
              Adicionar
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onNavigate('excel')}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <Upload className="w-5 h-5" />
              Importar
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onNavigate('dashboard')}
              className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <BarChart3 className="w-5 h-5" />
              Dashboard
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* Conteúdo principal */}
      <div className="relative z-0 h-screen">
        {view3D ? (
          <Canvas
            camera={{ position: [0, 2, 8], fov: 75 }}
            gl={{
              antialias: true,
              alpha: true,
              powerPreference: "high-performance"
            }}
            onCreated={({ gl }) => {
              gl.setClearColor('#0f172a', 1);
              gl.toneMapping = THREE.ACESFilmicToneMapping;
              gl.toneMappingExposure = 1.2;
            }}
          >
            <Suspense fallback={null}>
              <Scene3D professionals={professionals} />
            </Suspense>
          </Canvas>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-8 text-white"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20"
              >
                <div className="flex items-center justify-between mb-4">
                  <Users className="w-8 h-8 text-blue-400" />
                  <span className="text-2xl font-bold">{professionals.length}</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">Total de Profissionais</h3>
                <p className="text-gray-300 text-sm">Profissionais cadastrados no sistema</p>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20"
              >
                <div className="flex items-center justify-between mb-4">
                  <TrendingUp className="w-8 h-8 text-green-400" />
                  <span className="text-2xl font-bold">85%</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">Taxa de Alocação</h3>
                <p className="text-gray-300 text-sm">Profissionais ativos em projetos</p>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20"
              >
                <div className="flex items-center justify-between mb-4">
                  <Award className="w-8 h-8 text-yellow-400" />
                  <span className="text-2xl font-bold">12</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">Skills Principais</h3>
                <p className="text-gray-300 text-sm">Tecnologias mais utilizadas</p>
              </motion.div>
            </div>
            
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-center"
            >
              <h2 className="text-2xl font-bold mb-4">Ative a Visão 3D para uma experiência imersiva!</h2>
              <p className="text-gray-300 mb-6">Explore os dados de forma interativa com nossa visualização tridimensional.</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setView3D(true)}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium transition-all flex items-center gap-2 mx-auto"
              >
                <Zap className="w-5 h-5" />
                Ativar Visão 3D
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ImmersiveDashboard;