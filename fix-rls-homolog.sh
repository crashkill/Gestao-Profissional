#!/bin/bash

echo "🔐 Configurando RLS para homologação via psql..."

# Obter URL do banco de homologação
DB_URL=$(doppler secrets get VITE_SUPABASE_URL --config stg_homologacao --plain | sed 's|https://||' | sed 's|\.supabase\.co.*|.supabase.co|')
DB_PASSWORD=$(doppler secrets get VITE_SUPABASE_SECRET --config stg_homologacao --plain)

# Extrair informações da URL
PROJECT_REF=$(echo $DB_URL | cut -d'.' -f1)
DB_HOST="db.${PROJECT_REF}.supabase.co"
DB_NAME="postgres"
DB_USER="postgres"

echo "📊 Conectando ao banco: $DB_HOST"

# Criar arquivo SQL temporário
cat > /tmp/setup_rls.sql << EOF
-- Verificar RLS atual
\echo 'Verificando status atual do RLS...'
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'colaboradores' AND schemaname = 'public';

-- Remover políticas existentes
\echo 'Removendo políticas existentes...'
DROP POLICY IF EXISTS "Allow anonymous read access" ON colaboradores;
DROP POLICY IF EXISTS "Enable read access for all users" ON colaboradores;
DROP POLICY IF EXISTS "colaboradores_select_policy" ON colaboradores;

-- Desabilitar RLS temporariamente para permitir acesso
\echo 'Desabilitando RLS...'
ALTER TABLE colaboradores DISABLE ROW LEVEL SECURITY;

-- Verificar se funcionou
\echo 'Verificando status final...'
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'colaboradores' AND schemaname = 'public';

\echo 'RLS configurado com sucesso!'
EOF

# Executar SQL
echo "🔧 Executando configuração RLS..."
PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -p 5432 -f /tmp/setup_rls.sql

if [ $? -eq 0 ]; then
    echo "✅ RLS configurado com sucesso!"
    
    # Testar acesso
    echo "🧪 Testando acesso aos dados..."
    doppler run --config stg_homologacao -- node -e "
        const { createClient } = require('@supabase/supabase-js');
        const client = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
        client.from('colaboradores').select('id, nome_completo, email').limit(3).then(({data, error}) => {
            if(error) console.log('❌ Erro:', error.message);
            else {
                console.log('✅ Dados acessíveis:', data.length, 'registros');
                if(data.length > 0) console.log('📋 Exemplo:', data[0]);
            }
        });
    "
else
    echo "❌ Erro ao configurar RLS"
    echo "\n⚠️  SOLUÇÃO MANUAL:"
    echo "1. Acesse o painel do Supabase de homologação"
    echo "2. Vá em SQL Editor"
    echo "3. Execute: ALTER TABLE colaboradores DISABLE ROW LEVEL SECURITY;"
fi

# Limpar arquivo temporário
rm -f /tmp/setup_rls.sql

echo "🎉 Configuração concluída!"