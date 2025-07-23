#!/bin/bash
# Script para verificar as variáveis de ambiente

echo "🔍 Verificando variáveis de ambiente..."

# Obter a URL do Supabase
SUPABASE_URL=$(doppler secrets get VITE_SUPABASE_URL --plain)
echo "📡 URL do Supabase: $SUPABASE_URL"

# Obter a chave anônima do Supabase
SUPABASE_ANON_KEY=$(doppler secrets get VITE_SUPABASE_ANON_KEY --plain)
echo "🔑 Chave anônima obtida: ${SUPABASE_ANON_KEY:0:10}..."

# Obter o ambiente configurado
ENVIRONMENT=$(doppler secrets get VITE_ENVIRONMENT --plain)
echo "🌐 Ambiente configurado: $ENVIRONMENT"

# Testar conexão básica com o Supabase
echo "\n🔌 Testando conexão com o Supabase..."
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$SUPABASE_URL/rest/v1/" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY")

echo "📊 Status HTTP: $HTTP_STATUS"

if [ "$HTTP_STATUS" == "200" ]; then
  echo "✅ Conexão bem-sucedida!"
else
  echo "❌ Falha na conexão!"
fi

echo "\n✅ Verificação concluída!"
echo "🌐 Ambiente: $ENVIRONMENT"
echo "🔗 URL: $SUPABASE_URL"