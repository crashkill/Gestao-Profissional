#!/usr/bin/env node

/**
 * 🔐 CONFIGURAÇÃO DOPPLER - GESTÃO PROFISSIONAL HITSS
 * 
 * Este script configura automaticamente o Doppler para gerenciar
 * todos os secrets do projeto de forma segura.
 * 
 * Uso:
 *   node doppler-setup.js [ambiente]
 * 
 * Onde ambiente é um dos seguintes: development, homologacao, production
 * Se não for especificado, será usado 'development'
 */

import { execSync } from 'child_process';
import { readFileSync, existsSync, writeFileSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Obter o ambiente da linha de comando ou usar o padrão
const ENV_ARG = process.argv[2] || 'development';
const VALID_ENVIRONMENTS = ['development', 'homologacao', 'production'];

if (!VALID_ENVIRONMENTS.includes(ENV_ARG)) {
  console.error(`❌ Ambiente inválido: ${ENV_ARG}`);
  console.error(`Ambientes válidos: ${VALID_ENVIRONMENTS.join(', ')}`);
  process.exit(1);
}

// Configuração baseada no ambiente
const ENV_CONFIG = {
  'development': {
    projectName: 'gestao-profissional',
    configName: 'dev',
    description: 'Ambiente de Desenvolvimento'
  },
  'homologacao': {
    projectName: 'gestao-profissional',
    configName: 'homologacao',
    description: 'Ambiente de Homologação'
  },
  'production': {
    projectName: 'gestao-profissional',
    configName: 'production',
    description: 'Ambiente de Produção'
  }
};

const PROJECT_NAME = ENV_CONFIG[ENV_ARG].projectName;
const CONFIG_NAME = ENV_CONFIG[ENV_ARG].configName;
const ENV_DESCRIPTION = ENV_CONFIG[ENV_ARG].description;

// 🔑 Variáveis que devem estar no Doppler
const REQUIRED_SECRETS = {
  // Supabase
  'VITE_SUPABASE_URL': 'URL do projeto Supabase (ex: https://your-project.supabase.co)',
  'VITE_SUPABASE_ANON_KEY': 'Chave anônima do Supabase',
  'SUPABASE_ACCESS_TOKEN': 'Token de acesso do Supabase para MCP',
  
  // APIs de IA
  'VITE_GROQ_API_KEY': 'Chave da API Groq',
  'VITE_TOGETHER_API_KEY': 'Chave da API Together.xyz',
  
  // MCP Servers
  'SMITHERY_API_KEY': 'Chave da API Smithery para sequential thinking',
  'MAGIC_21ST_API_KEY': 'Chave da API 21st.dev Magic',
  
  // Azure
  'AZURE_CLIENT_ID': 'Client ID do Azure',
  'AZURE_CLIENT_SECRET': 'Client Secret do Azure',
  'AZURE_TENANT_ID': 'Tenant ID do Azure',
  'AZURE_REGION': 'Região do Azure (ex: brazilsouth)',
  
  // Git Providers
  'GITHUB_PERSONAL_ACCESS_TOKEN': 'Token pessoal do GitHub',
  'GITLAB_PERSONAL_ACCESS_TOKEN': 'Token pessoal do GitLab',
  
  // Configurações
  'LOCALE': 'Locale do sistema (ex: pt-BR)',
  'TIMEZONE': 'Timezone (ex: America/Sao_Paulo)'
};

// Cores para output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bright: '\x1b[1m'
};

function log(message, type = 'info') {
  const colorMap = {
    info: colors.blue,
    success: colors.green,
    warning: colors.yellow,
    error: colors.red,
    highlight: colors.cyan
  };
  
  const iconMap = {
    info: 'ℹ️',
    success: '✅',
    warning: '⚠️',
    error: '❌',
    highlight: '🔍'
  };
  
  console.log(`${colorMap[type]}${iconMap[type]} ${message}${colors.reset}`);
}

function runCommand(command, description, silent = false) {
  try {
    if (!silent) log(`Executando: ${description}`, 'info');
    const output = execSync(command, { encoding: 'utf8', stdio: silent ? 'pipe' : 'inherit' });
    if (!silent) log(`${description} - Concluído`, 'success');
    return output;
  } catch (error) {
    if (!silent) {
      log(`Erro em: ${description}`, 'error');
      console.error(error.message);
    }
    return null;
  }
}

