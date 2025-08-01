import React from 'react';
import { motion } from 'framer-motion';
import WebGLBackground from '../WebGLBackground';

interface WebGLConfig {
  colorScheme: 'blue' | 'purple' | 'green' | 'custom';
  animationIntensity: 'low' | 'medium' | 'high';
  particleCount: number;
  shootingStarCount: number;
  orbCount: number;
  customColors?: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

interface BaseLayoutProps {
  children: React.ReactNode;
  variant?: 'default' | 'purple' | 'blue' | 'green';
  showWebGL?: boolean;
  webglConfig?: Partial<WebGLConfig>;
  className?: string;
}

const BaseLayout: React.FC<BaseLayoutProps> = ({ 
  children, 
  variant = 'default', 
  showWebGL = false,
  webglConfig,
  className = ''
}) => {
  const backgroundClass = {
    default: 'from-slate-900 via-slate-800 to-slate-900',
    purple: 'from-slate-900 via-purple-900 to-slate-900',
    blue: 'from-slate-900 via-blue-900 to-slate-900',
    green: 'from-slate-900 via-emerald-900 to-slate-900'
  }[variant];

  const defaultWebGLConfig: WebGLConfig = {
    colorScheme: 'blue',
    animationIntensity: 'medium',
    particleCount: 1000,
    shootingStarCount: 5,
    orbCount: 6,
    ...webglConfig
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${backgroundClass} relative overflow-hidden ${className}`}>
      {showWebGL && (
        <div className="absolute inset-0 z-0">
          <WebGLBackground />
        </div>
      )}
      
      {/* Overlay gradient for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20 z-5" />
      
      {/* Content */}
      <div className="relative z-10 min-h-screen">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="h-full"
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
};

export default BaseLayout;