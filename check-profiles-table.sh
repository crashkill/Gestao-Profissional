#!/bin/bash
# Script para verificar a estrutura da tabela 'professional_profiles'

set -ex  # Parar em caso de erro e mostrar comandos executados

echo "🔍 Verificando estrutura da tabela 'professional_profiles'..."

# Obter a URL do Supabase
SUPABASE_URL=$(doppler secrets get VITE_SUPABASE_URL --plain)
echo "📡 URL do Supabase: $SUPABASE_URL"

# Obter a chave anônima do Supabase
SUPABASE_ANON_KEY=$(doppler secrets get VITE_SUPABASE_ANON_KEY --plain)
echo "🔑 Chave anônima obtida"

# Obter o ambiente configurado
ENVIRONMENT=$(doppler secrets get VITE_ENVIRONMENT --plain)
echo "🌐 Ambiente configurado: $ENVIRONMENT"

# Verificar as colunas da tabela professional_profiles
echo "\n🧪 Obtendo informações da tabela 'professional_profiles'..."

# Fazer uma consulta para obter um registro e ver as colunas disponíveis
TABLE_INFO=$(curl -s -X GET \
  "$SUPABASE_URL/rest/v1/professional_profiles?limit=1" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY")

echo "📋 Estrutura da tabela (colunas disponíveis):"
echo "$TABLE_INFO" | jq 'if length > 0 then .[0] | keys else "Tabela vazia ou não acessível" end'

# Contar registros na tabela
COUNT_QUERY=$(curl -s -X GET \
  "$SUPABASE_URL/rest/v1/professional_profiles?select=count" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -H "Prefer: count=exact")

TOTAL_COUNT=$(echo "$COUNT_QUERY" | jq -r 'if type == "array" and length > 0 then .[0].count else "Não foi possível contar registros" end')

echo "\n📊 Total de registros: $TOTAL_COUNT"

# Obter uma amostra de registros se houver algum
if [ "$TOTAL_COUNT" != "Não foi possível contar registros" ] && [ "$TOTAL_COUNT" -gt 0 ]; then
  echo "\n📋 Amostra de registros:"
  curl -s -X GET \
    "$SUPABASE_URL/rest/v1/professional_profiles?limit=3" \
    -H "apikey: $SUPABASE_ANON_KEY" \
    -H "Authorization: Bearer $SUPABASE_ANON_KEY" | jq '.'
else
  echo "\n⚠️ Não há registros para exibir."
fi

echo "\n✅ Verificação concluída!"
echo "🌐 Ambiente: $ENVIRONMENT"
echo "🔗 URL: $SUPABASE_URL"