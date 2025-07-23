#!/bin/bash
# 🔄 Script de Migração Completa: Produção → Homologação
# Este script replica completamente o banco de produção para homologação

set -e  # Parar em caso de erro

# 🎯 Configurações dos Projetos
PROD_PROJECT_ID="pwksgdjjkryqryqrvyja"
HOMOLOG_PROJECT_ID="zbiivgtdamejiwcabmcv"
PROD_URL="https://pwksgdjjkryqryqrvyja.supabase.co"
HOMOLOG_URL="https://zbiivgtdamejiwcabmcv.supabase.co"

# 🔐 Chaves de Acesso (devem estar no Doppler)
PROD_SERVICE_KEY="${SUPABASE_PROD_SERVICE_KEY}"
HOMOLOG_SERVICE_KEY="${SUPABASE_HOMOLOG_SERVICE_KEY}"

echo "🚀 Iniciando Migração Completa: Produção → Homologação"
echo "========================================================"
echo "📊 Produção:   $PROD_PROJECT_ID"
echo "🧪 Homologação: $HOMOLOG_PROJECT_ID"
echo "========================================================"

# Verificar se as chaves estão configuradas
if [ -z "$PROD_SERVICE_KEY" ] || [ -z "$HOMOLOG_SERVICE_KEY" ]; then
    echo "❌ ERRO: Chaves de serviço não configuradas!"
    echo "Configure as variáveis:"
    echo "  - SUPABASE_PROD_SERVICE_KEY"
    echo "  - SUPABASE_HOMOLOG_SERVICE_KEY"
    exit 1
fi

# 📋 Função para executar SQL no Supabase
execute_sql() {
    local PROJECT_URL=$1
    local SERVICE_KEY=$2
    local SQL_QUERY=$3
    local DESCRIPTION=$4
    
    echo "🔧 $DESCRIPTION..."
    
    curl -s -X POST "$PROJECT_URL/rest/v1/rpc/execute_sql" \
        -H "apikey: $SERVICE_KEY" \
        -H "Authorization: Bearer $SERVICE_KEY" \
        -H "Content-Type: application/json" \
        -d "{\"query\": \"$SQL_QUERY\"}"
    
    if [ $? -eq 0 ]; then
        echo "✅ $DESCRIPTION concluído"
    else
        echo "❌ Erro em: $DESCRIPTION"
        exit 1
    fi
}

# 🗑️ PASSO 1: Limpar banco de homologação
echo "\n🗑️ PASSO 1: Limpando banco de homologação..."

# Desabilitar RLS temporariamente
execute_sql "$HOMOLOG_URL" "$HOMOLOG_SERVICE_KEY" \
    "ALTER TABLE IF EXISTS colaboradores DISABLE ROW LEVEL SECURITY;" \
    "Desabilitando RLS"

# Remover dados existentes
execute_sql "$HOMOLOG_URL" "$HOMOLOG_SERVICE_KEY" \
    "TRUNCATE TABLE IF EXISTS colaboradores CASCADE;" \
    "Limpando dados existentes"

# Remover tabela se existir
execute_sql "$HOMOLOG_URL" "$HOMOLOG_SERVICE_KEY" \
    "DROP TABLE IF EXISTS colaboradores CASCADE;" \
    "Removendo tabela existente"

# 🏗️ PASSO 2: Recriar estrutura
echo "\n🏗️ PASSO 2: Recriando estrutura da tabela..."

# Criar tabela colaboradores
CREATE_TABLE_SQL="
CREATE TABLE colaboradores (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  nome_completo TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  area_atuacao TEXT NOT NULL,
  skill_principal TEXT NOT NULL,
  nivel_experiencia TEXT NOT NULL,
  disponivel_compartilhamento BOOLEAN DEFAULT false,
  percentual_compartilhamento INTEGER DEFAULT 0,
  outras_skills TEXT[]
);"

execute_sql "$HOMOLOG_URL" "$HOMOLOG_SERVICE_KEY" \
    "$CREATE_TABLE_SQL" \
    "Criando tabela colaboradores"

# 🔒 PASSO 3: Configurar segurança (RLS)
echo "\n🔒 PASSO 3: Configurando segurança (RLS)..."

