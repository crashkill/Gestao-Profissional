// Biblioteca de Componentes UI Reutilizáveis
// Baseada nos padrões visuais do ExcelImport.tsx

export { PageHeader } from './PageHeader';
export { DragDropArea } from './DragDropArea';
export { SuccessScreen } from './SuccessScreen';
export { FeedbackSystem, useFeedback } from './FeedbackSystem';
export { ActionButton, ActionButtonGroup } from './ActionButton';
export { default as WebGLBackground } from './WebGLBackground';
export type { WebGLBackgroundProps } from './WebGLBackground';

// New Standardized Components
export { default as BaseLayout } from './BaseLayout';
export { default as StandardHeader } from './StandardHeader';
export { default as StandardCard } from './StandardCard';
export { default as StandardButton } from './StandardButton';

// Existing UI Components (only the ones that exist)
export { Button } from './button';
export { Input } from './input';
export { Label } from './label';
export { Select } from './select';
export { Command } from './command';
export { Card } from './card';
export { useToast } from './use-toast';

// Theme and configuration interfaces
export interface WebGLConfig {
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

export interface UITheme {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
  };
  gradients: {
    primary: string;
    secondary: string;
    accent: string;
  };
  animations: {
    duration: {
      fast: number;
      normal: number;
      slow: number;
    };
    easing: string;
  };
}

// Tipos e interfaces compartilhadas
export type { 
  // Adicionar tipos conforme necessário
} from './types';