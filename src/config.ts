import { config as loadEnv } from 'dotenv';
loadEnv();

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  host: process.env.HOST || '0.0.0.0',
  env: process.env.NODE_ENV || 'development',
  
  // Auth
  apiKeySecret: process.env.API_KEY_SECRET || 'dev-secret-change-in-production',
  
  // Database (for future use)
  databaseUrl: process.env.DATABASE_URL,
};

export const isDevelopment = config.env === 'development';
export const isProduction = config.env === 'production';
