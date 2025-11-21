import { defineConfig } from 'tsdown'

export default defineConfig({
	entry: {
		'index': 'src/index.ts',
		'typescript': 'src/typescript/index.ts',
		'array/methods': 'src/array/methods.ts',
		'array/register': 'src/array/register.ts',
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
