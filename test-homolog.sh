#!/bin/bash
# Script para testar o ambiente de homologação

set -e  # Parar em caso de erro

# Configurações do Projeto de Homologação
HOMOLOG_URL="https://zbiivgtdamejiwcabmcv.supabase.co"

# Obter chaves do Doppler
HOMOLOG_ANON_KEY=$(doppler secrets get VITE_SUPABASE_ANON_KEY --plain)
HOMOLOG_SERVICE_KEY=$(doppler secrets get SUPABASE_HOMOLOG_SERVICE_KEY --plain)

echo "🧪 Testando ambiente de homologação"
echo "======================================================="
echo "🔗 URL: $HOMOLOG_URL"
echo "======================================================="

# Verificar se as chaves estão configuradas
if [ -z "$HOMOLOG_ANON_KEY" ] || [ -z "$HOMOLOG_SERVICE_KEY" ]; then
    echo "❌ ERRO: Chaves não configuradas!"
    exit 1
fi

# Testar com chave de serviço (acesso total)
echo "\n🔑 Testando com chave de serviço..."
SERVICE_COUNT=$(curl -s "$HOMOLOG_URL/rest/v1/colaboradores?select=count" \
    -H "apikey: $HOMOLOG_SERVICE_KEY" \
    -H "Authorization: Bearer $HOMOLOG_SERVICE_KEY" | jq -r '.[0].count // 0')

echo "📊 Registros em Homologação (chave de serviço): $SERVICE_COUNT"

# Testar com chave anônima (acesso público)
echo "\n🔑 Testando com chave anônima..."
ANON_COUNT=$(curl -s "$HOMOLOG_URL/rest/v1/colaboradores?select=count" \
    -H "apikey: $HOMOLOG_ANON_KEY" \
    -H "Authorization: Bearer $HOMOLOG_ANON_KEY" | jq -r '.[0].count // 0')

echo "📊 Registros em Homologação (chave anônima): $ANON_COUNT"

# Verificar alguns registros
echo "\n📋 Verificando alguns registros..."
curl -s "$HOMOLOG_URL/rest/v1/colaboradores?select=id,nome_completo,email&limit=3" \
    -H "apikey: $HOMOLOG_SERVICE_KEY" \
    -H "Authorization: Bearer $HOMOLOG_SERVICE_KEY" | jq

echo "\n✅ Teste concluído!"