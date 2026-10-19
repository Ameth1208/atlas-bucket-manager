const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const webPort = parseInt(process.env.PORT || '3000', 10);
const apiPort = webPort === 3001 ? 3002 : (process.env.INTERNAL_API_PORT || 3001);

console.log('───────────────────────────────────────────────────');
console.log(`🚀 Starting Atlas Bucket Manager v2.0.3 (All-in-One)`);
console.log(`   • Web UI listening on: http://0.0.0.0:${webPort}`);
console.log(`   • API Server on:       http://127.0.0.1:${apiPort}`);
console.log('───────────────────────────────────────────────────');

// 1. Start NestJS API
const apiEnv = {
  ...process.env,
  PORT: String(apiPort),
  NODE_ENV: 'production',
  DB_PATH: process.env.DB_PATH || './data',
  JWT_SECRET: process.env.JWT_SECRET || 'atlas-production-fallback-secret-please-set-jwt-secret',
  CORS_ORIGIN: process.env.CORS_ORIGIN || `http://localhost:${webPort}`,
};

const api = spawn('node', ['apps/api/dist/main.js'], {
  cwd: process.cwd(),
  env: apiEnv,
  stdio: 'inherit',
});

// 2. Locate Next.js standalone server
let webServerPath = path.join(process.cwd(), 'apps/client/server.js');
let webCwd = path.join(process.cwd(), 'apps/client');

if (!fs.existsSync(webServerPath)) {
  const altPath = path.join(process.cwd(), 'apps/client/.next/standalone/apps/client/server.js');
  if (fs.existsSync(altPath)) {
    webServerPath = altPath;
    webCwd = path.dirname(altPath);
  }
}

const webEnv = {
  ...process.env,
  PORT: String(webPort),
  NODE_ENV: 'production',
  API_URL: `http://127.0.0.1:${apiPort}`,
  HOSTNAME: '0.0.0.0',
};

const web = spawn('node', [webServerPath], {
  cwd: webCwd,
  env: webEnv,
  stdio: 'inherit',
});

api.on('exit', (code, signal) => {
  console.error(`[Atlas API] Process exited with code ${code} / signal ${signal}`);
  process.exit(code || 1);
});

web.on('exit', (code, signal) => {
  console.error(`[Atlas Web] Process exited with code ${code} / signal ${signal}`);
  process.exit(code || 1);
});

process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down...');
  api.kill('SIGTERM');
  web.kill('SIGTERM');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down...');
  api.kill('SIGINT');
  web.kill('SIGINT');
  process.exit(0);
});
