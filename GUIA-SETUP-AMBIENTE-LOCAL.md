# Guia Completo de Setup do Ambiente Local

## Pré-requisitos

- Node.js (versão 18 ou superior)
- npm ou yarn
- Git
- Conta no Supabase (para ambientes de homologação e produção)
- Conta no Doppler (para gerenciamento de variáveis de ambiente)

## 1. Clonagem e Instalação Inicial

### 1.1 Clone o repositório
```bash
git clone <URL_DO_REPOSITORIO>
cd Gestao-Profissional
```

### 1.2 Instale as dependências
```bash
npm install
# ou
yarn install
```

## 2. Configuração do Doppler

### 2.1 Instale o Doppler CLI
```bash
# macOS
brew install dopplerhq/cli/doppler

# Linux
curl -Ls https://cli.doppler.com/install.sh | sh

# Windows
scoop install doppler
```

### 2.2 Autentique no Doppler
```bash
doppler login
```

### 2.3 Configure o projeto
```bash
doppler setup
```

Selecione:
- **Projeto**: gestao-profissional
- **Ambiente**: development (padrão)

## 3. Ambientes Disponíveis

O projeto possui três ambientes configurados:

- **development**: Ambiente local de desenvolvimento
- **homologacao**: Ambiente de homologação/teste
- **production**: Ambiente de produção

## 4. Scripts de Mudança de Ambiente

### 4.1 Script Principal: `switch-environment.js`

Este script permite alternar entre os ambientes de forma automatizada:

```bash
# Alternar para homologação
node scripts/switch-environment.js homologacao

# Alternar para produção
node scripts/switch-environment.js production

# Voltar para desenvolvimento
node scripts/switch-environment.js development
```

### 4.2 Scripts Específicos

#### Para Homologação:
```bash
# Script direto
./scripts/switch-to-homolog.sh

# Ou via npm
npm run switch:homolog
```

#### Para Produção:
```bash
# Script direto
./scripts/switch-to-production.sh

# Ou via npm
npm run switch:prod
```

### 4.3 Verificação do Ambiente Atual
```bash
# Verificar qual ambiente está ativo
doppler configs

# Verificar variáveis do ambiente atual
doppler secrets
```

## 5. Executando a Aplicação

### 5.1 Modo Desenvolvimento (Local)
```bash
# Com Doppler (recomendado)
doppler run -- npm run dev

# Ou diretamente
npm run dev
```

### 5.2 Modo Homologação
```bash
# 1. Alterar para ambiente de homologação
node scripts/switch-environment.js homologacao

# 2. Executar a aplicação
doppler run -- npm run dev

# A aplicação estará disponível em http://localhost:5173 ou http://localhost:5174
```

### 5.3 Modo Produção
```bash
# 1. Alterar para ambiente de produção
node scripts/switch-environment.js production

# 2. Executar a aplicação
doppler run -- npm run dev

# A aplicação estará disponível em http://localhost:5173 ou http://localhost:5174
```

## 6. Verificação de Dados

### 6.1 Verificar Conexão com Banco
```bash
# Testar conexão atual
node test-connection.sh

# Verificar estrutura das tabelas
./list-tables.sh
```

### 6.2 Verificar Dados da Tabela Colaboradores
```bash
# Verificar quantidade de registros
doppler run -- node -e "const { createClient } = require('@supabase/supabase-js'); const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY); supabase.from('colaboradores').select('*', { count: 'exact' }).then(({count}) => console.log('Total de registros:', count));"

# Verificar primeiros registros
doppler run -- node -e "const { createClient } = require('@supabase/supabase-js'); const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY); supabase.from('colaboradores').select('nome_completo, email, skill_principal').limit(5).then(({data}) => console.log('Primeiros registros:', JSON.stringify(data, null, 2)));"
```

## 7. Migração de Dados

### 7.1 Migração de Produção para Homologação
```bash
# Script completo de migração
node migrate-final.cjs

# Ou usar o script específico
./scripts/migrate-prod-to-homolog.sh
```

