#!/usr/bin/env node

/**
 * Production startup script for EcoMeter Backend
 * Handles environment setup and graceful startup
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🚀 Starting EcoMeter Backend...');

// Check for required environment variables
const requiredEnvVars = [
  'MONGO_URI',
  'ML_SERVICE_URL'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingVars.forEach(varName => {
    console.error(`   - ${varName}`);
  });
  process.exit(1);
}

// Set default port if not provided
if (!process.env.PORT) {
  process.env.PORT = '10000';
}

console.log('✅ Environment variables validated');
console.log(`📡 Port: ${process.env.PORT}`);
console.log(`🗄️  Database: ${process.env.MONGO_URI.replace(/\/\/.*@/, '//***:***@')}`);
console.log(`🤖 ML Service: ${process.env.ML_SERVICE_URL}`);

// Import and start the main server
try {
  await import('./index.js');
} catch (error) {
  console.error('❌ Failed to start backend:', error.message);
  process.exit(1);
}