import { createClient } from '@supabase/supabase-js';
import { envConfig } from './envConfig';

const { supabaseUrl, supabaseAnonKey, environment, debugMode } = envConfig;

// Debug: Log das variáveis (apenas em desenvolvimento)
if (debugMode) {
  console.log('🔍 Supabase Debug:', {
    url: supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : 'MISSING',
    key: supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'MISSING',
    environment: environment,
    appName: envConfig.appName
  });
  
  // Identifica qual ambiente está sendo usado
  if (supabaseUrl?.includes('zbiivgtdamejiwcabmcv')) {
    console.log('🧪 Usando banco de HOMOLOGAÇÃO');
  } else if (supabaseUrl?.includes('pwksgdjjkryqryqrvyja')) {
    console.log('🚀 Usando banco de PRODUÇÃO');
  }
}

// Validar se a URL é válida
if (supabaseUrl) {
  try {
    new URL(supabaseUrl);
  } catch {
    const error = `❌ Invalid Supabase URL format: ${supabaseUrl}`;
    console.error(error);
    throw new Error(error);
  }
}

// Cliente principal do Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: localStorage,
    autoRefreshToken: true,
    persistSession: false // Para aplicação sem autenticação de usuário
  }
});

// Cliente alternativo direto (sem proxy) para fallback
export const supabaseDirect = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false
  }
});

// Função helper para tentar ambas as conexões
export const executeSupabaseQuery = async <T>(queryFn: (client: any) => Promise<T>): Promise<T> => {
  try {
    console.log('🔍 Tentando conexão via proxy...');
    const result = await queryFn(supabase);
    console.log('✅ Conexão via proxy bem-sucedida');
    return result;
  } catch (proxyError) {
    console.log('⚠️ Proxy falhou, tentando conexão direta...', proxyError);
    try {
      const result = await queryFn(supabaseDirect);
      console.log('✅ Conexão direta bem-sucedida');
      return result;
    } catch (directError) {
      console.error('❌ Ambas as conexões falharam:', { proxyError, directError });
      throw directError;
    }
  }
}; 