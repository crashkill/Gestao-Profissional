#!/usr/bin/env node

/**
 * 🛡️ Monitor de Segurança
 * 
 * Este script monitora continuamente o código-fonte em busca de segredos expostos
 * e outras vulnerabilidades de segurança.
 */

import { execSync } from 'child_process';
import { watch } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

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
 * Verifica se há segredos expostos no código
 */
function checkForExposedSecrets() {
  log('Verificando segredos expostos...', 'info');
  
  try {
    // Verificar chaves do Supabase
    execSync('npm run secure:check', { stdio: 'pipe' });
    
    // Verificar outros segredos
    execSync('npm run secure:scan', { stdio: 'pipe' });
    
    log('Nenhum segredo exposto encontrado', 'success');
    return true;
  } catch (error) {
    log('ALERTA: Segredos expostos encontrados!', 'error');
    console.error(error.stdout?.toString() || error.message);
    return false;
  }
}

/**
 * Verifica se há arquivos .env no repositório
 */
function checkForEnvFiles() {
  log('Verificando arquivos .env...', 'info');
  
  try {
    const result = execSync('git ls-files | grep -E "\\.env(\\..*)?$"', { encoding: 'utf8', stdio: 'pipe' });
    
    if (result.trim()) {
      log('ALERTA: Arquivos .env encontrados no repositório!', 'error');
      console.log(result);
      return false;
    } else {
      log('Nenhum arquivo .env encontrado no repositório', 'success');
      return true;
    }
  } catch (error) {
    // grep retorna código de erro quando não encontra nada, o que é bom neste caso
    log('Nenhum arquivo .env encontrado no repositório', 'success');
    return true;
  }
}

/**
 * Verifica se o Doppler está configurado corretamente
 */
function checkDopplerConfiguration() {
  log('Verificando configuração do Doppler...', 'info');
  
  try {
    execSync('doppler --version', { stdio: 'pipe' });
    
    try {
      execSync('doppler configure', { stdio: 'pipe' });
      log('Doppler está configurado corretamente', 'success');
      return true;
    } catch (error) {
      log('ALERTA: Doppler não está configurado para este projeto!', 'warning');
      log('Execute "npm run doppler:setup" para configurar', 'info');
      return false;
    }
  } catch (error) {
    log('ALERTA: Doppler CLI não está instalado!', 'error');
    log('Execute "npm run doppler:verify" para instruções de instalação', 'info');
    return false;
  }
}

/**
 * Executa todas as verificações de segurança
 */
function runSecurityChecks() {
  log('🛡️ Executando verificações de segurança...', 'highlight');
  
  const results = {
    exposedSecrets: checkForExposedSecrets(),
    envFiles: checkForEnvFiles(),
    dopplerConfig: checkDopplerConfiguration()
  };
  
  const allPassed = Object.values(results).every(result => result === true);
  
  if (allPassed) {
    log('🎉 Todas as verificações de segurança passaram!', 'success');
  } else {
    log('⚠️ Algumas verificações de segurança falharam!', 'error');
  }
  
  return allPassed;
}

/**
 * Monitora alterações nos arquivos e executa verificações de segurança
 */
function monitorFiles() {
  log('🔍 Iniciando monitoramento de segurança...', 'highlight');
  log('Pressione Ctrl+C para encerrar', 'info');
  
  // Executar verificação inicial
  runSecurityChecks();
  
  // Diretórios a serem monitorados
  const dirsToWatch = [
    join(rootDir, 'src'),
    join(rootDir, 'scripts'),
    join(rootDir, 'config'),
    rootDir // Raiz do projeto
  ];
  
  // Configurar monitoramento
  dirsToWatch.forEach(dir => {
    watch(dir, { recursive: true }, (eventType, filename) => {
      if (filename) {
        // Ignorar arquivos em node_modules, .git e dist
        if (filename.includes('node_modules') || filename.includes('.git') || filename.includes('dist')) {
          return;
        }
        
        log(`Alteração detectada: ${filename}`, 'info');
        runSecurityChecks();
      }
    });
  });
  
  log('Monitoramento ativo. Aguardando alterações...', 'info');
}

// Se executado diretamente
if (process.argv[2] === '--monitor') {
  monitorFiles();
} else {
  runSecurityChecks();
}

export { runSecurityChecks, checkForExposedSecrets, checkForEnvFiles, checkDopplerConfiguration };