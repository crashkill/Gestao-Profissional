# 🚀 Exemplo Prático: Usando a UI Library

> *Demonstração completa de como usar a biblioteca UI para criar uma nova tela ou migrar uma existente.*

## 📋 Cenário

Vamos criar uma tela de "Cadastro de Profissional" usando todos os componentes e funcionalidades da UI Library.

## 🎯 Resultado Final

Uma tela moderna, responsiva e consistente com:
- Layout com WebGL background
- Formulário com validação
- Upload de foto
- Feedback visual
- Animações suaves
- Tema personalizável

## 💻 Implementação Completa

### 1. Estrutura Principal

```typescript
// src/pages/CadastroProfissional.tsx
import React from 'react';
import {
  BaseLayout,
  StandardHeader,
  StandardCard,
  StandardButton,
  useForm,
  useUpload,
  useToast,
  animations,
  constants
} from '@/lib/ui-library';
import { motion } from 'framer-motion';
import { User, Upload, Save, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/router';

interface ProfessionalForm {
  nome: string;
  email: string;
  telefone: string;
  especialidade: string;
  experiencia: string;
  foto?: File;
}

export default function CadastroProfissional() {
  const router = useRouter();
  const { toast } = useToast();
  
  // Configuração do formulário
  const {
    values,
    errors,
    isValid,
    isSubmitting,
    handleChange,
    handleSubmit,
    setFieldValue
  } = useForm<ProfessionalForm>({
    initialValues: {
      nome: '',
      email: '',
      telefone: '',
      especialidade: '',
      experiencia: ''
    },
    validationRules: {
      nome: (value) => value.length >= 2 ? null : 'Nome deve ter pelo menos 2 caracteres',
      email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? null : 'Email inválido',
      telefone: (value) => /^\([0-9]{2}\)\s[0-9]{4,5}-[0-9]{4}$/.test(value) ? null : 'Telefone inválido',
      especialidade: (value) => value.length >= 3 ? null : 'Especialidade é obrigatória',
      experiencia: (value) => value.length >= 10 ? null : 'Descreva sua experiência (mín. 10 caracteres)'
    }
  });

  // Configuração do upload
  const {
    files,
    isDragActive,
    uploadFile,
    removeFile,
    getRootProps,
    getInputProps
  } = useUpload({
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024, // 5MB
    accept: ['image/*'],
    onFileAccepted: (file) => {
      setFieldValue('foto', file);
      toast({
        title: 'Foto adicionada!',
        description: `${file.name} foi selecionada`,
        variant: 'success'
      });
    }
  });

  // Submissão do formulário
  const onSubmit = async (data: ProfessionalForm) => {
    try {
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: 'Profissional cadastrado!',
        description: 'Os dados foram salvos com sucesso',
        variant: 'success'
      });
      
      // Redirecionar após sucesso
      setTimeout(() => {
        router.push('/profissionais');
      }, 1500);
      
    } catch (error) {
      toast({
        title: 'Erro ao cadastrar',
        description: 'Tente novamente em alguns instantes',
        variant: 'destructive'
      });
    }
  };

  return (
    <BaseLayout
      variant="webgl"
      webglConfig={{
        particleCount: 120,
        particleColor: '#8b5cf6',
        enableInteraction: true,
        particleSpeed: 0.6
      }}
    >
      {/* Header */}
      <StandardHeader
        title="Cadastro de Profissional"
        description="Adicione um novo profissional ao sistema"
        showBackButton
        onBack={() => router.back()}
        gradient="purple"
        icon={<User className="w-6 h-6" />}
      />

      {/* Formulário Principal */}
      <motion.div
        variants={animations.staggerContainer}
        initial="initial"
        animate="animate"
        className="max-w-4xl mx-auto px-4 py-8"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Coluna 1: Dados Pessoais */}
            <motion.div variants={animations.staggerItem} className="lg:col-span-2">
              <StandardCard
                variant="glass"
                padding="lg"
                hover
                className="h-full"
              >
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Dados Pessoais
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Nome */}
                  <div>
                    <label className="block text-sm font-medium text-gray-200 mb-2">
                      Nome Completo *
                    </label>
                    <input
                      type="text"
                      name="nome"
                      value={values.nome}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 bg-white/10 border rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 transition-all ${
                        errors.nome 
                          ? 'border-red-500 focus:ring-red-500' 
                          : 'border-gray-300/30 focus:ring-purple-500'
                      }`}
                      placeholder="Digite o nome completo"
                    />
                    {errors.nome && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-400 text-sm mt-1"
                      >
                        {errors.nome}
                      </motion.p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-200 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={values.email}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 bg-white/10 border rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 transition-all ${
                        errors.email 
                          ? 'border-red-500 focus:ring-red-500' 
                          : 'border-gray-300/30 focus:ring-purple-500'
                      }`}
                      placeholder="email@exemplo.com"
                    />
                    {errors.email && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-400 text-sm mt-1"
                      >
                        {errors.email}
                      </motion.p>
                    )}
                  </div>

                  {/* Telefone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-200 mb-2">
                      Telefone *
                    </label>
                    <input
                      type="tel"
                      name="telefone"
                      value={values.telefone}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 bg-white/10 border rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 transition-all ${
                        errors.telefone 
                          ? 'border-red-500 focus:ring-red-500' 
                          : 'border-gray-300/30 focus:ring-purple-500'
                      }`}
                      placeholder="(11) 99999-9999"
                    />
                    {errors.telefone && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-400 text-sm mt-1"
                      >
                        {errors.telefone}
                      </motion.p>
                    )}
                  </div>

                  {/* Especialidade */}
                  <div>
                    <label className="block text-sm font-medium text-gray-200 mb-2">
                      Especialidade *
                    </label>
                    <select
                      name="especialidade"
                      value={values.especialidade}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 bg-white/10 border rounded-lg text-white focus:outline-none focus:ring-2 transition-all ${
                        errors.especialidade 
                          ? 'border-red-500 focus:ring-red-500' 
                          : 'border-gray-300/30 focus:ring-purple-500'
                      }`}
                    >
                      <option value="" className="bg-gray-800">Selecione...</option>
                      <option value="frontend" className="bg-gray-800">Frontend Developer</option>
                      <option value="backend" className="bg-gray-800">Backend Developer</option>
                      <option value="fullstack" className="bg-gray-800">Fullstack Developer</option>
                      <option value="mobile" className="bg-gray-800">Mobile Developer</option>
                      <option value="devops" className="bg-gray-800">DevOps Engineer</option>
                      <option value="designer" className="bg-gray-800">UI/UX Designer</option>
                    </select>
                    {errors.especialidade && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-400 text-sm mt-1"
                      >
                        {errors.especialidade}
                      </motion.p>
                    )}
                  </div>
                </div>

                {/* Experiência */}
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Experiência Profissional *
                  </label>
                  <textarea
                    name="experiencia"
                    value={values.experiencia}
                    onChange={handleChange}
                    rows={4}
                    className={`w-full px-4 py-3 bg-white/10 border rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 transition-all resize-none ${
                      errors.experiencia 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-gray-300/30 focus:ring-purple-500'
                    }`}
                    placeholder="Descreva sua experiência profissional, projetos relevantes e habilidades..."
                  />
                  {errors.experiencia && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-400 text-sm mt-1"
                    >
                      {errors.experiencia}
                    </motion.p>
                  )}
                </div>
              </StandardCard>
            </motion.div>

            {/* Coluna 2: Upload de Foto */}
            <motion.div variants={animations.staggerItem}>
              <StandardCard
                variant="glass"
                padding="lg"
                className="h-full"
              >
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Foto do Perfil
                </h3>
                
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all ${
                    isDragActive 
                      ? 'border-purple-400 bg-purple-500/20' 
                      : 'border-gray-300/50 hover:border-purple-400 hover:bg-purple-500/10'
                  }`}
                >
                  <input {...getInputProps()} />
                  
                  {files.length > 0 ? (
                    <div className="space-y-4">
                      <div className="relative">
                        <img
                          src={URL.createObjectURL(files[0])}
                          alt="Preview"
                          className="w-32 h-32 object-cover rounded-full mx-auto border-4 border-purple-400"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFile(files[0]);
                            setFieldValue('foto', undefined);
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 transition-colors"
                        >
                          ×
                        </button>
                      </div>
                      <p className="text-sm text-gray-300">
                        {files[0].name}
                      </p>
                      <p className="text-xs text-gray-400">
                        Clique para alterar
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                      <div>
                        <p className="text-white font-medium">
                          {isDragActive ? 'Solte a foto aqui' : 'Adicionar foto'}
                        </p>
                        <p className="text-sm text-gray-400 mt-1">
                          Arraste uma imagem ou clique para selecionar
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          PNG, JPG até 5MB
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </StandardCard>
            </motion.div>
          </div>

          {/* Botões de Ação */}
          <motion.div 
            variants={animations.staggerItem}
            className="flex flex-col sm:flex-row gap-4 justify-end"
          >
            <StandardButton
              type="button"
              variant="outline"
              size="lg"
              onClick={() => router.back()}
              icon={<ArrowLeft className="w-4 h-4" />}
              className="sm:w-auto w-full"
            >
              Cancelar
            </StandardButton>
            
            <StandardButton
              type="submit"
              variant="primary"
              size="lg"
              loading={isSubmitting}
              disabled={!isValid}
              icon={<Save className="w-4 h-4" />}
              className="sm:w-auto w-full"
            >
              {isSubmitting ? 'Salvando...' : 'Salvar Profissional'}
            </StandardButton>
          </motion.div>
        </form>
      </motion.div>
    </BaseLayout>
  );
}
```

## 🎨 Customizações Adicionais

### 1. Hook Personalizado para Máscara de Telefone

```typescript
// src/hooks/usePhoneMask.ts
import { useState, useCallback } from 'react';

