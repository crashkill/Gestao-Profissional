import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import componentTagger from 'lovable-tagger';

// Tipos para as variáveis de ambiente
interface EnvVars {
  VITE_SUPABASE_URL?: string;
  VITE_SUPABASE_ANON_KEY?: string;
  VITE_SUPABASE_SERVICE_ROLE_KEY?: string;
  VITE_APP_NAME?: string;
  VITE_DEBUG_MODE?: string;
  VITE_LOG_LEVEL?: string;
  BASE_URL?: string;
  npm_package_version?: string;
  GITHUB_ACTIONS?: string;
}

// Tipos para os ambientes
type Environment = 'development' | 'homologacao' | 'production';

// Configuração por ambiente
interface EnvironmentConfig {
  base: string;
  proxyTarget?: string;
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Carrega variáveis de ambiente do arquivo .env
  const env = loadEnv(mode, process.cwd(), '');

  // Função para carregar arquivo de ambiente específico
  const loadEnvironmentFile = (environment: Environment): EnvVars => {
    const envFiles = [
      `.env.${environment}.local`,
      `.env.${environment}`,
      '.env.local',
      '.env'
    ];

    let envVars: EnvVars = {};

    for (const file of envFiles) {
      const filePath = path.resolve(process.cwd(), file);
      if (fs.existsSync(filePath)) {
        try {
          const content = fs.readFileSync(filePath, 'utf-8');
          const lines = content.split('\n');
          
          for (const line of lines) {
            const trimmedLine = line.trim();
            if (trimmedLine && !trimmedLine.startsWith('#')) {
              const [key, ...valueParts] = trimmedLine.split('=');
              if (key && valueParts.length > 0) {
                const value = valueParts.join('=').replace(/^["']|["']$/g, '');
                envVars[key as keyof EnvVars] = value;
              }
            }
          }
        } catch (error) {
          console.warn(`Erro ao carregar arquivo ${file}:`, error);
        }
      }
    }

    return envVars;
  };

  // Validação do ambiente atual
  const validateEnvironment = (mode: string): Environment => {
    if (mode === 'production') {
      return 'production';
    } else if (mode === 'homologacao') {
      return 'homologacao';
    }
    return 'development';
  };

  // Detecta o ambiente atual
  const currentEnv: Environment = validateEnvironment(mode);
  
  // Carrega variáveis do arquivo de ambiente específico
  const envFile = loadEnvironmentFile(currentEnv);

  // Mescla variáveis de ambiente (prioridade: .env.local > arquivo específico > process.env)
  const mergedEnv: EnvVars = {
    ...(process.env as unknown as EnvVars),
    ...envFile,
    ...env
  };
  
  // Configuração de ambientes
  const environmentConfig: Record<Environment, EnvironmentConfig> = {
    development: {
      base: mergedEnv.BASE_URL || '/',
      proxyTarget: mergedEnv.VITE_SUPABASE_URL,
    },
    homologacao: {
      base: mergedEnv.BASE_URL || '/gestao-profissional-homologacao/',
      proxyTarget: mergedEnv.VITE_SUPABASE_URL,
    },
    production: {
      base: mergedEnv.BASE_URL || '/gestao-profissional/',
      proxyTarget: mergedEnv.VITE_SUPABASE_URL,
    }
  };

  // Obtém a configuração para o ambiente atual
  const config = environmentConfig[currentEnv];
  const isProduction = currentEnv === 'production';

  // Configurações de build
  const buildConfig = {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: currentEnv === 'development',
    manifest: true,
    cssCodeSplit: true,
    modulePreload: {
      polyfill: true
    },
    ...(isProduction && {
      minify: 'terser' as const,
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
          pure_funcs: ['console.log', 'console.debug', 'console.info'],
        },
        format: {
          comments: false,
        },
      },
      rollupOptions: {
        output: {
          manualChunks: {
            react: ['react', 'react-dom', 'react-router-dom'],
            ui: [
              '@radix-ui/react-dialog',
              '@radix-ui/react-dropdown-menu',
              '@radix-ui/react-accordion',
              '@radix-ui/react-alert-dialog',
              '@radix-ui/react-aspect-ratio',
              '@radix-ui/react-avatar',
              '@radix-ui/react-checkbox',
              '@radix-ui/react-collapsible',
              '@radix-ui/react-context-menu',
              '@radix-ui/react-hover-card',
              '@radix-ui/react-label',
              '@radix-ui/react-menubar',
              '@radix-ui/react-navigation-menu',
              '@radix-ui/react-popover',
              '@radix-ui/react-progress',
              '@radix-ui/react-radio-group',
              '@radix-ui/react-scroll-area',
              '@radix-ui/react-select',
              '@radix-ui/react-separator',
              '@radix-ui/react-slider',
              '@radix-ui/react-switch',
              '@radix-ui/react-tabs',
              '@radix-ui/react-toast',
              '@radix-ui/react-toggle',
              '@radix-ui/react-toggle-group',
              '@radix-ui/react-tooltip'
            ],
            supabase: ['@supabase/supabase-js'],
            utils: ['@tanstack/react-query', 'framer-motion', 'date-fns', 'recharts'],
            three: ['three', '@react-three/fiber', '@react-three/drei']
          },
          chunkFileNames: (chunkInfo) => {
            const name = chunkInfo.name;
            return `assets/js/${name}-[hash].js`;
          },
          entryFileNames: 'assets/js/[name]-[hash].js',
          assetFileNames: (assetInfo) => {
            const extType = assetInfo.name.split('.').at(1);
            if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
              return 'assets/images/[name]-[hash][extname]';
            }
            if (/css/i.test(extType)) {
              return 'assets/css/[name]-[hash][extname]';
            }
            return 'assets/[name]-[hash][extname]';
          }
        },
      }
    })
  };

  // Validação das variáveis de ambiente
  const validateEnvVars = () => {
    const supabaseUrl = mergedEnv.VITE_SUPABASE_URL;
    const supabaseKey = mergedEnv.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      if (currentEnv === 'development') {
        console.warn('⚠️ Variáveis do Doppler não encontradas. Execute: doppler run -- vite');
        console.warn('⚠️ Ou configure o ambiente: npm run env:dev');
      } else if (mergedEnv.GITHUB_ACTIONS === 'true') {
        console.warn('⚠️ Variáveis do GitHub Actions não encontradas.');
      } else {
        console.error('❌ Variáveis de ambiente necessárias não encontradas:');
        console.error('   - VITE_SUPABASE_URL: ' + (supabaseUrl ? '✅' : '❌'));
        console.error('   - VITE_SUPABASE_ANON_KEY: ' + (supabaseKey ? '✅' : '❌'));
        
        if (currentEnv !== 'development') {
          throw new Error('❌ Variáveis de ambiente necessárias não encontradas.');
        }
      }
    } else {
      console.log(`✅ Variáveis de ambiente carregadas para ambiente: ${currentEnv}`);
    }
  };

  // Valida as variáveis de ambiente
  validateEnvVars();

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
          ws: true,
          configure: (proxy, _options) => {
            proxy.on('error', (err, _req, _res) => {
              console.error('Proxy error:', err);
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
      currentEnv === 'development' ? componentTagger() : false,
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    define: {
      __ENVIRONMENT__: JSON.stringify(currentEnv),
      __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
      'process.env.VITE_APP_VERSION': JSON.stringify(mergedEnv.npm_package_version),
      'process.env.VITE_ENVIRONMENT': JSON.stringify(currentEnv),
      'process.env.VITE_SUPABASE_URL': JSON.stringify(mergedEnv.VITE_SUPABASE_URL),
      'process.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(mergedEnv.VITE_SUPABASE_ANON_KEY),
      'process.env.VITE_APP_NAME': JSON.stringify(mergedEnv.VITE_APP_NAME),
      'process.env.VITE_DEBUG_MODE': JSON.stringify(mergedEnv.VITE_DEBUG_MODE),
      'process.env.VITE_LOG_LEVEL': JSON.stringify(mergedEnv.VITE_LOG_LEVEL),
      'process.env.BASE_URL': JSON.stringify(mergedEnv.BASE_URL || config.base),
    },
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom', '@supabase/supabase-js'],
      exclude: []
    }
  };
});