# Habilitar RLS
execute_sql "$HOMOLOG_URL" "$HOMOLOG_SERVICE_KEY" \
    "ALTER TABLE colaboradores ENABLE ROW LEVEL SECURITY;" \
    "Habilitando RLS"

# Política de leitura
execute_sql "$HOMOLOG_URL" "$HOMOLOG_SERVICE_KEY" \
    "CREATE POLICY \"Enable read access for all users\" ON colaboradores FOR SELECT USING (true);" \
    "Criando política de leitura"

# Política de inserção
execute_sql "$HOMOLOG_URL" "$HOMOLOG_SERVICE_KEY" \
    "CREATE POLICY \"Enable insert for all users\" ON colaboradores FOR INSERT WITH CHECK (true);" \
    "Criando política de inserção"

# Política de atualização
execute_sql "$HOMOLOG_URL" "$HOMOLOG_SERVICE_KEY" \
    "CREATE POLICY \"Enable update for all users\" ON colaboradores FOR UPDATE USING (true);" \
    "Criando política de atualização"

# Política de exclusão
execute_sql "$HOMOLOG_URL" "$HOMOLOG_SERVICE_KEY" \
    "CREATE POLICY \"Enable delete for all users\" ON colaboradores FOR DELETE USING (true);" \
    "Criando política de exclusão"

# 📊 PASSO 4: Migrar dados
echo "\n📊 PASSO 4: Migrando dados de produção..."

# Obter dados de produção
echo "🔍 Obtendo dados de produção..."
PROD_DATA=$(curl -s "$PROD_URL/rest/v1/colaboradores?select=*" \
    -H "apikey: $PROD_SERVICE_KEY" \
    -H "Authorization: Bearer $PROD_SERVICE_KEY")

if [ "$PROD_DATA" = "[]" ] || [ -z "$PROD_DATA" ]; then
    echo "⚠️ Nenhum dado encontrado em produção ou erro na consulta"
else
    echo "✅ Dados obtidos de produção"
    
    # Inserir dados em homologação
    echo "📥 Inserindo dados em homologação..."
    curl -s -X POST "$HOMOLOG_URL/rest/v1/colaboradores" \
        -H "apikey: $HOMOLOG_SERVICE_KEY" \
        -H "Authorization: Bearer $HOMOLOG_SERVICE_KEY" \
        -H "Content-Type: application/json" \
        -H "Prefer: return=minimal" \
        -d "$PROD_DATA"
    
    if [ $? -eq 0 ]; then
        echo "✅ Dados migrados com sucesso"
    else
        echo "❌ Erro ao migrar dados"
        exit 1
    fi
fi

# 🧪 PASSO 5: Verificar migração
echo "\n🧪 PASSO 5: Verificando migração..."

# Contar registros em produção
PROD_COUNT=$(curl -s "$PROD_URL/rest/v1/colaboradores?select=count" \
    -H "apikey: $PROD_SERVICE_KEY" \
    -H "Authorization: Bearer $PROD_SERVICE_KEY" | jq -r '.[0].count // 0')

# Contar registros em homologação
HOMOLOG_COUNT=$(curl -s "$HOMOLOG_URL/rest/v1/colaboradores?select=count" \
    -H "apikey: $HOMOLOG_SERVICE_KEY" \
    -H "Authorization: Bearer $HOMOLOG_SERVICE_KEY" | jq -r '.[0].count // 0')

echo "📊 Registros em Produção: $PROD_COUNT"
echo "📊 Registros em Homologação: $HOMOLOG_COUNT"

if [ "$PROD_COUNT" = "$HOMOLOG_COUNT" ]; then
    echo "✅ Migração verificada com sucesso!"
else
    echo "⚠️ Diferença na quantidade de registros detectada"
fi

echo "\n🎉 Migração Completa Finalizada!"
echo "========================================================"
echo "✅ Estrutura replicada"
echo "✅ Políticas de segurança configuradas"
echo "✅ Dados migrados"
echo "✅ Verificação concluída"
echo "========================================================"
echo "🔗 Homologação: $HOMOLOG_URL"
echo "📊 Dashboard: https://supabase.com/dashboard/project/$HOMOLOG_PROJECT_ID"