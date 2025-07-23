import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import fs from "fs";

// Definição de tipos para variáveis de ambiente
interface EnvVars {
  [key: string]: string | undefined;
  BASE_URL?: string;
  VITE_SUPABASE_URL?: string;
  VITE_SUPABASE_ANON_KEY?: string;
  VITE_APP_NAME?: string;
  VITE_DEBUG_MODE?: string;
  VITE_LOG_LEVEL?: string;
  VITE_ENVIRONMENT?: string;
  GITHUB_ACTIONS?: string;
  npm_package_version?: string;
}

// Definição de tipos para ambientes
type Environment = 'development' | 'homologacao' | 'production';

// Definição de tipos para configuração de ambiente
interface EnvironmentConfig {
  base: string;
  proxyTarget?: string;
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Carrega as variáveis de ambiente
  const env = loadEnv(mode, process.cwd(), '') as unknown as EnvVars;
  
  // Tenta carregar variáveis de ambiente do arquivo específico do ambiente
  const loadEnvironmentFile = (environment: string): EnvVars => {
    const configMap: Record<Environment, string> = {
      'development': 'desenvolvimento.env',
      'homologacao': 'homologacao.env',
      'production': 'producao.env'
    };
    
    const configFile = configMap[environment as Environment] || 'desenvolvimento.env';
    const configPath = path.resolve(process.cwd(), 'config', configFile);
    
    if (fs.existsSync(configPath)) {
      console.log(`📄 Loading environment variables from ${configFile}`);
      // Usando fs para ler o arquivo em vez de require('dotenv')
      const fileContent = fs.readFileSync(configPath, 'utf8');
      const parsed: EnvVars = {};
      fileContent.split('\n').forEach(line => {
        const match = line.match(/^([^#][^=]+)=(.*)$/);
        if (match) {
          const key = match[1].trim();
          const value = match[2].trim();
          parsed[key] = value;
        }
      });
      return parsed;
    }
    
    console.warn(`⚠️ Environment file not found: ${configPath}`);
    return {};
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
