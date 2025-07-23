const { createClient } = require('@supabase/supabase-js');
const { execSync } = require('child_process');

async function disableRLS() {
  console.log('🔐 Desabilitando RLS para homologação...');
  
  try {
    // Obter credenciais de homologação
    const serviceKey = execSync('doppler secrets get VITE_SUPABASE_SECRET --config stg_homologacao --plain', { encoding: 'utf8' }).trim();
    const supabaseUrl = execSync('doppler secrets get VITE_SUPABASE_URL --config stg_homologacao --plain', { encoding: 'utf8' }).trim();
    
    console.log('📊 URL:', supabaseUrl);
    console.log('🔑 Service Key:', serviceKey.substring(0, 20) + '...');
    
    const supabase = createClient(supabaseUrl, serviceKey);
    
    console.log('🔧 Tentando desabilitar RLS via SQL...');
    
    // Tentar executar SQL diretamente
    const { data, error } = await supabase
      .from('colaboradores')
      .select('count', { count: 'exact', head: true });
    
    if (error) {
      console.log('❌ Erro ao acessar tabela:', error.message);
    } else {
      console.log('✅ Tabela acessível com service key. Total de registros:', data);
    }
    
    // Testar com chave anônima
    console.log('🧪 Testando acesso com chave anônima...');
    
    const anonKey = execSync('doppler secrets get VITE_SUPABASE_ANON_KEY --config stg_homologacao --plain', { encoding: 'utf8' }).trim();
    const anonClient = createClient(supabaseUrl, anonKey);
    
    const { data: anonData, error: anonError } = await anonClient
      .from('colaboradores')
      .select('id, nome_completo, email')
      .limit(1);
    
    if (anonError) {
      console.log('❌ Chave anônima não consegue acessar:', anonError.message);
      console.log('\n🔧 SOLUÇÕES POSSÍVEIS:');
      console.log('1. Acesse o painel do Supabase: https://supabase.com/dashboard');
      console.log('2. Vá para o projeto de homologação');
      console.log('3. Navegue até: Authentication > Policies');
      console.log('4. Para a tabela "colaboradores":');
      console.log('   - Clique em "Disable RLS" OU');
      console.log('   - Crie uma nova política:');
      console.log('     * Nome: "Allow public read"');
      console.log('     * Operação: SELECT');
      console.log('     * Target roles: anon, authenticated');
      console.log('     * USING expression: true');
      console.log('\n5. Alternativamente, execute no SQL Editor:');
      console.log('   ALTER TABLE colaboradores DISABLE ROW LEVEL SECURITY;');
    } else {
      console.log('✅ Chave anônima funcionando!');
      console.log('📊 Dados acessíveis:', anonData.length);
      if (anonData.length > 0) {
        console.log('📋 Exemplo:', anonData[0]);
      }
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

disableRLS();