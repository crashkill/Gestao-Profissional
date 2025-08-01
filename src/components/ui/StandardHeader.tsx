import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

interface StandardHeaderProps {
  title: string;
  description?: string;
  onBack?: () => void;
  showBackButton?: boolean;
  gradient?: 'purple-blue' | 'green-emerald' | 'blue-cyan' | 'purple-pink';
  className?: string;
  children?: React.ReactNode;
}

const StandardHeader: React.FC<StandardHeaderProps> = ({
  title,
  description,
  onBack,
  showBackButton = true,
  gradient = 'purple-blue',
  className = '',
  children
}) => {
  const gradientClasses = {
    'purple-blue': 'from-purple-400 to-blue-400',
    'green-emerald': 'from-green-400 to-emerald-400',
    'blue-cyan': 'from-blue-400 to-cyan-400',
    'purple-pink': 'from-purple-400 to-pink-400'
  }[gradient];

  const glowClasses = {
    'purple-blue': 'from-purple-600/20 to-blue-600/20',
    'green-emerald': 'from-green-600/20 to-emerald-600/20',
    'blue-cyan': 'from-blue-600/20 to-cyan-600/20',
    'purple-pink': 'from-purple-600/20 to-pink-600/20'
  }[gradient];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={`relative mb-8 ${className}`}
    >
      {/* Glow effect */}
      <div className={`absolute inset-0 bg-gradient-to-r ${glowClasses} rounded-2xl blur-xl`} />
      
      {/* Main header container */}
      <div className="relative bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
        <div className="flex items-center gap-4">
          {/* Back button */}
          {showBackButton && onBack && (
            <motion.button
              whileHover={{ scale: 1.1, rotate: -5 }}
              whileTap={{ scale: 0.9 }}
              onClick={onBack}
              className="p-3 bg-slate-700/50 hover:bg-slate-600/50 rounded-xl transition-all duration-300 border border-slate-600/50 group"
            >
              <ArrowLeft className="h-6 w-6 text-white group-hover:text-purple-300 transition-colors" />
            </motion.button>
          )}
          
          {/* Title and description */}
          <div className="flex-1">
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className={`text-4xl font-bold bg-gradient-to-r ${gradientClasses} bg-clip-text text-transparent`}
            >
              {title}
            </motion.h1>
            
            {description && (
              <motion.p 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="text-slate-300 text-lg mt-2"
              >
                {description}
              </motion.p>
            )}
          </div>
          
          {/* Additional content */}
          {children && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="flex items-center gap-3"
            >
              {children}
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default StandardHeader;