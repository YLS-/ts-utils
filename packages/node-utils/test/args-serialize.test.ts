import { describe, expect, it } from 'vitest'

import {
	serializeArgs,
	type ArgSerializerOptions,
} from '../src/process'

describe('serializeArgs', () => {
	it('serializes primitives and booleans by default', () => {
		expect(
			serializeArgs({
				minify: true,
				sourcemap: false,
				entry: './src/index.ts',
				define: { 'process.env.NODE_ENV': 'development' },
			}),
		).toMatchInlineSnapshot(`
			[
			  "--minify",
			  "--entry=./src/index.ts",
			  "--define-process-env-node-env=development",
			]
		`)
	})

	it('supports aliases and custom styles', () => {
		const serializer: ArgSerializerOptions = {
			style: 'space',
			booleanStyle: 'assign',
			aliases: {
				watch: { short: 'w', long: 'watch' },
			},
			allowShort: true,
		}

		expect(
			serializeArgs(
				{
					watch: true,
					target: 'es2023',
					define: ['DEBUG=true', 'API=https://example.com'],
				},
				serializer,
			),
		).toMatchInlineSnapshot(`
			[
			  "-w",
			  "true",
			  "--target",
			  "es2023",
			  "--define",
			  "DEBUG=true",
			  "--define",
			  "API=https://example.com",
			]
		`)
	})

	it('handles positional arguments', () => {
		expect(
			serializeArgs({
				_: ['serve', 'app'],
				host: '0.0.0.0',
				port: 8080,
			}),
		).toEqual(['--host=0.0.0.0', '--port=8080', 'serve', 'app'])
	})
})

