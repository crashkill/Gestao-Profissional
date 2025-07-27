#!/usr/bin/env node

/**
 * Script para trocar ambiente de build
 * Uso: node scripts/switch-environment.js [development|homologacao|production]
 */

const fs = require('fs');
const path = require('path');

const environment = process.argv[2] || 'development';

console.log(`🔄 Configurando ambiente para: ${environment}`);

// Mapeamento de arquivos de ambiente
const envFiles = {
  development: 'config/desenvolvimento.env',
  homologacao: 'config/homologacao.env', 
  production: 'config/producao.env'
};

const envFile = envFiles[environment];

if (!envFile) {
  console.error(`❌ Ambiente inválido: ${environment}`);
  console.error('Ambientes disponíveis: development, homologacao, production');
  process.exit(1);
}

const envPath = path.join(process.cwd(), envFile);

if (!fs.existsSync(envPath)) {
  console.warn(`⚠️ Arquivo de ambiente não encontrado: ${envPath}`);
  console.log('✅ Continuando sem arquivo de ambiente específico');
  process.exit(0);
}

try {
  // Lê o arquivo de ambiente
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  // Escreve para .env
  fs.writeFileSync('.env', envContent);
  
  console.log(`✅ Ambiente ${environment} configurado com sucesso`);
  console.log(`📁 Arquivo carregado: ${envFile}`);
} catch (error) {
  console.error(`❌ Erro ao configurar ambiente: ${error.message}`);
  process.exit(1);
}