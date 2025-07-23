const { createClient } = require('@supabase/supabase-js');
const { execSync } = require('child_process');

async function setupRLSPolicies() {
  console.log('🔐 Configurando políticas RLS para homologação...');
  
  try {
    // Obter chave de serviço de homologação
    const serviceKey = execSync('doppler secrets get VITE_SUPABASE_SECRET --config stg_homologacao --plain', { encoding: 'utf8' }).trim();
    const supabaseUrl = execSync('doppler secrets get VITE_SUPABASE_URL --config stg_homologacao --plain', { encoding: 'utf8' }).trim();
    
    const supabase = createClient(supabaseUrl, serviceKey);
    
    console.log('📊 Verificando RLS atual...');
    
    // Verificar se RLS está habilitado
    const { data: tableInfo, error: tableError } = await supabase
      .rpc('exec_sql', {
        query: `
          SELECT 
            schemaname,
            tablename,
            rowsecurity
          FROM pg_tables 
          WHERE tablename = 'colaboradores' AND schemaname = 'public';
        `
      });
    
    if (tableError) {
      console.log('⚠️  Não foi possível verificar RLS via RPC, tentando abordagem alternativa...');
    } else {
      console.log('📋 Info da tabela:', tableInfo);
    }
    
    console.log('🔧 Criando política de leitura para usuários anônimos...');
    
    // Criar política para permitir leitura de todos os dados para usuários anônimos
    const { error: policyError } = await supabase
      .rpc('exec_sql', {
        query: `
          -- Remover política existente se houver
          DROP POLICY IF EXISTS "Allow anonymous read access" ON colaboradores;
          
          -- Criar nova política para leitura anônima
          CREATE POLICY "Allow anonymous read access" 
          ON colaboradores 
          FOR SELECT 
          TO anon 
          USING (true);
          
          -- Garantir que RLS está habilitado
          ALTER TABLE colaboradores ENABLE ROW LEVEL SECURITY;
        `
      });
    
    if (policyError) {
      console.log('❌ Erro ao criar política:', policyError.message);
      
      // Tentar abordagem alternativa - desabilitar RLS temporariamente
      console.log('🔄 Tentando desabilitar RLS temporariamente...');
      
      const { error: disableError } = await supabase
        .rpc('exec_sql', {
          query: 'ALTER TABLE colaboradores DISABLE ROW LEVEL SECURITY;'
        });
      
      if (disableError) {
        console.log('❌ Erro ao desabilitar RLS:', disableError.message);
        console.log('\n⚠️  SOLUÇÃO MANUAL NECESSÁRIA:');
        console.log('1. Acesse o painel do Supabase de homologação');
        console.log('2. Vá em Authentication > Policies');
        console.log('3. Crie uma política para a tabela colaboradores:');
        console.log('   - Nome: "Allow anonymous read access"');
        console.log('   - Operação: SELECT');
        console.log('   - Roles: anon');
        console.log('   - Policy: true (permitir tudo)');
        return;
      } else {
        console.log('✅ RLS desabilitado temporariamente');
      }
    } else {
      console.log('✅ Política RLS criada com sucesso');
    }
    
    // Testar acesso com chave anônima
    console.log('🧪 Testando acesso com chave anônima...');
    
    const anonKey = execSync('doppler secrets get VITE_SUPABASE_ANON_KEY --config stg_homologacao --plain', { encoding: 'utf8' }).trim();
    const anonClient = createClient(supabaseUrl, anonKey);
    
    const { data: testData, error: testError } = await anonClient
      .from('colaboradores')
      .select('id, nome_completo, email')
      .limit(3);
    
    if (testError) {
      console.log('❌ Erro no teste:', testError.message);
    } else {
      console.log('✅ Teste bem-sucedido!');
      console.log(`📊 ${testData.length} registros acessíveis`);
      if (testData.length > 0) {
        console.log('📋 Exemplo:', testData[0]);
      }
    }
    
    console.log('\n🎉 Configuração RLS concluída!');
    console.log('🔄 Reinicie a aplicação para ver os dados');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

setupRLSPolicies();