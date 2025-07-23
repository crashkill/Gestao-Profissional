# Configuração de Ambientes

Este documento descreve a estrutura de ambientes do projeto e como configurá-los corretamente.

## Visão Geral

O sistema suporta três ambientes distintos:

1. **Desenvolvimento** (`development`)
   - Ambiente local para desenvolvimento
   - Conectado ao banco de dados de desenvolvimento do Supabase
   - Configuração via Doppler ou arquivos .env

2. **Homologação** (`homologacao`)
   - Ambiente para testes e validação
   - Conectado ao banco de dados de homologação do Supabase
   - Deploy via GitHub Actions/GitLab CI

3. **Produção** (`production`)
   - Ambiente final para usuários
   - Conectado ao banco de dados de produção do Supabase
   - Deploy via GitHub Actions/GitLab CI

## Arquivos de Configuração

Os arquivos de configuração estão localizados no diretório `config/`:

- `desenvolvimento.env` - Configurações para ambiente de desenvolvimento
- `homologacao.env` - Configurações para ambiente de homologação
- `producao.env` - Configurações para ambiente de produção
- `template.env` - Template com todas as variáveis possíveis

## Variáveis de Ambiente

As principais variáveis de ambiente utilizadas são:

```
# Supabase
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=

# Ambiente
VITE_ENVIRONMENT=development|homologacao|production
VITE_APP_NAME=Talent Sphere Registry
VITE_APP_VERSION=1.0.0

# Debug
VITE_DEBUG_MODE=true|false
VITE_LOG_LEVEL=debug|info|warn|error

# Deploy
BASE_URL=/
DEPLOY_TARGET=desenvolvimento|homologacao|producao
```

## Scripts de Ambiente

O projeto inclui scripts para facilitar a troca entre ambientes:

```bash
# Trocar para ambiente de desenvolvimento
npm run env:dev

# Trocar para ambiente de homologação
npm run env:homologacao

# Trocar para ambiente de produção
npm run env:production

# Carregar variáveis de ambiente do arquivo atual
npm run env:load
```

## Scripts de Execução

Para executar o projeto em diferentes ambientes:

```bash
# Desenvolvimento com Doppler
npm run dev

# Desenvolvimento local com arquivo .env
npm run dev:local

# Homologação
npm run dev:homologacao

# Produção
npm run dev:production
```

## Scripts de Build

Para construir o projeto para diferentes ambientes:

```bash
# Build padrão (usa ambiente atual)
npm run build

# Build para desenvolvimento
npm run build:local

# Build para homologação
npm run build:homologacao

# Build para produção
npm run build:production

# Build para GitHub Pages
npm run build:gh-pages
```

## Integração com Doppler

O projeto está configurado para usar o Doppler para gerenciamento de segredos:

```bash
# Configurar Doppler
npm run doppler:setup

# Acessar dashboard do Doppler
npm run doppler:dashboard

# Listar segredos do Doppler
npm run doppler:secrets

# Login no Doppler
npm run doppler:login
```

## Sistema de Carregamento de Ambiente

O sistema de carregamento de ambiente é implementado através dos seguintes arquivos:

1. `scripts/load-env.js` - Carrega variáveis de ambiente do arquivo apropriado
2. `scripts/switch-environment.js` - Troca entre ambientes copiando o arquivo de configuração
3. `src/lib/envConfig.ts` - Módulo TypeScript para acessar configurações de ambiente

## Uso no Código

Para acessar as configurações de ambiente no código:

```typescript
import { envConfig } from './lib/envConfig';

// Acessar configurações
const { supabaseUrl, environment, debugMode } = envConfig;

// Verificar ambiente
if (envConfig.environment === 'production') {
  // Código específico para produção
}

// Usar recursos baseados em ambiente
if (envConfig.features.aiChat) {
  // Habilitar chat com IA
}
```

## Segurança

Para garantir a segurança das variáveis de ambiente:

1. Nunca comite arquivos `.env` ou `.env.local` no repositório
2. Use o Doppler para gerenciar segredos em todos os ambientes
3. Execute verificações de segurança regularmente:

```bash
# Verificação completa de segurança
npm run secure:full-check
```