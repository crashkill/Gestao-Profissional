#!/bin/bash
# Script para verificar a estrutura da tabela 'colaboradores'

set -e  # Parar em caso de erro

echo "🔍 Verificando estrutura da tabela 'colaboradores'..."

# Obter a URL do Supabase
SUPABASE_URL=$(doppler secrets get VITE_SUPABASE_URL --plain)
echo "📡 URL do Supabase: $SUPABASE_URL"

# Obter a chave anônima do Supabase
SUPABASE_ANON_KEY=$(doppler secrets get VITE_SUPABASE_ANON_KEY --plain)
echo "🔑 Chave anônima obtida"

# Obter o ambiente configurado
ENVIRONMENT=$(doppler secrets get VITE_ENVIRONMENT --plain)
echo "🌐 Ambiente configurado: $ENVIRONMENT"

# Verificar as colunas da tabela colaboradores
echo "\n🧪 Obtendo informações da tabela 'colaboradores'..."

# Fazer uma consulta para obter um registro e ver as colunas disponíveis
TABLE_INFO=$(curl -s -X GET \
  "$SUPABASE_URL/rest/v1/colaboradores?limit=1" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY")

echo "📋 Estrutura da tabela (colunas disponíveis):"
echo "$TABLE_INFO" | jq 'if length > 0 then .[0] | keys else "Tabela vazia ou não acessível" end'

# Verificar se a tabela existe listando todas as tabelas
echo "\n🔍 Listando todas as tabelas disponíveis..."

# Esta consulta requer permissões administrativas e pode não funcionar com a chave anônima
TABLES=$(curl -s -X GET \
  "$SUPABASE_URL/rest/v1/" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY")

echo "📋 Tabelas disponíveis:"
echo "$TABLES"

echo "\n✅ Verificação concluída!"
echo "🌐 Ambiente: $ENVIRONMENT"
echo "🔗 URL: $SUPABASE_URL"