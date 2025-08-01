import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight } from 'lucide-react';

interface SuccessScreenProps {
  title: string;
  message: string;
  buttonText: string;
  onButtonClick: () => void;
  stats?: Array<{
    label: string;
    value: string | number;
  }>;
  autoRedirect?: boolean;
  redirectDelay?: number;
}

export const SuccessScreen: React.FC<SuccessScreenProps> = ({
  title,
  message,
  buttonText,
  onButtonClick,
  stats,
  autoRedirect = false,
  redirectDelay = 3000
}) => {
  React.useEffect(() => {
    if (autoRedirect) {
      const timer = setTimeout(onButtonClick, redirectDelay);
      return () => clearTimeout(timer);
    }
  }, [autoRedirect, redirectDelay, onButtonClick]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-6"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-12 text-center max-w-md w-full"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
          className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircle className="w-12 h-12 text-white" />
        </motion.div>
        
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-2xl font-bold text-white mb-4"
        >
          {title}
        </motion.h2>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="text-gray-300 mb-8"
        >
          {message}
        </motion.p>
        
        {stats && stats.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-gray-700/50 rounded-lg p-4 mb-8"
          >
            <div className="grid grid-cols-1 gap-3">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.9 + index * 0.1 }}
                  className="flex justify-between items-center"
                >
                  <span className="text-gray-400">{stat.label}:</span>
                  <span className="text-white font-semibold">{stat.value}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
        
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          onClick={onButtonClick}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 flex items-center justify-center gap-2 group"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {buttonText}
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </motion.button>
        
        {autoRedirect && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="text-gray-500 text-sm mt-4"
          >
            Redirecionando automaticamente em {redirectDelay / 1000} segundos...
          </motion.p>
        )}
      </motion.div>
    </motion.div>
  );
};