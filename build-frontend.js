// Dual esbuild script to compile TypeScript to JavaScript
// - main.ts → main.js (Lit components)
// - i18n-bundle.ts → i18n.js (i18n system)
const esbuild = require('esbuild');
const path = require('path');

const watchMode = process.argv.includes('--watch');

const buildConfigs = [
  // Bundle 1: Lit Components
  {
    entryPoints: ['public/js/main.ts'],
    bundle: true,
    outfile: 'public/js/main.js',
    format: 'esm',
    target: 'es2020',
    sourcemap: true,
    external: [],
    nodePaths: [path.resolve(__dirname, 'node_modules')],
    tsconfigRaw: {
      compilerOptions: {
        experimentalDecorators: true,
        useDefineForClassFields: false,
      }
    }
  },
  // Bundle 2: i18n System
  {
    entryPoints: ['public/js/i18n-bundle.ts'],
    bundle: true,
    outfile: 'public/js/i18n.js',
    format: 'esm',
    target: 'es2020',
    sourcemap: true,
    external: [],
  }
];

if (watchMode) {
  Promise.all(
    buildConfigs.map(config => 
      esbuild.context(config).then(ctx => ctx.watch())
    )
  ).then(() => {
    console.log('👀 Watching for changes (Lit + i18n)...');
  }).catch((err) => {
    console.error('Watch error:', err);
    process.exit(1);
  });
} else {
  Promise.all(
    buildConfigs.map(config => esbuild.build(config))
  ).then(() => {
    console.log('✅ Frontend TypeScript compiled to JavaScript');
    console.log('   - main.js (Lit components)');
    console.log('   - i18n.js (i18n system)');
  }).catch((err) => {
    console.error('Build error:', err);
    process.exit(1);
  });
}