function loadEnvFile(envPath) {
  if (!existsSync(envPath)) {
    log(`Arquivo ${envPath} não encontrado`, 'warning');
    return {};
  }
  
  const envContent = readFileSync(envPath, 'utf8');
  const envVars = {};
  
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        envVars[key.trim()] = valueParts.join('=').trim();
      }
    }
  });
  
  return envVars;
}

function promptForSecrets() {
  log('', 'info');
  log(`🔐 Configure os seguintes segredos no Doppler Dashboard para ${ENV_DESCRIPTION}:`, 'highlight');
  log('https://dashboard.doppler.com/', 'info');
  log('', 'info');
  
  Object.entries(REQUIRED_SECRETS).forEach(([key, description]) => {
    log(`${key}: ${description}`, 'info');
  });
  
  log('', 'info');
  log('💡 Dica: Use o comando abaixo para configurar individualmente:', 'info');
  log(`doppler secrets set NOME_VARIAVEL=valor --project ${PROJECT_NAME} --config ${CONFIG_NAME}`, 'info');
}

function createSecureMcpTemplate() {
  const secureMcpTemplate = {
    "mcpServers": {
      "playwright": {
        "command": "npx",
        "args": [
          "@playwright/mcp@latest",
          "--headless"
        ]
      },
      "puppeteer": {
        "command": "npx",
        "args": [
          "-y",
          "@modelcontextprotocol/server-puppeteer"
        ]
      },
      "server-sequential-thinking": {
        "command": "npx",
        "args": [
          "-y",
          "@smithery/cli@latest",
          "run",
          "@smithery-ai/server-sequential-thinking",
          "--key"
        ],
        "env": {
          "SMITHERY_API_KEY": "${SMITHERY_API_KEY}"
        }
      },
      "MCP-Supabase": {
        "command": "npx",
        "args": [
          "-y",
          "@supabase/mcp-server-supabase@latest",
          "--access-token"
        ],
        "env": {
          "SUPABASE_ACCESS_TOKEN": "${SUPABASE_ACCESS_TOKEN}"
        }
      },
      "browsermcp": {
        "command": "npx",
        "args": [
          "@browsermcp/mcp@latest"
        ]
      },
      "@21st-dev/magic": {
        "command": "npx",
        "args": [
          "-y",
          "@21st-dev/magic@latest"
        ],
        "env": {
          "API_KEY": "${MAGIC_21ST_API_KEY}"
        }
      },
      "azure-auth": {
        "command": "npx",
        "args": [
          "-y",
          "@azure/mcp@latest",
          "server",
          "start"
        ],
        "env": {
          "AZURE_CLIENT_ID": "${AZURE_CLIENT_ID}",
          "AZURE_CLIENT_SECRET": "${AZURE_CLIENT_SECRET}",
          "AZURE_TENANT_ID": "${AZURE_TENANT_ID}",
          "AZURE_REGION": "${AZURE_REGION}",
          "LOCALE": "${LOCALE}",
          "TIMEZONE": "${TIMEZONE}"
        },
        "enabled": true
      },
      "GitHub": {
        "command": "npx",
        "args": [
          "-y",
          "@modelcontextprotocol/server-github"
        ],
        "env": {
          "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_PERSONAL_ACCESS_TOKEN}"
        }
      },
      "gitlab": {
        "command": "npx",
        "args": [
          "-y",
          "@modelcontextprotocol/server-gitlab"
        ],
        "env": {
          "GITLAB_PERSONAL_ACCESS_TOKEN": "${GITLAB_PERSONAL_ACCESS_TOKEN}"
        }
      }
    }
  };
  
  const templatePath = join(__dirname, 'mcp-template-secure.json');
  writeFileSync(templatePath, JSON.stringify(secureMcpTemplate, null, 2));
  log(`Template seguro criado: ${templatePath}`, 'success');
}

