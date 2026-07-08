export const configuration = () => ({
  port: parseInt(process.env.PORT ?? '3001', 10),
  jwtSecret: process.env.JWT_SECRET ?? 'atlas-secret-change-in-production',
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:3000',
  dbPath: process.env.DB_PATH ?? './data',
});
