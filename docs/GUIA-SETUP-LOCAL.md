# 🚀 **Guia Completo: Setup Local até Uso dos Dados**

## 📋 **Pré-requisitos**

### 🛠️ **Ferramentas Necessárias:**
- **Node.js** (versão 18+)
- **npm** ou **yarn**
- **Git**
- **Doppler CLI**
- **Conta Supabase**

### 🔍 **Verificar Instalações:**
```bash
# Verificar Node.js
node --version  # Deve ser 18+

# Verificar npm
npm --version

# Verificar Git
git --version

# Verificar Doppler
doppler --version
```

---

## 🏗️ **PASSO 1: Configuração Inicial do Projeto**

### 1.1 **Clonar o Repositório**
```bash
# Clonar o projeto
git clone [URL_DO_REPOSITORIO]
cd Gestao-Profissional

# Verificar branch
git branch
git status
```

### 1.2 **Instalar Dependências**
```bash
# Instalar dependências do projeto
npm install

# Verificar se instalou corretamente
npm list --depth=0
```

### 1.3 **Verificar Estrutura do Projeto**
```bash
# Verificar arquivos principais
ls -la

# Verificar configurações
ls -la config/
ls -la src/
```

---

## 🔐 **PASSO 2: Configuração do Doppler**

### 2.1 **Instalar Doppler CLI**
```bash
# macOS
brew install dopplerhq/cli/doppler

# Linux
curl -Ls --tlsv1.2 --proto "=https" --retry 3 https://cli.doppler.com/install.sh | sudo sh

# Windows (PowerShell)
iwr "https://cli.doppler.com/install.ps1" -useb | iex
```

### 2.2 **Autenticar no Doppler**
```bash
# Login no Doppler
doppler login

# Verificar autenticação
doppler me
```

### 2.3 **Configurar Projeto no Doppler**
```bash
# Executar setup automático
npm run doppler:setup

# OU configurar manualmente
doppler setup
# Selecionar projeto: talent-sphere-registry
# Selecionar ambiente: development

# Verificar configuração
doppler configure
```

### 2.4 **Verificar Variáveis de Ambiente**
```bash
# Listar todas as variáveis
doppler secrets

# Verificar variáveis específicas do Supabase
doppler secrets get VITE_SUPABASE_URL
doppler secrets get VITE_SUPABASE_ANON_KEY
```

---

## 🗄️ **PASSO 3: Configuração do Supabase**

### 3.1 **Verificar Projetos Supabase**