function createGitHubWorkflowWithDoppler() {
  // Garantir que o diretório .github/workflows existe
  const workflowsDir = join(__dirname, '.github', 'workflows');
  if (!existsSync(workflowsDir)) {
    try {
      mkdirSync(join(__dirname, '.github'), { recursive: true });
      mkdirSync(workflowsDir, { recursive: true });
    } catch (error) {
      log(`Erro ao criar diretório de workflows: ${error.message}`, 'error');
      return;
    }
  }
  
  const workflowContent = `# GitHub Actions workflow com integração Doppler
name: Build and Deploy with Doppler

on:
  push:
    branches: [ main, master ]
  pull_request:
    branches: [ main, master ]

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Install Doppler CLI
      run: |
        curl -sLf --retry 3 --tlsv1.2 --proto "=https" 'https://packages.doppler.com/public/cli/gpg.DE2A7741A397C129.key' | sudo apt-key add -
        echo "deb https://packages.doppler.com/public/cli/deb/debian any-version main" | sudo tee /etc/apt/sources.list.d/doppler-cli.list
        sudo apt-get update && sudo apt-get install doppler
    
    - name: Build with Doppler
      run: doppler run --token=\${{ secrets.DOPPLER_TOKEN }} -- npm run build:production
      
    - name: Run security checks
      run: doppler run --token=\${{ secrets.DOPPLER_TOKEN }} -- npm run secure:full-check
      
    - name: Deploy to GitHub Pages
      if: github.ref == 'refs/heads/main' || github.ref == 'refs/heads/master'
      uses: JamesIves/github-pages-deploy-action@v4
      with:
        folder: dist
        branch: gh-pages
`;

  const workflowPath = join(workflowsDir, 'doppler-deploy.yml');
  writeFileSync(workflowPath, workflowContent);
  log(`Workflow do GitHub Actions com Doppler criado: ${workflowPath}`, 'success');
}

function createGitLabCIWithDoppler() {
  const gitlabCIContent = `# GitLab CI/CD pipeline com integração Doppler
stages:
  - test
  - build
  - deploy

variables:
  NODE_VERSION: "18"

# Configuração do cache
cache:
  key: $CI_COMMIT_REF_SLUG
  paths:
    - node_modules/

# Instalação do Doppler e dependências
.setup_doppler: &setup_doppler
  - apt-get update && apt-get install -y curl
  - curl -sLf --retry 3 --tlsv1.2 --proto "=https" 'https://packages.doppler.com/public/cli/gpg.DE2A7741A397C129.key' | apt-key add -
  - echo "deb https://packages.doppler.com/public/cli/deb/debian any-version main" | tee /etc/apt/sources.list.d/doppler-cli.list
  - apt-get update && apt-get install -y doppler
  - npm ci

# Testes com Doppler
test:
  stage: test
  image: node:$NODE_VERSION
  script:
    - *setup_doppler
    - doppler run --token=$DOPPLER_TOKEN -- npm run secure:test

# Build com Doppler
build:
  stage: build
  image: node:$NODE_VERSION
  script:
    - *setup_doppler
    - doppler run --token=$DOPPLER_TOKEN -- npm run build:production
  artifacts:
    paths:
      - dist/

# Deploy para GitLab Pages
pages:
  stage: deploy
  image: node:$NODE_VERSION
  script:
    - mkdir -p public
    - cp -r dist/* public/
  artifacts:
    paths:
      - public
  only:
    - main
    - master
`;

  const gitlabCIPath = join(__dirname, '.gitlab-ci.yml');
  writeFileSync(gitlabCIPath, gitlabCIContent);
  log(`Pipeline do GitLab CI com Doppler criado: ${gitlabCIPath}`, 'success');
}

