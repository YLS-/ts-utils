import { defineConfig } from 'tsup'

export default defineConfig({
	entry: {
		'index': 'src/index.ts',
		'array/methods': 'src/array/methods.ts',
		'array/register': 'src/array/register.ts',
	},
	format: ['esm', 'cjs'],
	dts: true,
	sourcemap: true,
	clean: true,
	target: 'es2023',
	treeshake: true,
	minify: false
})
