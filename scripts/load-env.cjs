/**
 * Environment Variables Loader
 * 
 * This script loads environment variables from the appropriate .env file
 * based on the current environment (development, homologacao, production).
 * 
 * Usage:
 *   node scripts/load-env.js [environment]
 * 
 * If no environment is specified, it will use NODE_ENV or default to 'development'.
 */

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Determine the environment
const getEnvironment = () => {
  // Command line argument takes precedence
  const envArg = process.argv[2];
  if (envArg && ['development', 'homologacao', 'production'].includes(envArg)) {
    return envArg;
  }
  
  // Then check NODE_ENV
  if (process.env.NODE_ENV && ['development', 'homologacao', 'production'].includes(process.env.NODE_ENV)) {
    return process.env.NODE_ENV;
  }
  
  // Default to development
  return 'development';
};

// Map environment names to config file names
const getConfigFileName = (env) => {
  const configMap = {
    'development': 'desenvolvimento.env',
    'homologacao': 'homologacao.env',
    'production': 'producao.env'
  };
  
  return configMap[env] || 'desenvolvimento.env';
};

// Load environment variables
const loadEnvironment = () => {
  const environment = getEnvironment();
  const configFileName = getConfigFileName(environment);
  const configPath = path.resolve(process.cwd(), 'config', configFileName);
  
  // Check if the config file exists
  if (!fs.existsSync(configPath)) {
    console.error(`❌ Configuration file not found: ${configPath}`);
    process.exit(1);
  }
  
  // Load the environment variables
  const envConfig = dotenv.config({ path: configPath });
  
  if (envConfig.error) {
    console.error(`❌ Error loading environment variables: ${envConfig.error.message}`);
    process.exit(1);
  }
  
  console.log(`✅ Loaded environment variables from ${configFileName} for ${environment} environment`);
  
  // Return the loaded environment
  return {
    environment,
    configPath,
    variables: envConfig.parsed
  };
};

// Export the function for use in other scripts
module.exports = loadEnvironment;

// If this script is run directly, execute the function
if (require.main === module) {
  const result = loadEnvironment();
  console.log(`🌍 Environment: ${result.environment}`);
  console.log(`📄 Config file: ${result.configPath}`);
  
  // Print some of the loaded variables (excluding sensitive ones)
  const safeVars = Object.keys(result.variables || {})
    .filter(key => !key.includes('KEY') && !key.includes('SECRET') && !key.includes('PASSWORD'))
    .reduce((obj, key) => {
      obj[key] = result.variables[key];
      return obj;
    }, {});
  
  console.log('🔧 Loaded variables:', safeVars);
}