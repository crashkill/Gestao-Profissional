#!/bin/bash
# 🔐 Script para Configurar Políticas RLS no Banco de Homologação
# Este script configura as políticas de segurança para permitir operações básicas

set -e  # Parar em caso de erro

# 🎯 Configurações do Projeto de Homologação
HOMOLOG_PROJECT_ID="zbiivgtdamejiwcabmcv"
HOMOLOG_URL="https://zbiivgtdamejiwcabmcv.supabase.co"
HOMOLOG_ANON_KEY="YOUR_HOMOLOG_ANON_KEY_HERE"

echo "🔐 Configurando Políticas RLS para Homologação"
echo "============================================="
echo "🧪 Projeto: $HOMOLOG_PROJECT_ID"
echo "🌐 URL: $HOMOLOG_URL"
echo "============================================="

# 🔍 Verificar conexão
echo "🔍 Verificando conexão com homologação..."
CONNECTION_TEST=$(curl -s -o /dev/null -w "%{http_code}" \
  "$HOMOLOG_URL/rest/v1/colaboradores?select=count" \
  -H "apikey: $HOMOLOG_ANON_KEY" \
  -H "Authorization: Bearer $HOMOLOG_ANON_KEY")

if [ "$CONNECTION_TEST" != "200" ]; then
  echo "❌ ERRO: Não foi possível conectar à HOMOLOGAÇÃO (HTTP $CONNECTION_TEST)"
  exit 1
fi
echo "✅ Conexão com HOMOLOGAÇÃO: OK"

# 📊 Verificar estrutura atual
echo "📊 Verificando estrutura da tabela colaboradores..."
TABLE_INFO=$(curl -s \
  "$HOMOLOG_URL/rest/v1/colaboradores?select=*&limit=0" \
  -H "apikey: $HOMOLOG_ANON_KEY" \
  -H "Authorization: Bearer $HOMOLOG_ANON_KEY")

if echo "$TABLE_INFO" | jq -e '. | length' > /dev/null 2>&1; then
  echo "✅ Tabela 'colaboradores' existe e é acessível"
else
  echo "❌ ERRO: Tabela 'colaboradores' não existe ou não é acessível"
  echo "📋 Resposta: $TABLE_INFO"
  exit 1
fi

# 🔐 Configurar políticas RLS via SQL
echo "🔐 Configurando políticas RLS..."

# SQL para configurar políticas permissivas para homologação
SQL_POLICIES='{
  "query": "-- Remover políticas existentes\nDROP POLICY IF EXISTS \"Enable read access for all users\" ON colaboradores;\nDROP POLICY IF EXISTS \"Enable insert for all users\" ON colaboradores;\nDROP POLICY IF EXISTS \"Enable update for all users\" ON colaboradores;\nDROP POLICY IF EXISTS \"Enable delete for all users\" ON colaboradores;\n\n-- Criar políticas permissivas para homologação\nCREATE POLICY \"Enable read access for all users\" ON colaboradores FOR SELECT USING (true);\nCREATE POLICY \"Enable insert for all users\" ON colaboradores FOR INSERT WITH CHECK (true);\nCREATE POLICY \"Enable update for all users\" ON colaboradores FOR UPDATE USING (true);\nCREATE POLICY \"Enable delete for all users\" ON colaboradores FOR DELETE USING (true);\n\n-- Garantir que RLS está habilitado\nALTER TABLE colaboradores ENABLE ROW LEVEL SECURITY;"
}'

# Executar SQL via API REST
echo "📝 Executando comandos SQL..."
SQL_RESULT=$(curl -s -X POST \
  "$HOMOLOG_URL/rest/v1/rpc/exec_sql" \
  -H "apikey: $HOMOLOG_ANON_KEY" \
  -H "Authorization: Bearer $HOMOLOG_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d "$SQL_POLICIES")

# Verificar se houve erro na execução SQL
if echo "$SQL_RESULT" | jq -e '.code' > /dev/null 2>&1; then
  echo "⚠️ AVISO: Não foi possível executar SQL via API REST"
  echo "📋 Resposta: $SQL_RESULT"
  echo "💡 Isso é normal - a API REST não permite execução de DDL"
  echo "🔧 As políticas precisam ser configuradas manualmente no dashboard"
else
  echo "✅ Comandos SQL executados com sucesso"
fi

# 🧪 Testar inserção de dados
echo "🧪 Testando inserção de dados..."
TEST_DATA='{
  "nome_completo": "Teste Migração",
  "email": "teste.migracao@exemplo.com",
  "area_atuacao": "Tecnologia",
  "skill_principal": "Teste",
  "nivel_experiencia": "Junior",
  "disponivel_compartilhamento": true,
  "percentual_compartilhamento": 50,
  "outras_skills": ["teste"]
}'

