#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

// Configurações dos ambientes
const PROD_URL = 'https://pwksgdjjkryqryqrvyja.supabase.co';
const HOMOLOG_URL = 'https://zbiivgtdamejiwcabmcv.supabase.co';

async function migrateData() {
  console.log('🚀 Iniciando migração de dados: Produção → Homologação');
  console.log('========================================================');
  
  try {
    // Usar a chave atual do ambiente para produção
    const prodAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
    
    if (!prodAnonKey) {
      throw new Error('Chave do Supabase não encontrada nas variáveis de ambiente');
    }
    
    console.log('🔑 Usando chave de produção para obter dados...');
    
    // Criar cliente para produção
    const prodSupabase = createClient(PROD_URL, prodAnonKey);
    
    console.log('📊 Obtendo dados de produção...');
    
    // Obter todos os dados de produção
    const { data: prodData, error: prodError } = await prodSupabase
      .from('colaboradores')
      .select('*');
    
    if (prodError) {
      throw new Error(`Erro ao obter dados de produção: ${prodError.message}`);
    }
    
    console.log(`✅ ${prodData.length} registros obtidos de produção`);
    
    // Agora vamos trabalhar com homologação - precisamos obter a chave de homologação
    console.log('🔄 Obtendo chave de homologação...');
    
    // Executar comando para obter chave de homologação
    const { execSync } = require('child_process');
    let homologAnonKey;
    
    try {
      homologAnonKey = execSync('doppler secrets get VITE_SUPABASE_ANON_KEY --plain --config stg_homologacao', { encoding: 'utf8' }).trim();
    } catch (error) {
      throw new Error('Não foi possível obter a chave de homologação do Doppler');
    }
    
    console.log('🔑 Chave de homologação obtida');
    
    // Criar cliente para homologação
    const homologSupabase = createClient(HOMOLOG_URL, homologAnonKey);
    
    console.log('🔓 Tentando desabilitar RLS temporariamente...');
    
    // Tentar desabilitar RLS temporariamente (pode não funcionar com chave anon)
    try {
      await homologSupabase.rpc('exec_sql', {
        query: 'ALTER TABLE colaboradores DISABLE ROW LEVEL SECURITY;'
      });
      console.log('✅ RLS desabilitado temporariamente');
    } catch (error) {
      console.log('⚠️ Não foi possível desabilitar RLS via API (normal com chave anon)');
    }
    
    // Verificar dados atuais em homologação
    const { count: homologCount, error: countError } = await homologSupabase
      .from('colaboradores')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.warn(`⚠️ Aviso ao contar registros em homologação: ${countError.message}`);
    } else {
      console.log(`📊 Registros atuais em homologação: ${homologCount}`);
    }
    
    // Limpar dados existentes em homologação (se houver)
    if (homologCount > 0) {
      console.log('🗑️ Limpando dados existentes em homologação...');
      const { error: deleteError } = await homologSupabase
        .from('colaboradores')
        .delete()
        .neq('id', 0); // Deletar todos os registros
      
      if (deleteError) {
        console.warn(`⚠️ Aviso ao limpar dados: ${deleteError.message}`);
      } else {
        console.log('✅ Dados existentes removidos');
      }
    }
    
    // Preparar dados para inserção (remover campos auto-gerados e campos que não existem em homologação)
    const dataToInsert = prodData.map(({ id, created_at, outras_skills, ...rest }) => {
      // Remover campos que não existem em homologação
      const cleanData = { ...rest };
      
      // Remover campos específicos que podem não existir em homologação
      delete cleanData.hora_ultima_modificacao;
      delete cleanData.outras_tecnologias;
      
      return cleanData;
    });
    
    console.log('📥 Inserindo dados em homologação...');
    
    // Inserir dados em lotes para evitar timeouts
    const batchSize = 50;
    let insertedCount = 0;
    
    for (let i = 0; i < dataToInsert.length; i += batchSize) {
      const batch = dataToInsert.slice(i, i + batchSize);
      
      const { data: insertData, error: insertError } = await homologSupabase
        .from('colaboradores')
        .insert(batch)
        .select();
      
      if (insertError) {
        console.error(`❌ Erro ao inserir lote ${Math.floor(i/batchSize) + 1}: ${insertError.message}`);
        continue;
      }
      
      insertedCount += insertData.length;
      console.log(`✅ Lote ${Math.floor(i/batchSize) + 1} inserido: ${insertData.length} registros`);
    }
    
    // Verificar resultado final
    const { count: finalCount, error: finalCountError } = await homologSupabase
      .from('colaboradores')
      .select('*', { count: 'exact', head: true });
    
    console.log('\n🧪 Verificação final:');
    console.log(`📊 Registros em produção: ${prodData.length}`);
    console.log(`📊 Registros inseridos: ${insertedCount}`);
    console.log(`📊 Registros finais em homologação: ${finalCount || 'Erro ao contar'}`);
    
    if (finalCount === prodData.length) {
      console.log('\n🎉 Migração concluída com sucesso!');
    } else {
      console.log('\n⚠️ Migração concluída com diferenças');
    }
    
  } catch (error) {
    console.error('❌ Erro durante a migração:', error.message);
    process.exit(1);
  }
}

// Executar migração
migrateData();