// @ts-check
import { defineConfig } from 'eslint/config'
import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import globals from 'globals'
import vitest from 'eslint-plugin-vitest'

export default defineConfig(
	// 0) ignore build artifacts and type declarations
	{ ignores: ['**/dist/**', '**/coverage/**', '**/*.d.ts'] },

	// 1) base JS rules + Node globals
	{ languageOptions: { globals: globals.node } },
	js.configs.recommended,

	// 2) TypeScript (no type-checking, fast, works without per-package tsconfig)
	...tseslint.configs.recommended,

	// 3) Tests: Vitest globals + a light recommended rule set
	{
		files: ['**/*.{test,spec}.ts', '**/__tests__/**/*.ts'],
		plugins: { vitest },
		languageOptions: {
			globals: { ...globals.node, ...vitest.environments.env.globals },
		},
		rules: {
			...vitest.configs.recommended.rules,
		},
	}
)
