import { defineConfig } from 'tsdown'

export default defineConfig({
	entry: {
		'index': 'src/index.ts',
		'auth': 'src/auth/index.ts',
		'firestore': 'src/firestore/index.ts',
		'storage': 'src/storage/index.ts',
		'scripts': 'src/scripts/index.ts',
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