function createPreCommitHook() {
  // Garantir que o diretório .git/hooks existe
  const hooksDir = join(__dirname, '.git', 'hooks');
  if (!existsSync(hooksDir)) {
    log('Diretório .git/hooks não encontrado. Verifique se este é um repositório Git válido.', 'warning');
    return;
  }
  
  const preCommitContent = `#!/bin/sh
# Pre-commit hook para verificar segredos expostos

echo "🔍 Verificando segredos expostos..."

# Verificar chaves do Supabase
if git diff --cached --name-only -z | xargs -0 grep -l "VITE_SUPABASE" > /dev/null; then
  echo "❌ ERRO: Chaves do Supabase encontradas nos arquivos a serem commitados."
  echo "   Execute 'npm run secure:check' para mais detalhes."
  exit 1
fi

# Verificar tokens JWT
if git diff --cached --name-only -z | xargs -0 grep -l "eyJ[A-Za-z0-9_-]*\\.[A-Za-z0-9_-]*\\.[A-Za-z0-9_-]*" > /dev/null; then
  echo "❌ ERRO: Tokens JWT encontrados nos arquivos a serem commitados."
  echo "   Execute 'npm run secure:scan' para mais detalhes."
  exit 1
fi

# Verificar API keys
if git diff --cached --name-only -z | xargs -0 grep -l "sk-[A-Za-z0-9]*" > /dev/null; then
  echo "❌ ERRO: API keys encontradas nos arquivos a serem commitados."
  echo "   Execute 'npm run secure:scan' para mais detalhes."
  exit 1
fi

# Verificar arquivos .env
if git diff --cached --name-only | grep -E "\\.env(\\..*)?$" > /dev/null; then
  echo "❌ ERRO: Tentativa de commit de arquivo .env"
  echo "   Os arquivos .env não devem ser commitados. Use o Doppler para gerenciar segredos."
  exit 1
fi

echo "✅ Nenhum segredo exposto encontrado."
exit 0
`;

  const preCommitPath = join(hooksDir, 'pre-commit');
  writeFileSync(preCommitPath, preCommitContent);
  
  // Tornar o hook executável
  try {
    execSync(`chmod +x ${preCommitPath}`);
    log(`Hook de pre-commit criado: ${preCommitPath}`, 'success');
  } catch (error) {
    log(`Erro ao tornar o hook executável: ${error.message}`, 'error');
  }
}

