import { defineConfig } from 'tsdown'

export default defineConfig({
	entry: {
		index: 'src/index.ts',
		env: 'src/env/index.ts',
		fs: 'src/fs/index.ts',
		process: 'src/process/index.ts',
		console: 'src/console/index.ts',
		crypto: 'src/crypto/index.ts',
		http: 'src/http/index.ts',
		zlib: 'src/zlib/index.ts',
		devtools: 'src/devtools/index.ts',
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

