import { defineConfig } from 'tsdown'

export default defineConfig({
	entry: {
		'index': 'src/index.ts',
		'typescript': 'src/typescript/index.ts',
		// 'console': 'src/console/index.ts',
		'console-node': 'src/console/node/index.ts',
		'console-devtools': 'src/console/devtools/index.ts',
		'array/methods': 'src/array/methods.ts',
		'array/register': 'src/array/register.ts',
		'data': 'src/data/index.ts',
		'math': 'src/math/index.ts',
		'crypto': 'src/crypto/index.ts',
		'async': 'src/async/index.ts',
		'media': 'src/media/index.ts',
		'similarity': 'src/similarity/index.ts',
		'http': 'src/http/index.ts',

		'devtools': 'src/devtools/index.ts',
	},
	exports: true,
	tsconfig: 'tsconfig.json',
	outDir: './dist',
	target: 'es2023',
	format: ['esm', /*'cjs'*/],
	// keep outputs unbundled for better stack traces, source maps, type resolution
	unbundle: true,
	dts: true,
	sourcemap: true,
	clean: true,
	treeshake: true,
	minify: false,
})
