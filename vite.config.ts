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
    const supabaseUrl = env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const supabaseKey = env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      if (currentEnv === 'development') {
        console.warn('⚠️ Variáveis do Doppler não encontradas. Execute: doppler run -- vite');
      } else if (process.env.GITHUB_ACTIONS === 'true') {
        console.warn('⚠️ Variáveis do GitHub Actions não encontradas.');
      } else {
        throw new Error('❌ Variáveis de ambiente necessárias não encontradas.');
      }
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
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom', '@supabase/supabase-js'],
      exclude: []
    }
  };
});
