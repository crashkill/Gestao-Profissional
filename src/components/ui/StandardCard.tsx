import React from 'react';
import { motion } from 'framer-motion';

interface StandardCardProps {
  children: React.ReactNode;
  className?: string;
  animation?: 'slide-up' | 'slide-down' | 'slide-left' | 'slide-right' | 'fade' | 'scale';
  delay?: number;
  duration?: number;
  hover?: boolean;
  glow?: boolean;
  glowColor?: 'purple' | 'blue' | 'green' | 'pink' | 'cyan';
  padding?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'glass' | 'solid' | 'outline';
}

const StandardCard: React.FC<StandardCardProps> = ({
  children,
  className = '',
  animation = 'slide-up',
  delay = 0,
  duration = 0.5,
  hover = true,
  glow = false,
  glowColor = 'purple',
  padding = 'md',
  variant = 'default'
}) => {
  // Animation configurations
  const animationProps = {
    'slide-up': {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 }
    },
    'slide-down': {
      initial: { opacity: 0, y: -20 },
      animate: { opacity: 1, y: 0 }
    },
    'slide-left': {
      initial: { opacity: 0, x: 20 },
      animate: { opacity: 1, x: 0 }
    },
    'slide-right': {
      initial: { opacity: 0, x: -20 },
      animate: { opacity: 1, x: 0 }
    },
    'fade': {
      initial: { opacity: 0 },
      animate: { opacity: 1 }
    },
    'scale': {
      initial: { opacity: 0, scale: 0.9 },
      animate: { opacity: 1, scale: 1 }
    }
  }[animation];

  // Padding configurations
  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10'
  }[padding];

  // Variant configurations
  const variantClasses = {
    default: 'bg-slate-800/50 backdrop-blur-sm border border-slate-700/50',
    glass: 'bg-white/5 backdrop-blur-md border border-white/10',
    solid: 'bg-slate-800 border border-slate-700',
    outline: 'bg-transparent border-2 border-slate-600/50'
  }[variant];

  // Glow color configurations
  const glowClasses = {
    purple: 'shadow-purple-500/20',
    blue: 'shadow-blue-500/20',
    green: 'shadow-green-500/20',
    pink: 'shadow-pink-500/20',
    cyan: 'shadow-cyan-500/20'
  }[glowColor];

  // Hover effects
  const hoverProps = hover ? {
    whileHover: { 
      scale: 1.02,
      transition: { duration: 0.2 }
    },
    whileTap: { scale: 0.98 }
  } : {};

  return (
    <motion.div
      {...animationProps}
      {...hoverProps}
      transition={{ delay, duration }}
      className={`
        ${variantClasses}
        ${paddingClasses}
        rounded-2xl
        transition-all duration-300
        ${glow ? `shadow-2xl ${glowClasses}` : ''}
        ${hover ? 'hover:border-slate-600/70 cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
};

export default StandardCard;