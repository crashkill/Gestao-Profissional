// 🎯 Constantes da UI Library

// === BREAKPOINTS ===
export const BREAKPOINTS = {
  xs: '480px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// === Z-INDEX ===
export const Z_INDEX = {
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
  toast: 1080,
  loading: 1090,
} as const;

// === CORES ===
export const COLORS = {
  // Cores primárias
  primary: {
    50: '#f5f3ff',
    100: '#ede9fe',
    200: '#ddd6fe',
    300: '#c4b5fd',
    400: '#a78bfa',
    500: '#8b5cf6',
    600: '#7c3aed',
    700: '#6d28d9',
    800: '#5b21b6',
    900: '#4c1d95',
  },
  
  // Cores secundárias
  secondary: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  },
  
  // Estados
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },
  
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },
  
  danger: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },
  
  info: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
} as const;

// === ESPAÇAMENTOS ===
export const SPACING = {
  0: '0px',
  1: '0.25rem',
  2: '0.5rem',
  3: '0.75rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  8: '2rem',
  10: '2.5rem',
  12: '3rem',
  16: '4rem',
  20: '5rem',
  24: '6rem',
  32: '8rem',
  40: '10rem',
  48: '12rem',
  56: '14rem',
  64: '16rem',
} as const;

// === TAMANHOS ===
export const SIZES = {
  xs: 'xs',
  sm: 'sm',
  md: 'md',
  lg: 'lg',
  xl: 'xl',
} as const;

// === VARIANTES ===
export const VARIANTS = {
  primary: 'primary',
  secondary: 'secondary',
  success: 'success',
  warning: 'warning',
  danger: 'danger',
  info: 'info',
  outline: 'outline',
  ghost: 'ghost',
  link: 'link',
} as const;

// === POSIÇÕES ===
export const POSITIONS = {
  top: 'top',
  'top-left': 'top-left',
  'top-right': 'top-right',
  bottom: 'bottom',
  'bottom-left': 'bottom-left',
  'bottom-right': 'bottom-right',
  left: 'left',
  right: 'right',
  center: 'center',
} as const;

// === DURAÇÕES DE ANIMAÇÃO ===
export const ANIMATION_DURATION = {
  fast: 150,
  normal: 300,
  slow: 500,
  slower: 750,
  slowest: 1000,
} as const;

// === CONFIGURAÇÕES DE UPLOAD ===
export const UPLOAD_CONFIG = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  acceptedFileTypes: {
    excel: ['.xlsx', '.xls', '.csv'],
    image: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
    document: ['.pdf', '.doc', '.docx', '.txt'],
    all: ['*'],
  },
  chunkSize: 1024 * 1024, // 1MB chunks
} as const;

// === CONFIGURAÇÕES DE TOAST ===
export const TOAST_CONFIG = {
  duration: {
    short: 3000,
    normal: 5000,
    long: 8000,
    persistent: 0,
  },
  position: {
    'top-left': 'top-left',
    'top-center': 'top-center',
    'top-right': 'top-right',
    'bottom-left': 'bottom-left',
    'bottom-center': 'bottom-center',
    'bottom-right': 'bottom-right',
  },
  maxToasts: 5,
} as const;

// === CONFIGURAÇÕES DE FORMULÁRIO ===
export const FORM_CONFIG = {
  validation: {
    debounceMs: 300,
    showErrorsOnBlur: true,
    showErrorsOnSubmit: true,
  },
  autoSave: {
    enabled: false,
    intervalMs: 30000, // 30 segundos
  },
} as const;

// === CONFIGURAÇÕES DE WEBGL ===
export const WEBGL_CONFIG = {
  default: {
    particleCount: 100,
    particleSize: 2,
    particleSpeed: 0.5,
    particleColor: '#8b5cf6',
    backgroundColor: 'transparent',
    enableInteraction: true,
    enableAnimation: true,
    fps: 60,
  },
  performance: {
    low: {
      particleCount: 50,
      particleSize: 1,
      particleSpeed: 0.3,
      fps: 30,
    },
    medium: {
      particleCount: 100,
      particleSize: 2,
      particleSpeed: 0.5,
      fps: 60,
    },
    high: {
      particleCount: 200,
      particleSize: 3,
      particleSpeed: 0.8,
      fps: 60,
    },
  },
} as const;

