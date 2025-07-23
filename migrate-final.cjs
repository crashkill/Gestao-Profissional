#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const { execSync } = require('child_process');

// Configurações dos ambientes
const PROD_URL = 'https://pwksgdjjkryqryqrvyja.supabase.co';
const HOMOLOG_URL = 'https://zbiivgtdamejiwcabmcv.supabase.co';

async function migrateFinal() {
  console.log('🚀 Migração Final: Produção → Homologação');
  console.log('===========================================');
  
  try {
    // Obter chave de produção (anon)
    const prodAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
    
    if (!prodAnonKey) {
      throw new Error('Chave do Supabase de produção não encontrada');
    }
    
    // Obter chave de serviço de homologação
    console.log('🔑 Obtendo chave de serviço de homologação...');
    const homologServiceKey = execSync('doppler secrets get VITE_SUPABASE_SECRET --plain --config stg_homologacao', { encoding: 'utf8' }).trim();
    
    // Criar clientes
    const prodSupabase = createClient(PROD_URL, prodAnonKey);
    const homologSupabase = createClient(HOMOLOG_URL, homologServiceKey);
    
    // Obter dados de produção
    console.log('📊 Obtendo dados de produção...');
    const { data: prodData, error: prodError } = await prodSupabase
      .from('colaboradores')
      .select('*');
    
    if (prodError) {
      throw new Error(`Erro ao obter dados: ${prodError.message}`);
    }
    
    console.log(`✅ ${prodData.length} registros obtidos`);
    
    // Verificar dados atuais em homologação
    const { count: homologCount, error: countError } = await homologSupabase
      .from('colaboradores')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      throw new Error(`Erro ao contar registros: ${countError.message}`);
    }
    
    console.log(`📊 Registros atuais em homologação: ${homologCount}`);
    
    // Preparar dados para upsert (apenas campos que existem em homologação)
    const cleanData = prodData.map(item => {
      // Converter percentual_compartilhamento para número
      let percentual = 50; // Valor padrão válido
      if (item.percentual_compartilhamento) {
        percentual = parseInt(item.percentual_compartilhamento) || 50;
      }
      
      // Se não está disponível para compartilhamento, usar null
      const disponivel = item.disponivel_compartilhamento || false;
      const percentualFinal = disponivel ? percentual : null;
      
      return {
        nome_completo: item.nome_completo,
        email: item.email,
        area_atuacao: item.area_atuacao || 'Não informado',
        skill_principal: item.skill_principal || 'Não informado',
        nivel_experiencia: item.nivel_experiencia || 'Junior',
        disponivel_compartilhamento: disponivel,
        percentual_compartilhamento: percentualFinal
      };
    });
    
    console.log('📥 Fazendo upsert dos dados em homologação...');
    
    // Usar upsert em lotes para evitar duplicatas
    const batchSize = 20;
    let successCount = 0;
    
    for (let i = 0; i < cleanData.length; i += batchSize) {
      const batch = cleanData.slice(i, i + batchSize);
      
      try {
        const { data: upsertData, error: upsertError } = await homologSupabase
          .from('colaboradores')
          .upsert(batch, { 
            onConflict: 'email',
            ignoreDuplicates: false 
          })
          .select();
        
        if (upsertError) {
          console.error(`❌ Erro no lote ${Math.floor(i/batchSize) + 1}: ${upsertError.message}`);
        } else {
          successCount += upsertData.length;
          console.log(`✅ Lote ${Math.floor(i/batchSize) + 1}: ${upsertData.length} registros processados`);
        }
      } catch (error) {
        console.error(`❌ Erro no lote ${Math.floor(i/batchSize) + 1}: ${error.message}`);
      }
    }
    
    // Verificar resultado final
    const { count: finalCount } = await homologSupabase
      .from('colaboradores')
      .select('*', { count: 'exact', head: true });
    
    console.log('\n📊 Resultado da migração:');
    console.log(`📈 Registros em produção: ${prodData.length}`);
    console.log(`📈 Registros processados: ${successCount}`);
    console.log(`📈 Total em homologação: ${finalCount}`);
    
    if (finalCount >= prodData.length) {
      console.log('\n🎉 Migração concluída com sucesso!');
      console.log('\n💡 Próximos passos:');
      console.log('   • Verificar os dados no ambiente de homologação');
      console.log('   • Testar a aplicação com os dados migrados');
      console.log('   • Os dados estão prontos para uso!');
    } else {
      console.log('\n⚠️ Migração parcial - alguns registros podem não ter sido processados');
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

migrateFinal();