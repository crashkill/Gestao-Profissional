/**
 * Core component types for the application
 * This file defines the base types and interfaces used across components
 */

import { ReactNode, HTMLAttributes, ComponentPropsWithoutRef } from 'react';

/**
 * Base props interface that all components should extend
 */
export interface BaseComponentProps {
  /** Optional CSS class name */
  className?: string;
  /** Optional ID attribute */
  id?: string;
  /** Optional data-testid for testing */
  testId?: string;
}

/**
 * Props for components that can contain children
 */
export interface WithChildrenProps extends BaseComponentProps {
  /** Child elements */
  children?: ReactNode;
}

/**
 * Props for components that can be disabled
 */
export interface DisableableProps {
  /** Whether the component is disabled */
  disabled?: boolean;
}

/**
 * Props for components that can show a loading state
 */
export interface LoadableProps {
  /** Whether the component is in a loading state */
  isLoading?: boolean;
}

/**
 * Props for form field components
 */
export interface FormFieldProps<T = string> extends BaseComponentProps, DisableableProps {
  /** Field name */
  name: string;
  /** Field label */
  label?: string;
  /** Field value */
  value?: T;
  /** Callback when value changes */
  onChange?: (value: T) => void;
  /** Whether the field is required */
  required?: boolean;
  /** Error message to display */
  error?: string;
  /** Helper text to display */
  helperText?: string;
}

/**
 * Props for components that can be validated
 */
export interface ValidatableProps {
  /** Whether the component is in an error state */
  hasError?: boolean;
  /** Error message to display */
  errorMessage?: string;
}

/**
 * Utility type to combine HTML element props with custom props
 */
export type PolymorphicComponentProps<
  Element extends React.ElementType,
  Props = {}
> = Props & Omit<ComponentPropsWithoutRef<Element>, keyof Props>;

/**
 * Props for components that can have different variants
 */
export interface VariantProps<T extends string = string> {
  /** Component visual variant */
  variant?: T;
}

/**
 * Props for components that can have different sizes
 */
export interface SizeProps<T extends string = 'sm' | 'md' | 'lg'> {
  /** Component size */
  size?: T;
}

/**
 * Props for components that can have different colors
 */
export interface ColorProps<T extends string = string> {
  /** Component color */
  color?: T;
}

/**
 * Props for components that can be focused
 */
export interface FocusableProps {
  /** Whether the component should auto-focus */
  autoFocus?: boolean;
}

/**
 * Props for components that can trigger actions
 */
export interface ActionableProps<T = void> {
  /** Callback when the action is triggered */
  onAction?: (data?: T) => void;
}