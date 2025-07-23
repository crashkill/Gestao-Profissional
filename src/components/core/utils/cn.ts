import { ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function to merge class names with Tailwind CSS
 * Combines clsx for conditional classes with tailwind-merge to handle conflicting classes
 * 
 * @param inputs - Class values to merge
 * @returns Merged class string
 * 
 * @example
 * ```tsx
 * <div className={cn(
 *   'base-class',
 *   isActive && 'active-class',
 *   className
 * )}>
 *   Content
 * </div>
 * ```
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}