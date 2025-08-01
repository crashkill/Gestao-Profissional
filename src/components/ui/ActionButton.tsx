import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface ActionButtonProps {
  icon: LucideIcon;
  title: string;
  description: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

const getVariantStyles = (variant: string) => {
  switch (variant) {
    case 'primary':
      return 'from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700';
    case 'secondary':
      return 'from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800';
    case 'success':
      return 'from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700';
    case 'warning':
      return 'from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700';
    case 'danger':
      return 'from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700';
    default:
      return 'from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700';
  }
};

const getSizeStyles = (size: string) => {
  switch (size) {
    case 'sm':
      return 'p-4 text-sm';
    case 'md':
      return 'p-6 text-base';
    case 'lg':
      return 'p-8 text-lg';
    default:
      return 'p-6 text-base';
  }
};

export const ActionButton: React.FC<ActionButtonProps> = ({
  icon: Icon,
  title,
  description,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  className = ''
}) => {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        relative overflow-hidden rounded-xl text-white font-semibold
        bg-gradient-to-r ${getVariantStyles(variant)}
        ${getSizeStyles(size)}
        transition-all duration-200 group
        ${disabled || loading ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg hover:scale-105'}
        ${className}
      `}
      whileHover={!disabled && !loading ? { scale: 1.02 } : {}}
      whileTap={!disabled && !loading ? { scale: 0.98 } : {}}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Background overlay effect */}
      <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
      
      <div className="relative flex items-center gap-4">
        <div className="flex-shrink-0">
          {loading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full"
            />
          ) : (
            <Icon className="w-6 h-6" />
          )}
        </div>
        
        <div className="flex-1 text-left">
          <h3 className="font-bold mb-1">{title}</h3>
          <p className="text-white/80 text-sm">{description}</p>
        </div>
        
        <motion.div
          className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
          animate={{ x: [0, 5, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </motion.div>
      </div>
    </motion.button>
  );
};

// Componente para grupo de botões de ação
interface ActionButtonGroupProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ActionButtonGroup: React.FC<ActionButtonGroupProps> = ({
  children,
  columns = 1,
  gap = 'md',
  className = ''
}) => {
  const getGridCols = () => {
    switch (columns) {
      case 1: return 'grid-cols-1';
      case 2: return 'grid-cols-1 md:grid-cols-2';
      case 3: return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
      default: return 'grid-cols-1';
    }
  };

  const getGapSize = () => {
    switch (gap) {
      case 'sm': return 'gap-3';
      case 'md': return 'gap-6';
      case 'lg': return 'gap-8';
      default: return 'gap-6';
    }
  };

  return (
    <div className={`grid ${getGridCols()} ${getGapSize()} ${className}`}>
      {children}
    </div>
  );
};