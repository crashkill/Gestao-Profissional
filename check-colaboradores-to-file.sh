#!/bin/bash
# Script para verificar a estrutura da tabela 'colaboradores' e salvar em arquivo

OUTPUT_FILE="colaboradores-check-result.txt"

echo "🔍 Verificando estrutura da tabela 'colaboradores'..." | tee "$OUTPUT_FILE"

# Obter a URL do Supabase
SUPABASE_URL=$(doppler secrets get VITE_SUPABASE_URL --plain)
echo "📡 URL do Supabase: $SUPABASE_URL" | tee -a "$OUTPUT_FILE"

# Obter a chave anônima do Supabase
SUPABASE_ANON_KEY=$(doppler secrets get VITE_SUPABASE_ANON_KEY --plain)
echo "🔑 Chave anônima obtida: ${SUPABASE_ANON_KEY:0:10}..." | tee -a "$OUTPUT_FILE"

# Obter o ambiente configurado
ENVIRONMENT=$(doppler secrets get VITE_ENVIRONMENT --plain)
echo "🌐 Ambiente configurado: $ENVIRONMENT" | tee -a "$OUTPUT_FILE"

# Verificar as colunas da tabela colaboradores
echo "\n🧪 Obtendo informações da tabela 'colaboradores'..." | tee -a "$OUTPUT_FILE"

# Fazer uma consulta para obter um registro e ver as colunas disponíveis
TABLE_INFO=$(curl -s -X GET \
  "$SUPABASE_URL/rest/v1/colaboradores?limit=1" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY")

echo "📋 Estrutura da tabela (colunas disponíveis):" | tee -a "$OUTPUT_FILE"
echo "$TABLE_INFO" | jq 'if length > 0 then .[0] | keys else "Tabela vazia ou não acessível" end' | tee -a "$OUTPUT_FILE"

# Contar registros na tabela
COUNT_QUERY=$(curl -s -X GET \
  "$SUPABASE_URL/rest/v1/colaboradores?select=count" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -H "Prefer: count=exact")

TOTAL_COUNT=$(echo "$COUNT_QUERY" | jq -r 'if type == "array" and length > 0 then .[0].count else "Não foi possível contar registros" end')

echo "\n📊 Total de registros: $TOTAL_COUNT" | tee -a "$OUTPUT_FILE"

# Obter uma amostra de registros se houver algum
if [ "$TOTAL_COUNT" != "Não foi possível contar registros" ] && [ "$TOTAL_COUNT" -gt 0 ]; then
  echo "\n📋 Amostra de registros:" | tee -a "$OUTPUT_FILE"
  curl -s -X GET \
    "$SUPABASE_URL/rest/v1/colaboradores?limit=3" \
    -H "apikey: $SUPABASE_ANON_KEY" \
    -H "Authorization: Bearer $SUPABASE_ANON_KEY" | jq '.' | tee -a "$OUTPUT_FILE"
else
  echo "\n⚠️ Não há registros para exibir." | tee -a "$OUTPUT_FILE"
fi

echo "\n✅ Verificação concluída!" | tee -a "$OUTPUT_FILE"
echo "🌐 Ambiente: $ENVIRONMENT" | tee -a "$OUTPUT_FILE"
echo "🔗 URL: $SUPABASE_URL" | tee -a "$OUTPUT_FILE"
echo "\n📄 Resultados salvos em: $OUTPUT_FILE"