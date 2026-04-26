const esbuild = require('esbuild');
const { glob } = require('glob');

const entryPoints = glob.sync('src/**/*.ts');
const watchMode = process.argv.includes('--watch');

const config = {
  entryPoints,
  outdir: 'dist',
  platform: 'node',
  target: 'node18',
  format: 'cjs',
  sourcemap: true,
};

if (watchMode) {
  esbuild.context(config).then(ctx => {
    ctx.watch();
    console.log('👀 Backend watching for changes...');
  }).catch(err => {
    console.error('❌ Build failed:', err);
    process.exit(1);
  });
} else {
  esbuild.build(config).then(() => {
    console.log('✅ Backend compiled');
  }).catch(err => {
    console.error('❌ Build failed:', err);
    process.exit(1);
  });
}
