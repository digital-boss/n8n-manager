const esbuild = require('esbuild');

esbuild.buildSync({
  entryPoints: ['src/index.ts'],
  outdir: `dist`,
  bundle: true,
  platform: 'node',
});