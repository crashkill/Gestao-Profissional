import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface StandardButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  gradient?: boolean;
}

const StandardButton: React.FC<StandardButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  disabled = false,
  loading = false,
  fullWidth = false,
  className = '',
  type = 'button',
  gradient = true
}) => {
  // Variant configurations
  const variantClasses = {
    primary: gradient 
      ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-transparent'
      : 'bg-purple-600 hover:bg-purple-700 text-white border-transparent',
    secondary: 'bg-slate-700 hover:bg-slate-600 text-white border-slate-600',
    success: gradient
      ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white border-transparent'
      : 'bg-green-600 hover:bg-green-700 text-white border-transparent',
    danger: gradient
      ? 'bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white border-transparent'
      : 'bg-red-600 hover:bg-red-700 text-white border-transparent',
    outline: 'bg-transparent hover:bg-slate-800/50 text-white border-slate-600 hover:border-slate-500',
    ghost: 'bg-transparent hover:bg-slate-800/30 text-slate-300 hover:text-white border-transparent'
  }[variant];

  // Size configurations
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-base',
    lg: 'px-6 py-3 text-lg',
    xl: 'px-8 py-4 text-xl'
  }[size];

  // Icon size based on button size
  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
    xl: 'h-7 w-7'
  }[size];

  const isDisabled = disabled || loading;

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      whileHover={!isDisabled ? { scale: 1.05 } : {}}
      whileTap={!isDisabled ? { scale: 0.95 } : {}}
      transition={{ duration: 0.2 }}
      className={`
        ${variantClasses}
        ${sizeClasses}
        ${fullWidth ? 'w-full' : ''}
        font-semibold
        rounded-xl
        border
        transition-all duration-300
        flex items-center justify-center gap-2
        focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:ring-offset-2 focus:ring-offset-slate-900
        ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
    >
      {/* Loading spinner */}
      {loading && (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className={`border-2 border-current border-t-transparent rounded-full ${iconSizes}`}
        />
      )}
      
      {/* Left icon */}
      {Icon && iconPosition === 'left' && !loading && (
        <Icon className={iconSizes} />
      )}
      
      {/* Button text */}
      <span>{children}</span>
      
      {/* Right icon */}
      {Icon && iconPosition === 'right' && !loading && (
        <Icon className={iconSizes} />
      )}
    </motion.button>
  );
};

export default StandardButton;