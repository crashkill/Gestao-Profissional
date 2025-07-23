import React, { createContext, useContext, useState } from 'react';
import { WithChildrenProps } from '../core/types';
import { cn } from '../core/utils/cn';

/**
 * Form context to manage form state and validation
 */
interface FormContextValue {
  /** Form values as a record */
  values: Record<string, any>;
  /** Form errors as a record */
  errors: Record<string, string>;
  /** Whether the form is currently submitting */
  isSubmitting: boolean;
  /** Set a form field value */
  setFieldValue: (name: string, value: any) => void;
  /** Set a form field error */
  setFieldError: (name: string, error: string) => void;
  /** Clear a form field error */
  clearFieldError: (name: string) => void;
  /** Check if a field has an error */
  hasFieldError: (name: string) => boolean;
  /** Get a field error message */
  getFieldError: (name: string) => string | undefined;
}

const FormContext = createContext<FormContextValue | undefined>(undefined);

/**
 * Hook to access form context
 */
export const useFormContext = () => {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('useFormContext must be used within a Form component');
  }
  return context;
};

export interface FormProps extends WithChildrenProps {
  /** Initial form values */
  initialValues?: Record<string, any>;
  /** Callback when form is submitted */
  onSubmit?: (values: Record<string, any>) => void | Promise<void>;
  /** Callback when form values change */
  onChange?: (values: Record<string, any>) => void;
  /** Whether to validate on blur */
  validateOnBlur?: boolean;
  /** Whether to validate on change */
  validateOnChange?: boolean;
}

/**
 * Form component that manages form state and validation
 * 
 * @example
 * ```tsx
 * <Form
 *   initialValues={{ name: '', email: '' }}
 *   onSubmit={async (values) => {
 *     await saveData(values);
 *   }}
 * >
 *   <FormField name="name" label="Name" />
 *   <FormField name="email" label="Email" />
 *   <Button type="submit">Submit</Button>
 * </Form>
 * ```
 */
export const Form: React.FC<FormProps> = ({
  children,
  initialValues = {},
  onSubmit,
  onChange,
  validateOnBlur = true,
  validateOnChange = false,
  className,
  testId,
}) => {
  const [values, setValues] = useState<Record<string, any>>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setFieldValue = (name: string, value: any) => {
    const newValues = { ...values, [name]: value };
    setValues(newValues);
    
    if (validateOnChange) {
      clearFieldError(name);
    }
    
    if (onChange) {
      onChange(newValues);
    }
  };

  const setFieldError = (name: string, error: string) => {
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const clearFieldError = (name: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[name];
      return newErrors;
    });
  };

  const hasFieldError = (name: string) => {
    return !!errors[name];
  };

  const getFieldError = (name: string) => {
    return errors[name];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (onSubmit) {
      setIsSubmitting(true);
      try {
        await onSubmit(values);
      } catch (error) {
        console.error('Form submission error:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const formContextValue: FormContextValue = {
    values,
    errors,
    isSubmitting,
    setFieldValue,
    setFieldError,
    clearFieldError,
    hasFieldError,
    getFieldError,
  };

  return (
    <FormContext.Provider value={formContextValue}>
      <form 
        onSubmit={handleSubmit} 
        className={cn('space-y-4', className)}
        data-testid={testId}
      >
        {children}
      </form>
    </FormContext.Provider>
  );
};

export default Form;