async function main() {
  log(`🚀 Configurando Doppler para ${ENV_DESCRIPTION}`, 'highlight');
  log('🔒 Migrando segredos para o Doppler', 'warning');
  
  // 1. Verificar se Doppler está instalado
  log('Verificando instalação do Doppler...', 'info');
  const dopplerVersion = runCommand('doppler --version', 'Verificação do Doppler', true);
  if (!dopplerVersion) {
    log('Doppler não está instalado.', 'error');
    log('Para instalar no macOS: brew install dopplerhq/cli/doppler', 'info');
    log('Para instalar no Linux: curl -sLf --retry 3 --tlsv1.2 --proto "=https" \'https://packages.doppler.com/public/cli/gpg.DE2A7741A397C129.key\' | sudo apt-key add - && echo "deb https://packages.doppler.com/public/cli/deb/debian any-version main" | sudo tee /etc/apt/sources.list.d/doppler-cli.list && sudo apt-get update && sudo apt-get install doppler', 'info');
    log('Para instalar no Windows: scoop bucket add doppler https://github.com/DopplerHQ/scoop-doppler.git && scoop install doppler', 'info');
    process.exit(1);
  }
  
  // 2. Fazer login (se necessário)
  log('Verificando autenticação...', 'info');
  try {
    execSync('doppler me', { stdio: 'pipe' });
    log('Usuário já autenticado', 'success');
  } catch {
    log('Fazendo login no Doppler...', 'warning');
    runCommand('doppler login', 'Login no Doppler');
  }
  
  // 3. Criar projeto se não existir
  log(`Configurando projeto ${PROJECT_NAME}...`, 'info');
  try {
    execSync(`doppler projects get ${PROJECT_NAME}`, { stdio: 'pipe' });
    log('Projeto já existe', 'success');
  } catch {
    log('Criando novo projeto...', 'info');
    runCommand(`doppler projects create ${PROJECT_NAME}`, 'Criação do projeto');
  }
  
  // 4. Criar configuração se não existir
  log(`Configurando ambiente ${CONFIG_NAME}...`, 'info');
  try {
    execSync(`doppler configs get ${CONFIG_NAME} --project ${PROJECT_NAME}`, { stdio: 'pipe' });
    log(`Configuração ${CONFIG_NAME} já existe`, 'success');
  } catch {
    log(`Criando configuração ${CONFIG_NAME}...`, 'info');
    runCommand(`doppler configs create ${CONFIG_NAME} --project ${PROJECT_NAME}`, 'Criação da configuração');
  }
  
  // 5. Configurar o diretório atual
  log('Vinculando diretório ao projeto...', 'info');
  runCommand(`doppler setup --project ${PROJECT_NAME} --config ${CONFIG_NAME}`, 'Configuração local');
  
  // 6. Migrar variáveis do .env e arquivos de ambiente específicos
  log('Migrando variáveis de ambiente...', 'info');
  
  // Verificar arquivos de ambiente específicos
  const envFiles = [
    { path: join(__dirname, '.env'), description: 'Arquivo .env principal' },
    { path: join(__dirname, '.env.local'), description: 'Arquivo .env.local' },
    { path: join(__dirname, 'config', `${CONFIG_NAME === 'dev' ? 'desenvolvimento' : CONFIG_NAME}.env`), description: `Arquivo de configuração ${CONFIG_NAME}` }
  ];
  
  let migratedVars = 0;
  
  for (const envFile of envFiles) {
    if (existsSync(envFile.path)) {
      log(`Processando ${envFile.description}...`, 'info');
      const envVars = loadEnvFile(envFile.path);
      
      if (Object.keys(envVars).length > 0) {
        for (const [key, value] of Object.entries(envVars)) {
          if (value && !value.includes('your_') && !value.includes('${')) {
            try {
              runCommand(
                `doppler secrets set "${key}=${value}" --project ${PROJECT_NAME} --config ${CONFIG_NAME}`,
                `Configurando ${key}`,
                true
              );
              migratedVars++;
            } catch (error) {
              log(`Erro ao configurar ${key}`, 'error');
            }
          }
        }
      }
    }
  }
  
  log(`${migratedVars} variáveis migradas para o Doppler`, migratedVars > 0 ? 'success' : 'warning');
  
  // 7. Configurar variáveis padrão (não sensíveis)
  const defaultVars = {
    'AZURE_REGION': 'brazilsouth',
    'LOCALE': 'pt-BR',
    'TIMEZONE': 'America/Sao_Paulo',
    'VITE_ENVIRONMENT': ENV_ARG
  };
  
  for (const [key, value] of Object.entries(defaultVars)) {
    try {
      runCommand(
        `doppler secrets set "${key}=${value}" --project ${PROJECT_NAME} --config ${CONFIG_NAME}`,
        `Configurando padrão ${key}`,
        true
      );
    } catch (error) {
      log(`Erro ao configurar ${key}`, 'error');
    }
  }
  
  // 8. Criar template seguro do MCP
  createSecureMcpTemplate();
  
  // 9. Criar hooks de pre-commit
  createPreCommitHook();
  
  // 10. Criar workflows de CI/CD com Doppler
  if (ENV_ARG === 'production') {
    log('Criando configurações de CI/CD com Doppler...', 'info');
    createGitHubWorkflowWithDoppler();
    createGitLabCIWithDoppler();
  }
  
  // 11. Verificar configuração
  log('Verificando configuração final...', 'info');
  runCommand(`doppler secrets --project ${PROJECT_NAME} --config ${CONFIG_NAME}`, 'Listagem de segredos', true);
  
  log(`🎉 Configuração do Doppler para ${ENV_DESCRIPTION} concluída!`, 'success');
  log('', 'info');
  
  // 12. Mostrar instruções para configurar segredos
  promptForSecrets();
  
  log('📋 Próximos passos:', 'info');
  log('1. Configure todos os segredos listados acima no Doppler Dashboard', 'warning');
  log(`2. Use "doppler run --config=${CONFIG_NAME} -- npm run dev" para executar com as variáveis do Doppler`, 'info');
  log('3. Substitua mcp.json por mcp-template-secure.json após configurar as variáveis', 'info');
  log('4. Remova arquivos .env e segredos hardcoded', 'warning');
  log('', 'info');
  log('🔗 Dashboard: https://dashboard.doppler.com/', 'info');
  
  // 13. Verificar se há segredos expostos
  log('Executando verificação de segurança...', 'info');
  runCommand('npm run secure:test', 'Verificação de segurança');
}

main().catch(error => {
  log('Erro durante a configuração', 'error');
  console.error(error);
  process.exit(1);
}); 