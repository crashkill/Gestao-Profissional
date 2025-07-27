/**
 * Command component for search and selection
 */

import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../../lib/utils';

interface CommandProps {
  children: React.ReactNode;
  className?: string;
}

interface CommandInputProps {
  placeholder?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
}

interface CommandListProps {
  children: React.ReactNode;
  className?: string;
}

interface CommandItemProps {
  children: React.ReactNode;
  onSelect?: () => void;
  className?: string;
}

interface CommandEmptyProps {
  children: React.ReactNode;
  className?: string;
}

const CommandContext = React.createContext<{
  search: string;
  setSearch: (search: string) => void;
}>({ search: '', setSearch: () => {} });

export const Command: React.FC<CommandProps> = ({ children, className }) => {
  const [search, setSearch] = useState('');

  return (
    <CommandContext.Provider value={{ search, setSearch }}>
      <div className={cn('relative', className)}>
        {children}
      </div>
    </CommandContext.Provider>
  );
};

export const CommandInput: React.FC<CommandInputProps> = ({
  placeholder = 'Search...',
  value,
  onValueChange,
  className
}) => {
  const { search, setSearch } = React.useContext(CommandContext);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearch(newValue);
    onValueChange?.(newValue);
  };

  return (
    <input
      ref={inputRef}
      type="text"
      placeholder={placeholder}
      value={value ?? search}
      onChange={handleChange}
      className={cn(
        'w-full px-3 py-2 text-sm bg-slate-800 border border-slate-600 rounded-md',
        'text-slate-100 placeholder-slate-400',
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
        className
      )}
    />
  );
};

export const CommandList: React.FC<CommandListProps> = ({ children, className }) => {
  return (
    <div className={cn(
      'max-h-60 overflow-y-auto border border-slate-600 rounded-md mt-1 bg-slate-800',
      className
    )}>
      {children}
    </div>
  );
};

export const CommandItem: React.FC<CommandItemProps> = ({ children, onSelect, className }) => {
  return (
    <div
      onClick={onSelect}
      className={cn(
        'px-3 py-2 text-sm text-slate-100 cursor-pointer',
        'hover:bg-slate-700 transition-colors',
        className
      )}
    >
      {children}
    </div>
  );
};

export const CommandEmpty: React.FC<CommandEmptyProps> = ({ children, className }) => {
  const { search } = React.useContext(CommandContext);
  
  if (!search) return null;
  
  return (
    <div className={cn(
      'px-3 py-2 text-sm text-slate-400 text-center',
      className
    )}>
      {children}
    </div>
  );
};