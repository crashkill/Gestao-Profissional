#!/bin/bash
# Script para testar a conexão com o banco de dados de homologação

set -e  # Parar em caso de erro

echo "🔍 Testando conexão com o banco de dados de homologação..."

# Obter a URL do Supabase
SUPABASE_URL=$(doppler secrets get VITE_SUPABASE_URL --plain)
echo "📡 URL do Supabase: $SUPABASE_URL"

# Obter a chave anônima do Supabase
SUPABASE_ANON_KEY=$(doppler secrets get VITE_SUPABASE_ANON_KEY --plain)
echo "🔑 Chave anônima obtida"

# Obter o ambiente configurado
ENVIRONMENT=$(doppler secrets get VITE_ENVIRONMENT --plain)
echo "🌐 Ambiente configurado: $ENVIRONMENT"

# Testar a conexão com o banco de dados
echo "\n🧪 Testando conexão com a tabela 'colaboradores'..."

# Contar registros na tabela colaboradores
COUNT_RESULT=$(curl -s -X GET \
  "$SUPABASE_URL/rest/v1/colaboradores?select=count" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY")

# Verificar se a resposta contém um erro
if [[ "$COUNT_RESULT" == *"error"* ]]; then
  echo "❌ Erro ao conectar com o banco de dados: $COUNT_RESULT"
  exit 1
fi

# Extrair a contagem de registros
COUNT=$(echo "$COUNT_RESULT" | grep -o '"count":[0-9]*' | cut -d':' -f2)

echo "✅ Conexão bem-sucedida!"
echo "📊 Número de registros na tabela 'colaboradores': $COUNT"

echo "\n🔍 Obtendo alguns registros para verificação..."

# Obter alguns registros para verificação
SAMPLE_RESULT=$(curl -s -X GET \
  "$SUPABASE_URL/rest/v1/colaboradores?select=id,nome,email&limit=3" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY")

echo "📋 Amostra de registros:"
echo "$SAMPLE_RESULT" | jq .

echo "\n✅ Teste de conexão concluído com sucesso!"
echo "🌐 Ambiente: $ENVIRONMENT"
echo "🔗 URL: $SUPABASE_URL"