**Projetos Disponíveis:**
- **Produção:** `pwksgdjjkryqryqrvyja` (https://pwksgdjjkryqryqrvyja.supabase.co)
- **Homologação:** `zbiivgtdamejiwcabmcv` (https://zbiivgtdamejiwcabmcv.supabase.co)

### 3.2 **Configurar Ambiente de Desenvolvimento**

**Para usar HOMOLOGAÇÃO em desenvolvimento (recomendado):**
```bash
# Configurar URL de homologação
doppler secrets set VITE_SUPABASE_URL="https://zbiivgtdamejiwcabmcv.supabase.co"

# Configurar chave de homologação
doppler secrets set VITE_SUPABASE_ANON_KEY="YOUR_HOMOLOG_ANON_KEY_HERE"
```

**Para usar PRODUÇÃO em desenvolvimento (cuidado!):**
```bash
# Configurar URL de produção
doppler secrets set VITE_SUPABASE_URL="https://pwksgdjjkryqryqrvyja.supabase.co"

# Configurar chave de produção
doppler secrets set VITE_SUPABASE_ANON_KEY="YOUR_PRODUCTION_ANON_KEY_HERE"
```

### 3.3 **Verificar Conexão com Supabase**
```bash
# Testar conexão
curl "$(doppler secrets get VITE_SUPABASE_URL --plain)/rest/v1/colaboradores" \
  -H "apikey: $(doppler secrets get VITE_SUPABASE_ANON_KEY --plain)" \
  -H "Authorization: Bearer $(doppler secrets get VITE_SUPABASE_ANON_KEY --plain)"
```

---

## 🔄 **PASSO 4: Migração de Dados (Se Necessário)**

### 4.1 **Executar Migração Produção → Homologação**
```bash
# Configurar chaves de serviço no Doppler
doppler secrets set SUPABASE_PROD_SERVICE_KEY="[CHAVE_SERVICE_PRODUCAO]"
doppler secrets set SUPABASE_HOMOLOG_SERVICE_KEY="[CHAVE_SERVICE_HOMOLOGACAO]"

# Executar migração
chmod +x scripts/migrate-prod-to-homolog.sh
doppler run -- ./scripts/migrate-prod-to-homolog.sh
```

### 4.2 **Verificar Migração**
```bash
# Comparar estruturas
chmod +x scripts/diff-supabase-structure.sh
./scripts/diff-supabase-structure.sh

# Verificar dados em homologação
curl "https://zbiivgtdamejiwcabmcv.supabase.co/rest/v1/colaboradores?select=count" \
  -H "apikey: $(doppler secrets get VITE_SUPABASE_ANON_KEY --plain)"
```

---

## 🚀 **PASSO 5: Executar a Aplicação**

### 5.1 **Iniciar Servidor de Desenvolvimento**
```bash
# Método 1: Com Doppler (recomendado)
doppler run -- npx vite

# Método 2: Comando npm
npm run dev

# Método 3: Comando direto
npx vite
```

### 5.2 **Verificar Aplicação**
```bash
# A aplicação deve estar rodando em:
# http://localhost:5173/

# Verificar logs no terminal
# Deve mostrar:
# ✅ Variáveis de ambiente carregadas
# ✅ Servidor iniciado
# ✅ URL local disponível
```

### 5.3 **Abrir no Navegador**
```bash
# Abrir automaticamente
open http://localhost:5173/  # macOS
xdg-open http://localhost:5173/  # Linux
start http://localhost:5173/  # Windows
```

---

## 🧪 **PASSO 6: Testar Funcionalidades**

### 6.1 **Verificar Console do Navegador**
1. Abrir **DevTools** (F12)
2. Ir para aba **Console**
3. Verificar se não há erros
4. Procurar por mensagens de sucesso

### 6.2 **Testar Carregamento de Dados**
1. **Dashboard:** Verificar se os profissionais carregam
2. **Filtros:** Testar filtros por área, skill, etc.
3. **Busca:** Testar busca por nome/email
4. **Importação:** Testar importação de Excel (se disponível)

### 6.3 **Verificar Funcionalidades Específicas**
```bash
# Verificar dados no Supabase
curl "$(doppler secrets get VITE_SUPABASE_URL --plain)/rest/v1/colaboradores?select=*&limit=5" \
  -H "apikey: $(doppler secrets get VITE_SUPABASE_ANON_KEY --plain)" \
  -H "Authorization: Bearer $(doppler secrets get VITE_SUPABASE_ANON_KEY --plain)"
```

---

## 🔧 **PASSO 7: Comandos Úteis para Desenvolvimento**

### 7.1 **Comandos Doppler**
```bash
# Verificar configuração
npm run doppler:verify

# Abrir dashboard
npm run doppler:dashboard

# Listar segredos
npm run doppler:secrets

# Login/logout
npm run doppler:login
npm run doppler:logout
```

### 7.2 **Comandos de Desenvolvimento**
```bash
# Iniciar com Doppler
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview

# Linting
npm run lint

# Verificar tipos TypeScript
npm run type-check
```

### 7.3 **Comandos de Debug**
```bash
# Verificar variáveis de ambiente
node -e "console.log(process.env)" | grep VITE

# Testar conexão Supabase
node test-env.js

# Debug da aplicação
npm run debug
```

---

## 🚨 **Troubleshooting**

### ❌ **Erro: "Invalid API key"**
```bash
# Verificar chaves
doppler secrets get VITE_SUPABASE_ANON_KEY

# Reconfigurar se necessário
doppler secrets set VITE_SUPABASE_ANON_KEY="[NOVA_CHAVE]"

# Reiniciar aplicação
```

### ❌ **Erro: "Could not resolve host"**
```bash
# Verificar URL
doppler secrets get VITE_SUPABASE_URL

# Testar conectividade
ping pwksgdjjkryqryqrvyja.supabase.co
ping zbiivgtdamejiwcabmcv.supabase.co
```

### ❌ **Erro: "Doppler not configured"**
```bash
# Reconfigurar Doppler
doppler setup

# OU usar setup automático
npm run doppler:setup
```

### ❌ **Erro: "No data found"**
```bash
# Verificar se há dados no banco
curl "$(doppler secrets get VITE_SUPABASE_URL --plain)/rest/v1/colaboradores?select=count" \
  -H "apikey: $(doppler secrets get VITE_SUPABASE_ANON_KEY --plain)"

# Se não houver dados, executar migração
./scripts/migrate-prod-to-homolog.sh
```

---

## ✅ **Checklist Final**

- [ ] **Node.js 18+** instalado
- [ ] **Dependências** instaladas (`npm install`)
- [ ] **Doppler CLI** instalado e autenticado
- [ ] **Projeto Doppler** configurado
- [ ] **Variáveis Supabase** configuradas no Doppler
- [ ] **Conexão Supabase** testada e funcionando
- [ ] **Aplicação** rodando em `http://localhost:5173/`
- [ ] **Dados** carregando corretamente
- [ ] **Console** sem erros
- [ ] **Funcionalidades** testadas

---

## 🎯 **Resultado Esperado**

Após seguir todos os passos:

1. ✅ **Aplicação rodando** em `http://localhost:5173/`
2. ✅ **Dados carregando** do Supabase
3. ✅ **Filtros funcionando** (área, skill, nível)
4. ✅ **Busca funcionando** (nome, email)
5. ✅ **Console limpo** (sem erros)
6. ✅ **Ambiente seguro** (homologação para dev)

---

## 📞 **Suporte**

Em caso de problemas:

1. **Verificar logs** no terminal e console do navegador
2. **Consultar troubleshooting** acima
3. **Verificar configurações** do Doppler
4. **Testar conexão** com Supabase
5. **Revisar variáveis** de ambiente

**Comandos de diagnóstico rápido:**
```bash
# Diagnóstico completo
npm run doppler:verify
doppler secrets
node test-env.js
curl "$(doppler secrets get VITE_SUPABASE_URL --plain)/health"
```