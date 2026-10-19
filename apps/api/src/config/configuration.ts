export const configuration = () => {
  const isProd = process.env.NODE_ENV === 'production';
  const jwtSecret = process.env.JWT_SECRET || 'atlas-production-fallback-secret-please-set-jwt-secret';
  if (isProd && !process.env.JWT_SECRET) {
    // eslint-disable-next-line no-console
    console.warn('⚠️ WARNING: JWT_SECRET environment variable is not set. Using fallback secret. Please configure JWT_SECRET for production.');
  }
  return {
    port: parseInt(process.env.PORT ?? '3001', 10),
    nodeEnv: process.env.NODE_ENV ?? 'development',
    jwtSecret,
    corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:3000',
    dbPath: process.env.DB_PATH ?? './data',
  };
};
