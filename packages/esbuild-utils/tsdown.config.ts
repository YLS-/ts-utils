import { defineConfig } from 'tsdown'

export default defineConfig({
	entry: {
		index: 'src/index.ts',
		plugins: 'src/plugins/index.ts',
	},
	exports: true,
	tsconfig: 'tsconfig.json',
	outDir: './dist',
	target: 'es2023',
	format: ['esm'],
	unbundle: true,
	dts: true,
	sourcemap: true,
	clean: true,
	treeshake: true,
	minify: false,
})

