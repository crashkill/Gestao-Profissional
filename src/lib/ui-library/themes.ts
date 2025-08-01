// 🎨 Sistema de Temas da UI Library

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

// Tema Padrão (Purple/Violet)
export const defaultTheme: UITheme = {
  name: 'default',
  colors: {
    primary: 'rgb(139, 92, 246)', // violet-500
    secondary: 'rgb(168, 85, 247)', // purple-500
    accent: 'rgb(59, 130, 246)', // blue-500
    background: 'rgb(15, 23, 42)', // slate-900
    surface: 'rgb(30, 41, 59)', // slate-800
    text: {
      primary: 'rgb(248, 250, 252)', // slate-50
      secondary: 'rgb(203, 213, 225)', // slate-300
      muted: 'rgb(148, 163, 184)', // slate-400
    },
    border: 'rgb(51, 65, 85)', // slate-700
    success: 'rgb(34, 197, 94)', // green-500
    warning: 'rgb(245, 158, 11)', // amber-500
    error: 'rgb(239, 68, 68)', // red-500
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
  },
  borderRadius: {
    sm: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    full: '9999px',
  },
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  },
};

// Tema Azul
export const blueTheme: UITheme = {
  ...defaultTheme,
  name: 'blue',
  colors: {
    ...defaultTheme.colors,
    primary: 'rgb(59, 130, 246)', // blue-500
    secondary: 'rgb(37, 99, 235)', // blue-600
    accent: 'rgb(14, 165, 233)', // sky-500
  },
};

// Tema Verde
export const greenTheme: UITheme = {
  ...defaultTheme,
  name: 'green',
  colors: {
    ...defaultTheme.colors,
    primary: 'rgb(34, 197, 94)', // green-500
    secondary: 'rgb(22, 163, 74)', // green-600
    accent: 'rgb(16, 185, 129)', // emerald-500
  },
};

// Tema Claro
export const lightTheme: UITheme = {
  ...defaultTheme,
  name: 'light',
  colors: {
    ...defaultTheme.colors,
    background: 'rgb(248, 250, 252)', // slate-50
    surface: 'rgb(255, 255, 255)', // white
    text: {
      primary: 'rgb(15, 23, 42)', // slate-900
      secondary: 'rgb(51, 65, 85)', // slate-700
      muted: 'rgb(100, 116, 139)', // slate-500
    },
    border: 'rgb(226, 232, 240)', // slate-200
  },
};

export const themes = {
  default: defaultTheme,
  blue: blueTheme,
  green: greenTheme,
  light: lightTheme,
};

export type ThemeName = keyof typeof themes;

// Hook para usar temas
export const useTheme = (themeName: ThemeName = 'default') => {
  return themes[themeName];
};