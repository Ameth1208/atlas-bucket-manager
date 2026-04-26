import dotenv from 'dotenv';

dotenv.config();

export interface AppConfig {
  port: number | string;
  jwtSecret: string;
  corsOrigin: string;
  dbPath: string;
}

export const appConfig: AppConfig = {
  port: process.env.PORT || 3001,
  jwtSecret: process.env.JWT_SECRET || 'atlas-secret-change-in-production',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  dbPath: process.env.DB_PATH || './data',
};
