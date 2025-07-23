#!/bin/bash
# Script para alternar para homologação e testar a conexão

set -e  # Parar em caso de erro

echo "🔄 Alternando para ambiente de HOMOLOGAÇÃO..."

# Configurar URL do Supabase para homologação
echo "📡 Configurando URL do Supabase para homologação..."
doppler secrets set VITE_SUPABASE_URL="https://zbiivgtdamejiwcabmcv.supabase.co"

# Configurar chave anônima de homologação
echo "🔑 Configurando chave anônima de homologação..."
doppler secrets set VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpiaWl2Z3RkYW1laml3Y2FibWN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExOTA5NTYsImV4cCI6MjA2Njc2Njk1Nn0.qrXX_H0dqN5HP3_-TQUUTyIpb_-oauRBmwj8vyaKMe4"

# Configurar ambiente
echo "🌐 Configurando ambiente para homologação..."
doppler secrets set VITE_ENVIRONMENT="homologacao"

# Verificar configurações
echo "🔍 Verificando configurações..."
echo "URL: $(doppler secrets get VITE_SUPABASE_URL --plain)"
echo "Ambiente: $(doppler secrets get VITE_ENVIRONMENT --plain)"

echo "\n✅ Configuração concluída!"
echo "\n📋 Próximos passos:"
echo "   1. Reinicie o servidor: doppler run -- npx vite"
echo "   2. Acesse: http://localhost:5173/"
echo "   3. Verifique se a aplicação está conectada ao ambiente de homologação"