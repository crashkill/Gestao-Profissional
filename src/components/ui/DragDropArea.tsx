import React from 'react';
import { motion } from 'framer-motion';
import { Upload, FileSpreadsheet, AlertCircle } from 'lucide-react';

interface DragDropAreaProps {
  isDragOver: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  acceptedFileTypes: string;
  title: string;
  subtitle: string;
  errorMessage?: string;
  isProcessing?: boolean;
  children?: React.ReactNode;
}

export const DragDropArea: React.FC<DragDropAreaProps> = ({
  isDragOver,
  onDragOver,
  onDragLeave,
  onDrop,
  onFileSelect,
  acceptedFileTypes,
  title,
  subtitle,
  errorMessage,
  isProcessing = false,
  children
}) => {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className={`
          relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300
          ${isDragOver 
            ? 'border-blue-400 bg-blue-500/10 scale-105' 
            : 'border-gray-600 hover:border-gray-500'
          }
          ${isProcessing ? 'opacity-50 pointer-events-none' : ''}
        `}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <input
          type="file"
          accept={acceptedFileTypes}
          onChange={onFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isProcessing}
        />
        
        <motion.div
          animate={isDragOver ? { scale: 1.1 } : { scale: 1 }}
          className="space-y-4"
        >
          <div className="flex justify-center">
            <motion.div
              animate={isDragOver ? { rotate: 360 } : { rotate: 0 }}
              transition={{ duration: 0.5 }}
              className={`
                w-16 h-16 rounded-full flex items-center justify-center
                ${isDragOver 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-700 text-gray-300'
                }
              `}
            >
              {isDragOver ? (
                <FileSpreadsheet className="w-8 h-8" />
              ) : (
                <Upload className="w-8 h-8" />
              )}
            </motion.div>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold text-white mb-2">
              {title}
            </h3>
            <p className="text-gray-400">
              {subtitle}
            </p>
          </div>
        </motion.div>
      </motion.div>
      
      {errorMessage && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-4"
        >
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{errorMessage}</span>
        </motion.div>
      )}
      
      {children}
    </div>
  );
};