INSERT_RESULT=$(curl -s -X POST \
  "$HOMOLOG_URL/rest/v1/colaboradores" \
  -H "apikey: $HOMOLOG_ANON_KEY" \
  -H "Authorization: Bearer $HOMOLOG_ANON_KEY" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=minimal" \
  -d "$TEST_DATA")

# Verificar resultado do teste
if echo "$INSERT_RESULT" | jq -e '.code' > /dev/null 2>&1; then
  ERROR_CODE=$(echo "$INSERT_RESULT" | jq -r '.code')
  ERROR_MESSAGE=$(echo "$INSERT_RESULT" | jq -r '.message')
  
  if [ "$ERROR_CODE" = "42501" ]; then
    echo "❌ ERRO: Políticas RLS ainda estão bloqueando inserções"
    echo "📋 Mensagem: $ERROR_MESSAGE"
    echo ""
    echo "🔧 SOLUÇÃO MANUAL NECESSÁRIA:"
    echo "1. Acesse: https://supabase.com/dashboard/project/$HOMOLOG_PROJECT_ID"
    echo "2. Vá para: SQL Editor"
    echo "3. Execute os seguintes comandos:"
    echo ""
    echo "-- Remover políticas restritivas"
    echo "DROP POLICY IF EXISTS \"Enable read access for all users\" ON colaboradores;"
    echo "DROP POLICY IF EXISTS \"Restrict by domain\" ON colaboradores;"
    echo ""
    echo "-- Criar políticas permissivas para homologação"
    echo "CREATE POLICY \"Allow all operations\" ON colaboradores FOR ALL USING (true) WITH CHECK (true);"
    echo ""
    echo "4. Após executar, rode novamente este script para testar"
  else
    echo "❌ ERRO: $ERROR_CODE - $ERROR_MESSAGE"
  fi
else
  echo "✅ Teste de inserção bem-sucedido!"
  
  # Limpar dados de teste
  echo "🧹 Removendo dados de teste..."
  DELETE_RESULT=$(curl -s -X DELETE \
    "$HOMOLOG_URL/rest/v1/colaboradores?email=eq.teste.migracao@exemplo.com" \
    -H "apikey: $HOMOLOG_ANON_KEY" \
    -H "Authorization: Bearer $HOMOLOG_ANON_KEY" \
    -H "Prefer: return=minimal")
  
  echo "✅ Dados de teste removidos"
fi

# 📊 Status final
echo ""
echo "📊 STATUS FINAL"
echo "==============="
CURRENT_COUNT=$(curl -s \
  "$HOMOLOG_URL/rest/v1/colaboradores?select=count" \
  -H "apikey: $HOMOLOG_ANON_KEY" \
  -H "Authorization: Bearer $HOMOLOG_ANON_KEY" | \
  jq -r '.[0].count // 0')

echo "📈 Registros atuais em HOMOLOGAÇÃO: $CURRENT_COUNT"

if echo "$INSERT_RESULT" | jq -e '.code' > /dev/null 2>&1; then
  echo "⚠️ CONFIGURAÇÃO INCOMPLETA"
  echo "💡 Configure as políticas RLS manualmente no dashboard"
  echo "🔗 Dashboard: https://supabase.com/dashboard/project/$HOMOLOG_PROJECT_ID"
else
  echo "✅ CONFIGURAÇÃO CONCLUÍDA"
  echo "🎯 Pronto para migração de dados"
  echo ""
  echo "📋 Próximos passos:"
  echo "1. Execute: doppler run -- ./scripts/migrate-basic-data.sh"
  echo "2. Teste a aplicação em: http://localhost:5173/"
fi

echo ""
echo "🏁 Script finalizado!"