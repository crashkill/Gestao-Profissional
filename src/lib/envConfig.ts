/**
 * Environment Configuration System
 * 
 * This module provides a centralized way to load and access environment variables
 * based on the current environment (development, homologacao, production).
 */

// Types for environment configuration
export interface EnvironmentConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  environment: 'development' | 'homologacao' | 'production';
  appName: string;
  appVersion: string;
  debugMode: boolean;
  logLevel: string;
  baseUrl: string;
  buildTarget: string;
  features: {
    aiChat: boolean;
    excelImport: boolean;
    manualForm: boolean;
  };
}

// Default configuration values
const defaultConfig: EnvironmentConfig = {
  supabaseUrl: '',
  supabaseAnonKey: '',
  environment: 'development',
  appName: 'Talent Sphere Registry',
  appVersion: '1.0.0',
  debugMode: false,
  logLevel: 'info',
  baseUrl: '/',
  buildTarget: 'development',
  features: {
    aiChat: true,
    excelImport: true,
    manualForm: true,
  }
};

/**
 * Detects the current environment based on VITE_ENVIRONMENT or MODE
 */
export function detectEnvironment(): 'development' | 'homologacao' | 'production' {
  const envVar = import.meta.env.VITE_ENVIRONMENT || import.meta.env.MODE;
  
  if (envVar === 'production') {
    return 'production';
  } else if (envVar === 'homologacao' || envVar === 'staging') {
    return 'homologacao';
  }
  
  return 'development';
}

/**
 * Loads environment configuration based on the current environment
 */
export function loadEnvironmentConfig(): EnvironmentConfig {
  const environment = detectEnvironment();
  
  // Base configuration from environment variables
  const config: EnvironmentConfig = {
    ...defaultConfig,
    environment,
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL || '',
    supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
    appName: import.meta.env.VITE_APP_NAME || defaultConfig.appName,
    appVersion: import.meta.env.VITE_APP_VERSION || defaultConfig.appVersion,
    debugMode: import.meta.env.VITE_DEBUG_MODE === 'true',
    logLevel: import.meta.env.VITE_LOG_LEVEL || defaultConfig.logLevel,
    baseUrl: import.meta.env.BASE_URL || '/',
    buildTarget: import.meta.env.VITE_BUILD_TARGET || environment,
    features: {
      aiChat: import.meta.env.VITE_FEATURE_AI_CHAT !== 'false',
      excelImport: import.meta.env.VITE_FEATURE_EXCEL_IMPORT !== 'false',
      manualForm: import.meta.env.VITE_FEATURE_MANUAL_FORM !== 'false',
    }
  };

  // Environment-specific overrides
  switch (environment) {
    case 'production':
      config.debugMode = false;
      config.logLevel = 'error';
      config.baseUrl = '/gestao-profissional/';
      break;
    case 'homologacao':
      config.appName = `${config.appName} [HML]`;
      config.baseUrl = '/gestao-profissional-homologacao/';
      break;
    case 'development':
      config.debugMode = true;
      config.logLevel = 'debug';
      break;
  }

  // Validate required configuration
  validateConfig(config);

  return config;
}

/**
 * Validates that required configuration values are present
 */
function validateConfig(config: EnvironmentConfig): void {
  const missingVars: string[] = [];

  if (!config.supabaseUrl) missingVars.push('VITE_SUPABASE_URL');
  if (!config.supabaseAnonKey) missingVars.push('VITE_SUPABASE_ANON_KEY');

  if (missingVars.length > 0) {
    // In development, just warn
    if (config.environment === 'development') {
      console.warn(`⚠️ Missing environment variables: ${missingVars.join(', ')}`);
      console.warn('⚠️ Make sure to run with Doppler: doppler run -- vite');
    } else {
      // In other environments, throw an error
      throw new Error(`❌ Required environment variables missing: ${missingVars.join(', ')}`);
    }
  }
}

// Create and export the singleton instance
export const envConfig = loadEnvironmentConfig();

// Debug logging in development
if (envConfig.debugMode) {
  console.log('🔧 Environment Configuration:', {
    environment: envConfig.environment,
    appName: envConfig.appName,
    baseUrl: envConfig.baseUrl,
    debugMode: envConfig.debugMode,
    logLevel: envConfig.logLevel,
    supabaseUrl: envConfig.supabaseUrl ? `${envConfig.supabaseUrl.substring(0, 20)}...` : 'MISSING',
    features: envConfig.features
  });
}

export default envConfig;