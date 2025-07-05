import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Carrega as variáveis de ambiente
  const env = loadEnv(mode, process.cwd(), '');
  
  // Validação do ambiente atual
  const validateEnvironment = (mode: string): 'development' | 'homologacao' | 'production' => {
    if (mode === 'production') {
      return 'production';
    } else if (mode === 'homologacao') {
      return 'homologacao';
    }
    return 'development';
  };

  // Configuração de ambientes
  const environmentConfig = {
    development: {
      base: '/',
      proxyTarget: env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL,
    },
    homologacao: {
      base: '/Gestao-Profissional-Homolog/',
      proxyTarget: env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL,
    },
    production: {
      base: '/gestao-profissional/',
      proxyTarget: env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL,
    }
  };

  // Detecta o ambiente atual
  const currentEnv = validateEnvironment(mode);
  const config = environmentConfig[currentEnv];
  const isProduction = currentEnv === 'production';
  
  // Logs para debug
  console.log('🔧 Configuração do Ambiente:');
  console.log(`📌 Modo: ${mode}`);
  console.log(`📌 Ambiente: ${currentEnv}`);
  console.log(`📁 Base URL: ${config.base}`);
  console.log(`🔗 Proxy Target: ${config.proxyTarget}`);
  console.log(`🔑 Supabase URL: ${env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL}`);

  // Configurações de build
  const buildConfig = {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: currentEnv === 'development',
    ...(isProduction && {
      minify: 'terser' as const,
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
        },
      },
      rollupOptions: {
        output: {
          manualChunks: {
            react: ['react', 'react-dom', 'react-router-dom'],
            ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          },
        },
      }
    })
  };

  // Validação das variáveis de ambiente
  const validateEnvVars = () => {
    const supabaseUrl = env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const supabaseKey = env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      if (currentEnv === 'development') {
        console.warn('⚠️ Variáveis do Doppler não encontradas. Execute: doppler run -- vite');
        console.warn('⚠️ Usando valores padrão para desenvolvimento...');
      } else if (process.env.GITHUB_ACTIONS === 'true') {
        console.warn('⚠️ Variáveis do GitHub Actions não encontradas.');
        console.warn('⚠️ Continuando build para GitHub Pages...');
      } else {
        console.error('❌ Variáveis de ambiente necessárias não encontradas.');
        process.exit(1);
      }
    }
  };

  // Valida as variáveis de ambiente (só falha em desenvolvimento local)
  if (currentEnv === 'development' && !process.env.GITHUB_ACTIONS) {
    validateEnvVars();
  }

  return {
    base: config.base,
    build: buildConfig,
    server: {
      host: "::",
      port: 5173,
      proxy: {
        '/rest': {
          target: config.proxyTarget,
          changeOrigin: true,
          secure: true,
          configure: (proxy, _options) => {
            proxy.on('proxyReq', (proxyReq, req, _res) => {
              console.log(`🌐 Proxy request (${currentEnv}): ${req.method} ${req.url}`);
            });
          },
        },
      },
    },
    preview: {
      port: 4173,
      host: true,
    },
    plugins: [
      react(),
      currentEnv === 'development' && componentTagger(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    define: {
      __ENVIRONMENT__: JSON.stringify(currentEnv),
      __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
      'process.env.VITE_APP_VERSION': JSON.stringify(process.env.npm_package_version),
      'process.env.VITE_ENVIRONMENT': JSON.stringify(currentEnv),
      'process.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL),
      'process.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY),
    },
  };
});
