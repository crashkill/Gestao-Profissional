#!/bin/bash
# Script simples para listar tabelas no Supabase

echo "🔍 Verificando tabelas disponíveis no Supabase..."

# Obter a URL do Supabase
SUPABASE_URL=$(doppler secrets get VITE_SUPABASE_URL --plain)
echo "📡 URL do Supabase: $SUPABASE_URL"

# Obter a chave anônima do Supabase
SUPABASE_ANON_KEY=$(doppler secrets get VITE_SUPABASE_ANON_KEY --plain)
echo "🔑 Chave anônima obtida"

# Obter o ambiente configurado
ENVIRONMENT=$(doppler secrets get VITE_ENVIRONMENT --plain)
echo "🌐 Ambiente configurado: $ENVIRONMENT"

# Listar tabelas disponíveis
echo "\n🔍 Listando tabelas disponíveis..."
curl -s -X GET \
  "$SUPABASE_URL/rest/v1/" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" | grep -o '"[^"]*":' | tr -d '":' | sort

echo "\n✅ Verificação concluída!"
echo "🌐 Ambiente: $ENVIRONMENT"
echo "🔗 URL: $SUPABASE_URL"