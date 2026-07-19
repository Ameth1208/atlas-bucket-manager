export const configuration = () => {
  const isProd = process.env.NODE_ENV === 'production';
  const jwtSecret = process.env.JWT_SECRET;
  if (isProd && !jwtSecret) {
    throw new Error('JWT_SECRET must be set in production');
  }
  return {
    port: parseInt(process.env.PORT ?? '3001', 10),
    nodeEnv: process.env.NODE_ENV ?? 'development',
    jwtSecret: jwtSecret ?? 'atlas-dev-secret-do-not-use-in-production',
    corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:3000',
    dbPath: process.env.DB_PATH ?? './data',
  };
};