// === CONFIGURAÇÕES DE TEMA ===
export const THEME_CONFIG = {
  storageKey: 'ui-library-theme',
  defaultTheme: 'default',
  systemTheme: 'system',
} as const;

// === CONFIGURAÇÕES DE ACESSIBILIDADE ===
export const A11Y_CONFIG = {
  focusVisible: {
    outline: '2px solid #3b82f6',
    outlineOffset: '2px',
  },
  reducedMotion: {
    respectUserPreference: true,
    fallbackDuration: 0,
  },
  screenReader: {
    announceChanges: true,
    liveRegionPolite: 'polite',
    liveRegionAssertive: 'assertive',
  },
} as const;

// === CONFIGURAÇÕES DE PERFORMANCE ===
export const PERFORMANCE_CONFIG = {
  lazyLoading: {
    enabled: true,
    threshold: 0.1,
    rootMargin: '50px',
  },
  virtualization: {
    enabled: true,
    itemHeight: 50,
    overscan: 5,
  },
  debounce: {
    search: 300,
    resize: 100,
    scroll: 16,
  },
} as const;

// === MENSAGENS PADRÃO ===
export const DEFAULT_MESSAGES = {
  loading: 'Carregando...',
  error: 'Ops! Algo deu errado.',
  success: 'Operação realizada com sucesso!',
  noData: 'Nenhum dado encontrado.',
  retry: 'Tentar novamente',
  cancel: 'Cancelar',
  confirm: 'Confirmar',
  save: 'Salvar',
  edit: 'Editar',
  delete: 'Excluir',
  close: 'Fechar',
  back: 'Voltar',
  next: 'Próximo',
  previous: 'Anterior',
  upload: {
    dragDrop: 'Arraste e solte arquivos aqui ou clique para selecionar',
    uploading: 'Enviando arquivo...',
    success: 'Arquivo enviado com sucesso!',
    error: 'Erro ao enviar arquivo.',
    invalidType: 'Tipo de arquivo não suportado.',
    tooLarge: 'Arquivo muito grande.',
  },
  form: {
    required: 'Este campo é obrigatório.',
    invalidEmail: 'Email inválido.',
    invalidPhone: 'Telefone inválido.',
    minLength: 'Mínimo de {min} caracteres.',
    maxLength: 'Máximo de {max} caracteres.',
    passwordMismatch: 'Senhas não coincidem.',
  },
} as const;

// === ÍCONES PADRÃO ===
export const DEFAULT_ICONS = {
  close: '✕',
  check: '✓',
  warning: '⚠',
  error: '✕',
  info: 'ℹ',
  success: '✓',
  loading: '⟳',
  upload: '⬆',
  download: '⬇',
  edit: '✎',
  delete: '🗑',
  search: '🔍',
  filter: '⚡',
  sort: '⇅',
  menu: '☰',
  user: '👤',
  settings: '⚙',
  home: '🏠',
  back: '←',
  forward: '→',
  up: '↑',
  down: '↓',
} as const;

// === CONFIGURAÇÕES DE API ===
export const API_CONFIG = {
  timeout: 30000, // 30 segundos
  retries: 3,
  retryDelay: 1000, // 1 segundo
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
} as const;

// === TIPOS EXPORTADOS ===
export type ColorScale = typeof COLORS.primary;
export type SpacingKey = keyof typeof SPACING;
export type SizeKey = keyof typeof SIZES;
export type VariantKey = keyof typeof VARIANTS;
export type PositionKey = keyof typeof POSITIONS;
export type BreakpointKey = keyof typeof BREAKPOINTS;
export type ZIndexKey = keyof typeof Z_INDEX;