### 7.2 Verificação Pós-Migração
```bash
# Verificar se os dados foram migrados corretamente
doppler run -- node -e "const { createClient } = require('@supabase/supabase-js'); const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY); supabase.from('colaboradores').select('*', { count: 'exact' }).then(({count, error}) => { if(error) console.error('Erro:', error); else console.log('Total de registros migrados:', count); });"
```

## 8. Configuração de RLS (Row Level Security)

### 8.1 Problema Comum: Dados Não Visíveis

Se após a migração os dados não estiverem visíveis na aplicação:

1. **Acesse o painel do Supabase**
2. **Vá para Authentication > Policies**
3. **Encontre a tabela `colaboradores`**
4. **Crie uma política de leitura para usuários anônimos:**
   - Nome: `Allow anonymous read access`
   - Comando: `SELECT`
   - Função: `anon`
   - Expressão: `true`

### 8.2 Script Automático para RLS
```bash
# Configurar RLS automaticamente
node setup-rls-homolog.cjs

# Ou desabilitar RLS temporariamente
node disable-rls-simple.cjs
```

## 9. Comandos Úteis

### 9.1 Verificação de Ambiente
```bash
# Verificar ambiente atual
echo $DOPPLER_CONFIG

# Listar todos os ambientes
doppler configs list

# Verificar variáveis específicas
doppler secrets get VITE_SUPABASE_URL
doppler secrets get VITE_SUPABASE_ANON_KEY
```

### 9.2 Debug e Logs
```bash
# Debug da aplicação
node debug-app.cjs

# Verificar logs do servidor
doppler run -- npm run dev 2>&1 | tee server.log
```

### 9.3 Build e Deploy
```bash
# Build para produção
npm run build

# Preview do build
npm run preview

# Deploy (se configurado)
npm run deploy
```

## 10. Solução de Problemas

### 10.1 Erro de Autenticação
```bash
# Re-autenticar no Doppler
doppler logout
doppler login
doppler setup
```

### 10.2 Porta em Uso
Se a porta 5173 estiver em uso, o Vite automaticamente usará a 5174.

### 10.3 Dados Não Carregando
1. Verificar se o ambiente está correto
2. Verificar se o RLS está configurado
3. Verificar se as chaves do Supabase estão corretas
4. Verificar se a tabela existe e tem dados

### 10.4 Erro de Conexão com Banco
```bash
# Testar conexão
curl -X GET "$VITE_SUPABASE_URL/rest/v1/colaboradores?select=count" \
  -H "apikey: $VITE_SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $VITE_SUPABASE_ANON_KEY"
```

## 11. Estrutura de Arquivos Importantes

```
├── scripts/
│   ├── switch-environment.js     # Script principal de mudança de ambiente
│   ├── switch-to-homolog.sh      # Script específico para homologação
│   ├── switch-to-production.sh   # Script específico para produção
│   └── migrate-prod-to-homolog.sh # Script de migração
├── migrate-final.cjs             # Script de migração completo
├── setup-rls-homolog.cjs         # Configuração de RLS
├── disable-rls-simple.cjs        # Desabilitar RLS
├── test-connection.sh            # Teste de conexão
└── list-tables.sh               # Listar tabelas
```

## 12. Fluxo Completo de Trabalho

### 12.1 Desenvolvimento Local
1. `git pull origin main`
2. `npm install`
3. `node scripts/switch-environment.js development`
4. `doppler run -- npm run dev`

### 12.2 Teste em Homologação
1. `node scripts/switch-environment.js homologacao`
2. `doppler run -- npm run dev`
3. Testar funcionalidades
4. Verificar dados: 117 registros esperados

### 12.3 Deploy para Produção
1. `node scripts/switch-environment.js production`
2. `npm run build`
3. `npm run deploy` (ou processo de deploy configurado)

## 13. Contatos e Suporte

- **Documentação do Doppler**: https://docs.doppler.com/
- **Documentação do Supabase**: https://supabase.com/docs
- **Issues do Projeto**: [Link para issues do repositório]

---

**Nota**: Sempre verifique se você está no ambiente correto antes de fazer alterações importantes. Use `doppler configs` para confirmar o ambiente ativo.