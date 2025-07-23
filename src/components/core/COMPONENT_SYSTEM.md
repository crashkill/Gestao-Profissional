# Sistema de Componentes

Este documento descreve o sistema de componentes implementado para o projeto de Gestão de Profissionais, seguindo os requisitos de arquitetura modular definidos no documento de design.

## Visão Geral

O sistema de componentes foi projetado para:

1. Facilitar a manutenção e evolução do sistema
2. Permitir alterações isoladas sem afetar outros componentes
3. Suportar escalabilidade sem necessidade de refatoração completa
4. Ser facilmente compreensível para novos desenvolvedores

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

## Sistema de Tipos

O sistema de tipos foi projetado para ser extensível e reutilizável. Os tipos base incluem:

- `BaseComponentProps`: Props básicas que todos os componentes devem ter
- `WithChildrenProps`: Props para componentes que podem conter filhos
- `DisableableProps`: Props para componentes que podem ser desabilitados
- `LoadableProps`: Props para componentes que podem mostrar estado de carregamento
- `FormFieldProps`: Props para campos de formulário
- `ValidatableProps`: Props para componentes que podem ser validados
- `VariantProps`: Props para componentes com variantes visuais
- `SizeProps`: Props para componentes com diferentes tamanhos
- `ColorProps`: Props para componentes com diferentes cores

## Padrões de Implementação

### Componentes Funcionais

Todos os componentes são implementados como componentes funcionais React com TypeScript:

```tsx
import React from 'react';
import { BaseComponentProps } from '../core/types';
import { cn } from '../core/utils/cn';

export interface ExampleProps extends BaseComponentProps {
  title: string;
}

export const Example: React.FC<ExampleProps> = ({
  title,
  className,
  testId,
}) => {
  return (
    <div className={cn('base-class', className)} data-testid={testId}>
      <h2>{title}</h2>
    </div>
  );
};

export default Example;
```

### Utilitários

O sistema inclui utilitários para facilitar o desenvolvimento de componentes:

- `cn`: Função para combinar classes CSS com suporte a Tailwind

### Hooks Personalizados

Hooks personalizados são usados para extrair lógica reutilizável:

- `useFormContext`: Hook para acessar o contexto de formulário
- Outros hooks serão adicionados conforme necessário

## Guia de Uso

### Criando um Novo Componente

1. Identifique o tipo de componente (UI, formulário, layout, etc.)
2. Crie um arquivo no diretório apropriado
3. Defina a interface de props estendendo os tipos base apropriados
4. Implemente o componente seguindo o padrão funcional
5. Exporte o componente como padrão e também nomeado

### Exemplo de Uso

```tsx
// Importando componentes
import { Button } from '../components/ui/button';
import { Form } from '../components/forms/form';

// Usando componentes
const MyComponent = () => {
  return (
    <Form onSubmit={handleSubmit}>
      {/* Outros campos de formulário */}
      <Button type="submit" variant="primary">Enviar</Button>
    </Form>
  );
};
```

## Melhores Práticas

1. **Composição sobre Herança**: Prefira compor componentes em vez de estendê-los
2. **Props Explícitas**: Defina tipos explícitos para todas as props
3. **Componentes Pequenos**: Mantenha componentes pequenos e focados em uma única responsabilidade
4. **Reutilização**: Extraia lógica comum para hooks ou componentes utilitários
5. **Acessibilidade**: Garanta que todos os componentes sejam acessíveis
6. **Testes**: Escreva testes para todos os componentes

## Próximos Passos

1. Implementar componentes UI básicos restantes
2. Refatorar componentes existentes para usar o novo sistema
3. Implementar sistema de gerenciamento de estado
4. Adicionar testes unitários para todos os componentes