// Simple esbuild script to compile TypeScript Lit components to JavaScript
const esbuild = require('esbuild');
const path = require('path');

const watchMode = process.argv.includes('--watch');

const buildConfig = {
  entryPoints: ['public/js/main.ts'],
  bundle: true,
  outfile: 'public/js/main.js',
  format: 'esm',
  target: 'es2020',
  sourcemap: true,
  // Bundle everything including lit from node_modules
  external: [],
  // Resolve node_modules
  nodePaths: [path.resolve(__dirname, 'node_modules')],
  // Handle TypeScript decorators
  tsconfigRaw: {
    compilerOptions: {
      experimentalDecorators: true,
      useDefineForClassFields: false,
    }
  }
};

if (watchMode) {
  esbuild.context(buildConfig).then((ctx) => {
    ctx.watch();
    console.log('👀 Watching for changes...');
  }).catch((err) => {
    console.error('Watch error:', err);
    process.exit(1);
  });
} else {
  esbuild.build(buildConfig).then(() => {
    console.log('✅ Frontend TypeScript compiled to JavaScript');
  }).catch((err) => {
    console.error('Build error:', err);
    process.exit(1);
  });
}
