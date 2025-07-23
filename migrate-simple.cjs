#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const { execSync } = require('child_process');

// Configurações dos ambientes
const PROD_URL = 'https://pwksgdjjkryqryqrvyja.supabase.co';
const HOMOLOG_URL = 'https://zbiivgtdamejiwcabmcv.supabase.co';

async function migrateDataSimple() {
  console.log('🚀 Migração Simplificada: Produção → Homologação');
  console.log('================================================');
  
  try {
    // Obter chave de produção
    const prodAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
    
    if (!prodAnonKey) {
      throw new Error('Chave do Supabase não encontrada');
    }
    
    // Obter chave de homologação
    console.log('🔑 Obtendo chave de homologação...');
    const homologAnonKey = execSync('doppler secrets get VITE_SUPABASE_ANON_KEY --plain --config stg_homologacao', { encoding: 'utf8' }).trim();
    
    // Criar clientes
    const prodSupabase = createClient(PROD_URL, prodAnonKey);
    const homologSupabase = createClient(HOMOLOG_URL, homologAnonKey);
    
    // Obter dados de produção
    console.log('📊 Obtendo dados de produção...');
    const { data: prodData, error: prodError } = await prodSupabase
      .from('colaboradores')
      .select('*');
    
    if (prodError) {
      throw new Error(`Erro ao obter dados: ${prodError.message}`);
    }
    
    console.log(`✅ ${prodData.length} registros obtidos`);
    
    // Preparar dados básicos (apenas campos essenciais)
    const basicData = prodData.map(item => ({
      nome_completo: item.nome_completo,
      email: item.email,
      area_atuacao: item.area_atuacao || 'Não informado',
      skill_principal: item.skill_principal || 'Não informado',
      nivel_experiencia: item.nivel_experiencia || 'Junior',
      disponivel_compartilhamento: item.disponivel_compartilhamento || false,
      percentual_compartilhamento: item.percentual_compartilhamento || 0
    }));
    
    console.log('📥 Inserindo dados básicos em homologação...');
    
    // Inserir em lotes pequenos
    const batchSize = 10;
    let successCount = 0;
    
    for (let i = 0; i < basicData.length; i += batchSize) {
      const batch = basicData.slice(i, i + batchSize);
      
      try {
        const { data: insertData, error: insertError } = await homologSupabase
          .from('colaboradores')
          .upsert(batch, { 
            onConflict: 'email',
            ignoreDuplicates: false 
          })
          .select();
        
        if (insertError) {
          console.error(`❌ Erro no lote ${Math.floor(i/batchSize) + 1}: ${insertError.message}`);
        } else {
          successCount += insertData.length;
          console.log(`✅ Lote ${Math.floor(i/batchSize) + 1}: ${insertData.length} registros`);
        }
      } catch (error) {
        console.error(`❌ Erro no lote ${Math.floor(i/batchSize) + 1}: ${error.message}`);
      }
    }
    
    // Verificar resultado
    const { count: finalCount } = await homologSupabase
      .from('colaboradores')
      .select('*', { count: 'exact', head: true });
    
    console.log('\n📊 Resultado da migração:');
    console.log(`📈 Registros em produção: ${prodData.length}`);
    console.log(`📈 Registros inseridos: ${successCount}`);
    console.log(`📈 Total em homologação: ${finalCount}`);
    
    if (finalCount > 0) {
      console.log('\n🎉 Migração concluída com sucesso!');
    } else {
      console.log('\n⚠️ Nenhum registro foi inserido');
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

migrateDataSimple();