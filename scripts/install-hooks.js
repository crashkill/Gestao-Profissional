#!/usr/bin/env node

/**
 * 🔒 Instalador de Git Hooks
 * 
 * Este script instala os hooks de Git para garantir a segurança do repositório.
 */

import { execSync } from 'child_process';
import { existsSync, copyFileSync, chmodSync, mkdirSync } from 'fs';
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
 * Verifica se o diretório é um repositório Git
 */
function isGitRepository() {
  try {
    execSync('git rev-parse --is-inside-work-tree', { stdio: 'pipe' });
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Instala os hooks de Git
 */
function installGitHooks() {
  if (!isGitRepository()) {
    log('Este diretório não é um repositório Git', 'error');
    return false;
  }
  
  // Obter o diretório de hooks do Git
  const gitDir = execSync('git rev-parse --git-dir', { encoding: 'utf8' }).trim();
  const hooksDir = join(rootDir, gitDir, 'hooks');
  
  // Criar diretório de hooks se não existir
  if (!existsSync(hooksDir)) {
    try {
      mkdirSync(hooksDir, { recursive: true });
    } catch (error) {
      log(`Erro ao criar diretório de hooks: ${error.message}`, 'error');
      return false;
    }
  }
  
  // Hooks a serem instalados
  const hooks = [
    { name: 'pre-commit', source: join(rootDir, '.github', 'hooks', 'pre-commit') }
  ];
  
  let success = true;
  
  // Instalar cada hook
  for (const hook of hooks) {
    const sourcePath = hook.source;
    const targetPath = join(hooksDir, hook.name);
    
    if (!existsSync(sourcePath)) {
      log(`Hook ${hook.name} não encontrado em ${sourcePath}`, 'error');
      success = false;
      continue;
    }
    
    try {
      // Copiar o hook
      copyFileSync(sourcePath, targetPath);
      
      // Tornar o hook executável
      chmodSync(targetPath, '755');
      
      log(`Hook ${hook.name} instalado com sucesso`, 'success');
    } catch (error) {
      log(`Erro ao instalar hook ${hook.name}: ${error.message}`, 'error');
      success = false;
    }
  }
  
  return success;
}

// Executar a instalação
log('🔒 Instalando hooks de Git...', 'highlight');
const result = installGitHooks();

if (result) {
  log('🎉 Hooks de Git instalados com sucesso!', 'success');
} else {
  log('⚠️ Houve erros na instalação dos hooks de Git', 'error');
  process.exit(1);
}