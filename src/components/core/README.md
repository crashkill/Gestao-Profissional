# Padrões de Componentes

Este documento define os padrões e diretrizes para a criação e manutenção de componentes no projeto.

## Estrutura de Diretórios

```
src/components/
├── core/               # Tipos e utilitários base para componentes
│   ├── types.ts        # Definições de tipos base
│   ├── hooks/          # Hooks relacionados a componentes
│   └── utils/          # Utilitários para componentes
├── ui/                 # Componentes de UI básicos
│   ├── button.tsx
│   ├── input.tsx
│   └── ...
├── forms/              # Componentes específicos para formulários
│   ├── form.tsx
│   ├── form-field.tsx
│   └── ...
├── layout/             # Componentes de layout
│   ├── container.tsx
│   ├── grid.tsx
│   └── ...
├── data/               # Componentes relacionados a dados
│   ├── data-table.tsx
│   ├── data-grid.tsx
│   └── ...
└── features/           # Componentes específicos de features
    ├── professional/   # Componentes específicos para profissionais
    ├── dashboard/      # Componentes específicos para dashboard
    └── ...
```

## Padrões de Nomenclatura

- **Arquivos de Componentes**: Use PascalCase para nomes de componentes (ex: `Button.tsx`)
- **Arquivos de Utilitários**: Use camelCase para utilitários (ex: `useFormValidation.ts`)
- **Interfaces e Types**: Use PascalCase com sufixo descritivo (ex: `ButtonProps`, `UserData`)
- **Constantes**: Use UPPER_SNAKE_CASE para constantes (ex: `DEFAULT_THEME`)

## Estrutura de Componentes

### Padrão para Componentes Funcionais

```tsx
import React from 'react';
import { BaseComponentProps } from '../core/types';

// 1. Definir interface de props
export interface ExampleProps extends BaseComponentProps {
  title: string;
  description?: string;
}

// 2. Componente com tipos explícitos
export const Example: React.FC<ExampleProps> = ({
  title,
  description,
  className,
  testId,
}) => {
  // 3. Lógica do componente

  // 4. Renderização
  return (
    <div className={className} data-testid={testId}>
      <h2>{title}</h2>
      {description && <p>{description}</p>}
    </div>
  );
};

// 5. Exportação padrão
export default Example;
```

## Boas Práticas

### Separação de Responsabilidades

- **Componentes Presentacionais**: Focados apenas na renderização da UI
- **Componentes Containers**: Gerenciam estado e lógica de negócio
- **Hooks Personalizados**: Extraem lógica reutilizável

### Props

- Use desestruturação para acessar props
- Defina tipos explícitos para todas as props
- Forneça valores padrão quando apropriado
- Use prop spreading com cautela

### Estado

- Prefira hooks do React (`useState`, `useReducer`) para gerenciar estado
- Extraia lógica complexa para hooks personalizados
- Use context para estado global quando necessário

### Estilização

- Use classes CSS consistentes
- Evite estilos inline, exceto para valores dinâmicos
- Siga a convenção de nomenclatura BEM ou similar

### Acessibilidade

- Use elementos semânticos HTML apropriados
- Inclua atributos ARIA quando necessário
- Garanta navegação por teclado
- Teste com leitores de tela

### Testes

- Escreva testes para cada componente
- Teste comportamentos, não implementação
- Use data-testid para seleção de elementos em testes

## Exemplo de Implementação

```tsx
// Button.tsx
import React from 'react';
import { BaseComponentProps, VariantProps, SizeProps } from '../core/types';
import { cn } from '../core/utils';

export interface ButtonProps extends 
  BaseComponentProps,
  VariantProps<'primary' | 'secondary' | 'outline'>,
  SizeProps {
  onClick?: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  onClick,
  disabled = false,
  testId,
}) => {
  const baseClasses = 'rounded font-medium transition-colors focus:outline-none focus:ring-2';
  
  const variantClasses = {
    primary: 'bg-blue-500 text-white hover:bg-blue-600',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
    outline: 'bg-transparent border border-gray-300 hover:bg-gray-100',
  };
  
  const sizeClasses = {
    sm: 'py-1 px-3 text-sm',
    md: 'py-2 px-4 text-base',
    lg: 'py-3 px-6 text-lg',
  };
  
  const classes = cn(
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    disabled && 'opacity-50 cursor-not-allowed',
    className
  );
  
  return (
    <button
      className={classes}
      onClick={onClick}
      disabled={disabled}
      data-testid={testId}
    >
      {children}
    </button>
  );
};

export default Button;
```

## Documentação de Componentes

Cada componente deve incluir:

1. Uma descrição clara do propósito do componente
2. Documentação de todas as props
3. Exemplos de uso
4. Notas sobre acessibilidade, quando relevante

## Fluxo de Trabalho para Criação de Componentes

1. **Identificar Necessidade**: Determine se um novo componente é necessário
2. **Definir API**: Estabeleça as props e comportamentos esperados
3. **Implementar**: Crie o componente seguindo os padrões
4. **Testar**: Escreva testes para o componente
5. **Documentar**: Adicione documentação e exemplos de uso
6. **Revisar**: Solicite revisão de código