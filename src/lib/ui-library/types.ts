// 📝 Tipos e Interfaces da UI Library

import { ReactNode } from 'react';
import { MotionProps } from 'framer-motion';

// === TIPOS BASE ===
export type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type Variant = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'ghost' | 'outline';
export type ColorScheme = 'blue' | 'purple' | 'green' | 'red' | 'yellow' | 'gray';
export type Position = 'top' | 'bottom' | 'left' | 'right' | 'center';

// === INTERFACES DE COMPONENTES ===

// Interface base para todos os componentes
export interface BaseComponentProps {
  className?: string;
  children?: ReactNode;
  id?: string;
  'data-testid'?: string;
}

// Interface para componentes com animação
export interface AnimatedComponentProps extends BaseComponentProps {
  animate?: boolean;
  animationDelay?: number;
  motionProps?: MotionProps;
}

// Interface para botões
export interface ButtonProps extends AnimatedComponentProps {
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  gradient?: boolean;
  colorScheme?: ColorScheme;
}

// Interface para cards
export interface CardProps extends AnimatedComponentProps {
  variant?: 'default' | 'glass' | 'solid' | 'outline';
  padding?: Size;
  hover?: boolean;
  glow?: boolean;
  gradient?: boolean;
}

// Interface para headers
export interface HeaderProps extends AnimatedComponentProps {
  title: string;
  description?: string;
  showBackButton?: boolean;
  onBack?: () => void;
  gradient?: ColorScheme;
  actions?: ReactNode;
}

// Interface para layouts
export interface LayoutProps extends BaseComponentProps {
  variant?: 'default' | 'purple' | 'blue' | 'green';
  showWebGL?: boolean;
  webglConfig?: Partial<WebGLConfig>;
}

// === INTERFACES DE DADOS ===

// Interface para profissionais
export interface Professional {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  skills: Skill[];
  createdAt?: string;
  updatedAt?: string;
}

// Interface para habilidades
export interface Skill {
  id?: string;
  name: string;
  category?: string;
  level?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

// Interface para dados do Excel
export interface ExcelRow {
  [key: string]: any;
  name?: string;
  email?: string;
  phone?: string;
  skills?: string;
}

// === INTERFACES DE CONFIGURAÇÃO ===

// Interface para configuração do WebGL
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

// Interface para tema
export interface UITheme {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: {
      primary: string;
      secondary: string;
      muted: string;
    };
    border: string;
    success: string;
    warning: string;
    error: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
    full: string;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
}

// === INTERFACES DE ESTADO ===

// Interface para estado de upload
export interface UploadState {
  isDragActive: boolean;
  isDragAccept: boolean;
  isDragReject: boolean;
  files: File[];
  progress: number;
  error?: string;
}

// Interface para estado de formulário
export interface FormState<T = any> {
  data: T;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  isValid: boolean;
}

// Interface para estado de toast
export interface ToastState {
  id: string;
  title?: string;
  description?: string;
  variant: 'default' | 'success' | 'error' | 'warning';
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// === TIPOS DE EVENTOS ===

export type UploadEventHandler = (files: File[]) => void;
export type FormSubmitHandler<T = any> = (data: T) => void | Promise<void>;
export type ToastActionHandler = () => void;

// === TIPOS UTILITÁRIOS ===

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// === TIPOS DE RESPOSTA DA API ===

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// === TIPOS DE HOOK ===

export interface UseToastReturn {
  toast: (props: Omit<ToastState, 'id'>) => void;
  dismiss: (id: string) => void;
  toasts: ToastState[];
}

export interface UseFormReturn<T = any> {
  data: T;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  isValid: boolean;
  setValue: (field: keyof T, value: any) => void;
  setError: (field: keyof T, error: string) => void;
  clearError: (field: keyof T) => void;
  handleSubmit: (onSubmit: FormSubmitHandler<T>) => (e?: React.FormEvent) => void;
  reset: () => void;
}