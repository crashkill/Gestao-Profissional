#!/usr/bin/env node

/**
 * 🔍 Verificador de Instalação do Doppler
 * 
 * Este script verifica se o Doppler CLI está instalado e configurado corretamente.
 * Também fornece instruções para instalação caso não esteja disponível.
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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
 * Verifica se o Doppler CLI está instalado
 */
function checkDopplerInstallation() {
  try {
    const version = execSync('doppler --version', { encoding: 'utf8' }).trim();
    log(`Doppler CLI ${version} está instalado`, 'success');
    return true;
  } catch (error) {
    log('Doppler CLI não está instalado', 'error');
    return false;
  }
}

/**
 * Verifica se o Doppler está configurado para o projeto
 */
function checkDopplerConfiguration() {
  try {
    // Verifica se existe um arquivo .doppler.yaml na raiz do projeto
    const dopplerConfigPath = join(process.cwd(), '.doppler.yaml');
    if (existsSync(dopplerConfigPath)) {
      log('Doppler está configurado para este projeto', 'success');
      
      // Tenta obter informações sobre o projeto configurado
      try {
        const configInfo = execSync('doppler configure', { encoding: 'utf8' }).trim();
        log(`Configuração atual: ${configInfo}`, 'info');
      } catch (error) {
        // Ignora erros ao tentar obter informações de configuração
      }
      
      return true;
    } else {
      log('Doppler não está configurado para este projeto', 'warning');
      return false;
    }
  } catch (error) {
    log(`Erro ao verificar configuração do Doppler: ${error.message}`, 'error');
    return false;
  }
}

/**
 * Verifica se o usuário está autenticado no Doppler
 */
function checkDopplerAuthentication() {
  try {
    execSync('doppler me', { stdio: 'pipe' });
    log('Usuário autenticado no Doppler', 'success');
    return true;
  } catch (error) {
    log('Usuário não está autenticado no Doppler', 'warning');
    return false;
  }
}

/**
 * Fornece instruções para instalação do Doppler
 */
function provideInstallationInstructions() {
  log('\n📋 Instruções para instalação do Doppler CLI:', 'highlight');
  
  // Detecta o sistema operacional
  const isWindows = process.platform === 'win32';
  const isMac = process.platform === 'darwin';
  const isLinux = process.platform === 'linux';
  
  if (isMac) {
    log('Para macOS (usando Homebrew):', 'info');
    log('  brew install dopplerhq/cli/doppler', 'highlight');
  } else if (isLinux) {
    log('Para Linux (Debian/Ubuntu):', 'info');
    log('  curl -sLf --retry 3 --tlsv1.2 --proto "=https" \'https://packages.doppler.com/public/cli/gpg.DE2A7741A397C129.key\' | sudo apt-key add -', 'highlight');
    log('  echo "deb https://packages.doppler.com/public/cli/deb/debian any-version main" | sudo tee /etc/apt/sources.list.d/doppler-cli.list', 'highlight');
    log('  sudo apt-get update && sudo apt-get install doppler', 'highlight');
  } else if (isWindows) {
    log('Para Windows (usando scoop):', 'info');
    log('  scoop bucket add doppler https://github.com/DopplerHQ/scoop-doppler.git', 'highlight');
    log('  scoop install doppler', 'highlight');
  } else {
    log('Visite https://docs.doppler.com/docs/cli para instruções de instalação para seu sistema operacional', 'info');
  }
  
  log('\nApós a instalação, execute:', 'info');
  log('  doppler login', 'highlight');
  log('  npm run doppler:setup', 'highlight');
}

/**
 * Função principal
 */
function main() {
  log('🚀 Verificando instalação do Doppler CLI...', 'highlight');
  
  const isInstalled = checkDopplerInstallation();
  
  if (!isInstalled) {
    provideInstallationInstructions();
    process.exit(1);
  }
  
  const isAuthenticated = checkDopplerAuthentication();
  const isConfigured = checkDopplerConfiguration();
  
  if (!isAuthenticated) {
    log('\n📋 Para autenticar no Doppler, execute:', 'highlight');
    log('  doppler login', 'highlight');
  }
  
  if (!isConfigured) {
    log('\n📋 Para configurar o Doppler para este projeto, execute:', 'highlight');
    log('  npm run doppler:setup', 'highlight');
  }
  
  if (isInstalled && isAuthenticated && isConfigured) {
    log('\n🎉 Doppler está corretamente instalado e configurado!', 'success');
    log('Para gerenciar seus segredos, execute:', 'info');
    log('  npm run doppler:dashboard', 'highlight');
    log('  npm run doppler:secrets', 'highlight');
    process.exit(0);
  } else {
    log('\n⚠️ Doppler precisa de configuração adicional', 'warning');
    process.exit(1);
  }
}

// Executa a função principal
main();