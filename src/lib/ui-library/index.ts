// 🎨 UI Library - Biblioteca de Componentes Padronizados

// === COMPONENTES BASE ===
export { default as BaseLayout } from '../../components/ui/BaseLayout';
export { default as StandardHeader } from '../../components/ui/StandardHeader';
export { default as StandardCard } from '../../components/ui/StandardCard';
export { default as StandardButton } from '../../components/ui/StandardButton';

// === COMPONENTES VISUAIS ===
export { default as WebGLBackground } from '../../components/WebGLBackground';

// === COMPONENTES DE UI SHADCN ===
export { Button } from '../../components/ui/button';
export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
export { Input } from '../../components/ui/input';
export { Label } from '../../components/ui/label';
export { Toaster } from '../../components/ui/toaster';

// === MÓDULOS ===
export * as themes from './themes';
export * as utils from './utils';
export * as config from './config';
export * as types from './types';
export * as hooks from './hooks';
export * as animations from './animations';
export * as constants from './constants';

// === EXPORTAÇÕES DIRETAS PARA FACILITAR O USO ===
// Temas
export { defaultTheme, blueTheme, greenTheme, lightTheme, useTheme } from './themes';

// Utilitários principais
export { cn, debounce } from './utils';

// Hooks principais
export { useForm, useUpload, useDebounce, useLocalStorage, useMediaQuery, useClickOutside } from './hooks';

// === TIPOS PRINCIPAIS ===
export type { UITheme, WebGLConfig, BaseComponentProps, AnimatedComponentProps } from './types';
export type { ButtonProps, CardProps, HeaderProps, LayoutProps } from './types';
export type { Professional, Skill, ExcelRow } from './types';
export type { UploadState, FormState, ToastState } from './types';
export type { UseToastReturn, UseFormReturn } from './types';