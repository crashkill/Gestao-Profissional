#!/usr/bin/env node

/**
 * 🔄 Doppler Fallback
 * 
 * Este script fornece um fallback seguro para quando o Doppler não está disponível.
 * Ele tenta carregar variáveis de ambiente do Doppler e, se falhar, usa arquivos .env locais.
 */

import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

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

/**
 * Verifica se o Doppler está instalado e configurado
 */
function isDopplerAvailable() {
  try {
    execSync('doppler --version', { stdio: 'pipe' });
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Verifica se o Doppler está configurado para o projeto
 */
function isDopplerConfigured() {
  try {
    execSync('doppler configure', { stdio: 'pipe' });
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Carrega variáveis de ambiente do arquivo .env
 */
function loadEnvFile(envPath) {
  if (!existsSync(envPath)) {
    return {};
  }
  
  try {
    const envConfig = dotenv.parse(readFileSync(envPath));
    return envConfig;
  } catch (error) {
    log(`Erro ao carregar ${envPath}: ${error.message}`, 'error');
    return {};
  }
}

/**
 * Carrega variáveis de ambiente do Doppler
 */
function loadDopplerEnv() {
  try {
    const output = execSync('doppler secrets --json', { encoding: 'utf8', stdio: 'pipe' });
    const secrets = JSON.parse(output);
    
    // Definir variáveis de ambiente
    Object.entries(secrets).forEach(([key, value]) => {
      process.env[key] = value.computed;
    });
    
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Carrega variáveis de ambiente com fallback
 */
function loadEnvironmentWithFallback() {
  // Determinar o ambiente atual
  const nodeEnv = process.env.NODE_ENV || 'development';
  
  log(`🔧 Carregando variáveis de ambiente para: ${nodeEnv}`, 'highlight');
  
  // Verificar se o Doppler está disponível
  if (isDopplerAvailable() && isDopplerConfigured()) {
    log('Tentando carregar variáveis do Doppler...', 'info');
    
    if (loadDopplerEnv()) {
      log('Variáveis carregadas do Doppler com sucesso', 'success');
      return true;
    }
    
    log('Falha ao carregar variáveis do Doppler', 'warning');
  } else {
    log('Doppler não está disponível ou configurado', 'warning');
  }
  
  // Fallback para arquivos .env
  log('Usando fallback para arquivos .env locais', 'info');
  
  // Mapear ambientes para arquivos de configuração
  const envFileMap = {
    'development': 'desenvolvimento.env',
    'homologacao': 'homologacao.env',
    'production': 'producao.env'
  };
  
  // Arquivos a serem carregados em ordem de prioridade
  const envFiles = [
    join(rootDir, '.env'),
    join(rootDir, '.env.local'),
    join(rootDir, 'config', envFileMap[nodeEnv] || 'desenvolvimento.env'),
    join(rootDir, `.env.${nodeEnv}`)
  ];
  
  let loadedVars = 0;
  
  // Carregar cada arquivo
  for (const envFile of envFiles) {
    if (existsSync(envFile)) {
      const envVars = loadEnvFile(envFile);
      
      // Definir variáveis de ambiente
      Object.entries(envVars).forEach(([key, value]) => {
        if (!process.env[key]) {
          process.env[key] = value;
          loadedVars++;
        }
      });
      
      log(`Carregadas ${Object.keys(envVars).length} variáveis de ${envFile}`, 'info');
    }
  }
  
  if (loadedVars > 0) {
    log(`Total de ${loadedVars} variáveis carregadas de arquivos .env`, 'success');
    return true;
  } else {
    log('Nenhuma variável de ambiente carregada', 'error');
    return false;
  }
}

/**
 * Executa um comando com variáveis de ambiente carregadas
 */
function runCommandWithEnv(command) {
  // Carregar variáveis de ambiente
  loadEnvironmentWithFallback();
  
  // Executar o comando
  log(`Executando: ${command}`, 'info');
  
  try {
    execSync(command, { stdio: 'inherit' });
    log('Comando executado com sucesso', 'success');
    return true;
  } catch (error) {
    log(`Erro ao executar comando: ${error.message}`, 'error');
    return false;
  }
}

// Se executado diretamente
if (require.main === module) {
  // Obter o comando dos argumentos
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    // Se não houver comando, apenas carregar variáveis
    loadEnvironmentWithFallback();
  } else {
    // Se houver comando, executá-lo com as variáveis carregadas
    const command = args.join(' ');
    const success = runCommandWithEnv(command);
    
    process.exit(success ? 0 : 1);
  }
}

export { loadEnvironmentWithFallback, runCommandWithEnv };