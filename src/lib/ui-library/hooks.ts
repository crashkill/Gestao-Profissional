// 🪝 Hooks Customizados da UI Library

import { useState, useEffect, useCallback, useRef } from 'react';
import { FormState, FormSubmitHandler, UseFormReturn, UploadState, ToastState, UseToastReturn } from './types';
import { debounce } from './utils';

// === HOOK DE FORMULÁRIO ===
export function useForm<T extends Record<string, any>>(
  initialData: T,
  validationRules?: Partial<Record<keyof T, (value: any) => string | undefined>>
): UseFormReturn<T> {
  const [state, setState] = useState<FormState<T>>({
    data: initialData,
    errors: {},
    touched: {},
    isSubmitting: false,
    isValid: true,
  });

  const validateField = useCallback(
    (field: keyof T, value: any): string | undefined => {
      if (validationRules && validationRules[field]) {
        return validationRules[field]!(value);
      }
      return undefined;
    },
    [validationRules]
  );

  const setValue = useCallback((field: keyof T, value: any) => {
    setState(prev => {
      const newData = { ...prev.data, [field]: value };
      const error = validateField(field, value);
      const newErrors = { ...prev.errors };
      
      if (error) {
        newErrors[field as string] = error;
      } else {
        delete newErrors[field as string];
      }

      return {
        ...prev,
        data: newData,
        errors: newErrors,
        touched: { ...prev.touched, [field]: true },
        isValid: Object.keys(newErrors).length === 0,
      };
    });
  }, [validateField]);

  const setError = useCallback((field: keyof T, error: string) => {
    setState(prev => ({
      ...prev,
      errors: { ...prev.errors, [field]: error },
      isValid: false,
    }));
  }, []);

  const clearError = useCallback((field: keyof T) => {
    setState(prev => {
      const newErrors = { ...prev.errors };
      delete newErrors[field as string];
      return {
        ...prev,
        errors: newErrors,
        isValid: Object.keys(newErrors).length === 0,
      };
    });
  }, []);

  const handleSubmit = useCallback(
    (onSubmit: FormSubmitHandler<T>) => (e?: React.FormEvent) => {
      if (e) e.preventDefault();
      
      setState(prev => ({ ...prev, isSubmitting: true }));
      
      try {
        const result = onSubmit(state.data);
        if (result instanceof Promise) {
          result.finally(() => {
            setState(prev => ({ ...prev, isSubmitting: false }));
          });
        } else {
          setState(prev => ({ ...prev, isSubmitting: false }));
        }
      } catch (error) {
        setState(prev => ({ ...prev, isSubmitting: false }));
      }
    },
    [state.data]
  );

  const reset = useCallback(() => {
    setState({
      data: initialData,
      errors: {},
      touched: {},
      isSubmitting: false,
      isValid: true,
    });
  }, [initialData]);

  return {
    data: state.data,
    errors: state.errors,
    touched: state.touched,
    isSubmitting: state.isSubmitting,
    isValid: state.isValid,
    setValue,
    setError,
    clearError,
    handleSubmit,
    reset,
  };
}

// === HOOK DE UPLOAD ===
export function useUpload(
  onUpload?: (files: File[]) => void,
  acceptedTypes?: string[],
  maxFileSize?: number
) {
  const [state, setState] = useState<UploadState>({
    isDragActive: false,
    isDragAccept: false,
    isDragReject: false,
    files: [],
    progress: 0,
  });

  const validateFile = useCallback(
    (file: File): boolean => {
      if (maxFileSize && file.size > maxFileSize) {
        setState(prev => ({ ...prev, error: 'Arquivo muito grande' }));
        return false;
      }
      
      if (acceptedTypes && !acceptedTypes.some(type => 
        file.type === type || file.name.endsWith(type)
      )) {
        setState(prev => ({ ...prev, error: 'Tipo de arquivo não suportado' }));
        return false;
      }
      
      return true;
    },
    [acceptedTypes, maxFileSize]
  );

  const handleDrop = useCallback(
    (files: File[]) => {
      const validFiles = files.filter(validateFile);
      
      setState(prev => ({
        ...prev,
        files: validFiles,
        isDragActive: false,
        isDragAccept: false,
        isDragReject: false,
        error: undefined,
      }));
      
      if (validFiles.length > 0 && onUpload) {
        onUpload(validFiles);
      }
    },
    [validateFile, onUpload]
  );

  const handleDragEnter = useCallback(() => {
    setState(prev => ({ ...prev, isDragActive: true }));
  }, []);

  const handleDragLeave = useCallback(() => {
    setState(prev => ({ 
      ...prev, 
      isDragActive: false,
      isDragAccept: false,
      isDragReject: false,
    }));
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const hasValidFiles = Array.from(e.dataTransfer.items).some(item => {
      if (acceptedTypes) {
        return acceptedTypes.some(type => 
          item.type === type || item.type.includes(type.replace('.', ''))
        );
      }
      return true;
    });

    setState(prev => ({
      ...prev,
      isDragAccept: hasValidFiles,
      isDragReject: !hasValidFiles,
    }));
  }, [acceptedTypes]);

  const clearFiles = useCallback(() => {
    setState(prev => ({ ...prev, files: [], error: undefined }));
  }, []);

  const setProgress = useCallback((progress: number) => {
    setState(prev => ({ ...prev, progress }));
  }, []);

  return {
    ...state,
    handleDrop,
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    clearFiles,
    setProgress,
  };
}

// === HOOK DE TOAST ===
export function useToast(): UseToastReturn {
  const [toasts, setToasts] = useState<ToastState[]>([]);

  const toast = useCallback((props: Omit<ToastState, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: ToastState = {
      id,
      duration: 3000,
      ...props,
    };

    setToasts(prev => [...prev, newToast]);

    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, newToast.duration);
    }
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return { toast, dismiss, toasts };
}

// === HOOK DE DEBOUNCE ===
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// === HOOK DE LOCAL STORAGE ===
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        console.error('Error saving to localStorage:', error);
      }
    },
    [key, storedValue]
  );

  return [storedValue, setValue];
}

// === HOOK DE MEDIA QUERY ===
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [matches, query]);

  return matches;
}

// === HOOK DE CLICK OUTSIDE ===
export function useClickOutside(
  ref: React.RefObject<HTMLElement>,
  handler: () => void
) {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      handler();
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
}