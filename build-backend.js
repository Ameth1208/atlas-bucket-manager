// Simple esbuild script to compile TypeScript backend to JavaScript
const esbuild = require('esbuild');
const { glob } = require('glob');
const path = require('path');

// Get all .ts files in src/ recursively
const entryPoints = glob.sync('src/**/*.ts');

esbuild.build({
  entryPoints: entryPoints,
  outdir: 'dist',
  platform: 'node',
  target: 'node18',
  format: 'cjs',
  sourcemap: true,
  // Don't bundle - compile each file separately to preserve structure
}).then(() => {
  console.log('✅ Backend compiled');
}).catch((err) => {
  console.error('❌ Build failed:', err);
  process.exit(1);
});
