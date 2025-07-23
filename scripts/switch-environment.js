/**
 * Environment Switcher
 * 
 * This script helps switch between different environments by copying the appropriate
 * environment configuration file to .env.local
 * 
 * Usage:
 *   node scripts/switch-environment.js [environment]
 * 
 * Where environment is one of: development, homologacao, production
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Available environments
const ENVIRONMENTS = ['development', 'homologacao', 'production'];

// Map environment names to config file names
const CONFIG_FILES = {
  'development': 'desenvolvimento.env',
  'homologacao': 'homologacao.env',
  'production': 'producao.env'
};

// Get the environment from command line arguments
const getRequestedEnvironment = () => {
  const envArg = process.argv[2];
  
  if (!envArg) {
    console.error('❌ No environment specified.');
    console.error(`Usage: node ${path.basename(__filename)} [${ENVIRONMENTS.join('|')}]`);
    process.exit(1);
  }
  
  if (!ENVIRONMENTS.includes(envArg)) {
    console.error(`❌ Invalid environment: ${envArg}`);
    console.error(`Valid environments: ${ENVIRONMENTS.join(', ')}`);
    process.exit(1);
  }
  
  return envArg;
};

// Switch to the specified environment
const switchEnvironment = (environment) => {
  const configFileName = CONFIG_FILES[environment];
  const sourcePath = path.resolve(process.cwd(), 'config', configFileName);
  const targetPath = path.resolve(process.cwd(), '.env.local');
  
  // Check if the source file exists
  if (!fs.existsSync(sourcePath)) {
    console.error(`❌ Configuration file not found: ${sourcePath}`);
    process.exit(1);
  }
  
  // Create a backup of the current .env.local if it exists
  if (fs.existsSync(targetPath)) {
    const backupPath = `${targetPath}.backup`;
    fs.copyFileSync(targetPath, backupPath);
    console.log(`✅ Backup created: ${backupPath}`);
  }
  
  // Copy the environment file to .env.local
  fs.copyFileSync(sourcePath, targetPath);
  console.log(`✅ Switched to ${environment} environment`);
  console.log(`📄 Configuration copied from ${configFileName} to .env.local`);
  
  // Check if Doppler is installed
  try {
    execSync('doppler --version', { stdio: 'ignore' });
    console.log('ℹ️ Doppler is installed. You may want to run:');
    console.log(`   doppler setup --project ${environment}`);
  } catch (error) {
    console.log('ℹ️ Doppler is not installed. For better secret management, consider installing it:');
    console.log('   https://docs.doppler.com/docs/cli');
  }
  
  return {
    environment,
    configFile: configFileName,
    sourcePath,
    targetPath
  };
};

// If this script is run directly, execute the function
if (require.main === module) {
  const environment = getRequestedEnvironment();
  switchEnvironment(environment);
}

// Export the function for use in other scripts
module.exports = switchEnvironment;