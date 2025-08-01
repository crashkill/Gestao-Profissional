// ⚙️ Configurações da UI Library

import { UITheme } from './themes';

// Configuração do WebGL Background
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

// Configurações padrão do WebGL
export const defaultWebGLConfig: WebGLConfig = {
  colorScheme: 'purple',
  animationIntensity: 'medium',
  particleCount: 100,
  shootingStarCount: 3,
  orbCount: 2,
};

// Configurações de animação
export const animationConfig = {
  duration: {
    fast: 0.15,
    normal: 0.3,
    slow: 0.5,
  },
  easing: {
    easeOut: [0.4, 0, 0.2, 1],
    easeIn: [0.4, 0, 1, 1],
    easeInOut: [0.4, 0, 0.2, 1],
    bounce: [0.68, -0.55, 0.265, 1.55],
  },
  stagger: {
    children: 0.1,
    items: 0.05,
  },
};

// Configurações de breakpoints
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

// Configurações de z-index
export const zIndex = {
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
  toast: 1080,
};

// Configurações de toast
export const toastConfig = {
  duration: {
    success: 3000,
    error: 5000,
    warning: 4000,
    info: 3000,
  },
  position: {
    top: 'top-center',
    bottom: 'bottom-center',
    topRight: 'top-right',
    bottomRight: 'bottom-right',
  } as const,
};

// Configurações de upload
export const uploadConfig = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    '.xlsx',
    '.xls'
  ],
  dragDropMessages: {
    idle: 'Arraste e solte seu arquivo Excel aqui, ou clique para selecionar',
    dragActive: 'Solte o arquivo aqui...',
    dragReject: 'Tipo de arquivo não suportado',
  },
};

// Configurações de formulário
export const formConfig = {
  validation: {
    debounceMs: 300,
    showErrorsOnBlur: true,
    showErrorsOnSubmit: true,
  },
  fields: {
    name: {
      minLength: 2,
      maxLength: 100,
      required: true,
    },
    email: {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    phone: {
      required: false,
      pattern: /^\(?\d{2}\)?[\s-]?\d{4,5}[\s-]?\d{4}$/,
    },
  },
};

// Configurações da biblioteca
export const libraryConfig = {
  name: 'Gestão Profissional UI Library',
  version: '1.0.0',
  prefix: 'gp-ui',
  defaultTheme: 'default' as keyof typeof import('./themes').themes,
  enableAnimations: true,
  enableWebGL: true,
  enableToasts: true,
};