export function usePhoneMask() {
  const [value, setValue] = useState('');

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value.replace(/\D/g, '');
    
    if (inputValue.length <= 11) {
      inputValue = inputValue.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
      inputValue = inputValue.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3');
      inputValue = inputValue.replace(/^(\d{2})(\d{1,5})$/, '($1) $2');
      inputValue = inputValue.replace(/^(\d{1,2})$/, '($1');
    }
    
    setValue(inputValue);
  }, []);

  return { value, handleChange, setValue };
}
```

### 2. Componente de Preview de Imagem

```typescript
// src/components/ImagePreview.tsx
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { animations } from '@/lib/ui-library';

interface ImagePreviewProps {
  file: File;
  onRemove: () => void;
}

export function ImagePreview({ file, onRemove }: ImagePreviewProps) {
  return (
    <motion.div
      variants={animations.scaleIn}
      initial="initial"
      animate="animate"
      exit="exit"
      className="relative group"
    >
      <img
        src={URL.createObjectURL(file)}
        alt="Preview"
        className="w-32 h-32 object-cover rounded-full border-4 border-purple-400 group-hover:border-purple-300 transition-colors"
      />
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={onRemove}
        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 transition-colors shadow-lg"
      >
        <X className="w-3 h-3" />
      </motion.button>
    </motion.div>
  );
}
```

## 📱 Responsividade

A tela é totalmente responsiva:

- **Desktop**: Layout em 3 colunas
- **Tablet**: Layout em 2 colunas
- **Mobile**: Layout em 1 coluna
- **Formulário**: Campos se adaptam ao tamanho da tela
- **Botões**: Largura total em mobile

## ✨ Funcionalidades Implementadas

### ✅ Validação em Tempo Real
- Validação de email
- Validação de telefone com máscara
- Validação de campos obrigatórios
- Feedback visual de erros

### ✅ Upload de Arquivo
- Drag & drop
- Preview da imagem
- Validação de tipo e tamanho
- Feedback de sucesso/erro

### ✅ Experiência do Usuário
- Animações suaves
- Loading states
- Toast notifications
- Navegação intuitiva

### ✅ Acessibilidade
- Labels apropriados
- Foco visível
- Navegação por teclado
- Mensagens de erro claras

## 🚀 Próximos Passos

1. **Adicionar mais validações** (CPF, CNPJ, etc.)
2. **Implementar upload para cloud** (AWS S3, Cloudinary)
3. **Adicionar campos dinâmicos** (habilidades, certificações)
4. **Criar versão de edição** do formulário
5. **Adicionar testes** automatizados

## 💡 Dicas de Performance

- Use `React.memo` para componentes que não mudam frequentemente
- Implemente `useMemo` para cálculos pesados
- Use `useCallback` para funções que são passadas como props
- Considere lazy loading para componentes grandes

---

> 🎯 **Resultado**: Uma tela moderna, funcional e reutilizável criada em menos tempo e com mais qualidade usando a UI Library!

**Criado com ❤️ pelo Vibe Coding Assistant**