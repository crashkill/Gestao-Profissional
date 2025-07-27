#!/usr/bin/env node

/**
 * Script de validação de segurança
 * Verifica se não há dados sensíveis expostos no código
 */

const fs = require('fs');
const path = require('path');

// Padrões de dados sensíveis a serem detectados
const SENSITIVE_PATTERNS = [
  /eyJ[A-Za-z0-9_-]{10,}/g, // JWT tokens
  /sk-[A-Za-z0-9_-]{20,}/g, // OpenAI API keys
  /gsk_[A-Za-z0-9_-]{20,}/g, // Google API keys
  /AKIA[0-9A-Z]{16}/g, // AWS Access Keys
  /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/g, // UUIDs que podem ser secrets
];

// Diretórios a serem ignorados
const IGNORE_DIRS = ['node_modules', '.git', 'dist', '.next', 'build'];

// Arquivos específicos a serem ignorados (exemplos de documentação)
const IGNORE_FILES = ['docs/CONFIGURAR-CHAVES-SERVICO.md'];

// Extensões de arquivo a serem verificadas
const CHECK_EXTENSIONS = ['.js', '.ts', '.jsx', '.tsx', '.json', '.env', '.md', '.yml', '.yaml'];

function scanDirectory(dirPath) {
  const issues = [];
  
  function scanFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const relativePath = path.relative(process.cwd(), filePath);
      
      // Pular arquivos específicos que contêm exemplos
      if (IGNORE_FILES.some(ignoreFile => relativePath.includes(ignoreFile))) {
        return;
      }
      
      SENSITIVE_PATTERNS.forEach((pattern, index) => {
        const matches = content.match(pattern);
        if (matches) {
          matches.forEach(match => {
            issues.push({
              file: relativePath,
              pattern: pattern.toString(),
              match: match.substring(0, 20) + '...', // Trunca para não expor o token completo
              line: content.substring(0, content.indexOf(match)).split('\n').length
            });
          });
        }
      });
    } catch (error) {
      // Ignora erros de leitura de arquivo
    }
  }
  
  function walkDirectory(currentPath) {
    try {
      const items = fs.readdirSync(currentPath);
      
      items.forEach(item => {
        const itemPath = path.join(currentPath, item);
        const stat = fs.statSync(itemPath);
        
        if (stat.isDirectory()) {
          if (!IGNORE_DIRS.includes(item) && !item.startsWith('.')) {
            walkDirectory(itemPath);
          }
        } else if (stat.isFile()) {
          const ext = path.extname(item);
          if (CHECK_EXTENSIONS.includes(ext)) {
            scanFile(itemPath);
          }
        }
      });
    } catch (error) {
      // Ignora erros de acesso a diretório
    }
  }
  
  walkDirectory(dirPath);
  return issues;
}

function main() {
  console.log('🔍 Iniciando validação de segurança...');
  
  const issues = scanDirectory(process.cwd());
  
  if (issues.length === 0) {
    console.log('✅ Nenhum dado sensível detectado!');
    process.exit(0);
  } else {
    console.log('⚠️  Dados sensíveis detectados:');
    issues.forEach(issue => {
      console.log(`  - ${issue.file}:${issue.line} - ${issue.match}`);
    });
    console.log('\n🛡️  Por favor, remova os dados sensíveis antes de fazer commit.');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { scanDirectory, SENSITIVE_PATTERNS };