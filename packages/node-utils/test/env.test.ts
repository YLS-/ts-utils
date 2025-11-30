import { afterEach, describe, expect, it } from 'vitest'

import {
	readEnvBoolean,
	readEnvJson,
	readEnvNumber,
	readEnvString,
} from '../src/env'

const TEST_PREFIX = 'NODE_UTILS_TEST_'

afterEach(() => {
	for (const key of Object.keys(process.env)) {
		if (key.startsWith(TEST_PREFIX)) {
			delete process.env[key]
		}
	}
})

describe('env helpers', () => {
	it('reads trimmed string values', () => {
		process.env[`${TEST_PREFIX}STRING`] = '  hello world  '

		expect(readEnvString(`${TEST_PREFIX}STRING`)).toBe('hello world')
	})

	it('supports default values when missing', () => {
		expect(
			readEnvString(`${TEST_PREFIX}MISSING`, {
				defaultValue: 'fallback',
			}),
		).toBe('fallback')
	})

	it('throws for missing required env vars', () => {
		expect(() =>
			readEnvString(`${TEST_PREFIX}REQUIRED`, { required: true }),
		).toThrow(/Missing required env var/)
	})

	it('parses numbers', () => {
		process.env[`${TEST_PREFIX}NUMBER`] = '42'

		expect(readEnvNumber(`${TEST_PREFIX}NUMBER`)).toBe(42)
	})

	it('throws for invalid numbers', () => {
		process.env[`${TEST_PREFIX}NUMBER_INVALID`] = 'not-a-number'

		expect(() =>
			readEnvNumber(`${TEST_PREFIX}NUMBER_INVALID`, { required: true }),
		).toThrow(/finite number/)
	})

	it('parses boolean values', () => {
		process.env[`${TEST_PREFIX}BOOL_TRUE`] = 'YES'
		process.env[`${TEST_PREFIX}BOOL_FALSE`] = '0'

		expect(readEnvBoolean(`${TEST_PREFIX}BOOL_TRUE`)).toBe(true)
		expect(readEnvBoolean(`${TEST_PREFIX}BOOL_FALSE`)).toBe(false)
	})

	it('throws for invalid boolean values', () => {
		process.env[`${TEST_PREFIX}BOOL_INVALID`] = 'maybe'

		expect(() =>
			readEnvBoolean(`${TEST_PREFIX}BOOL_INVALID`, { required: true }),
		).toThrow(/boolean-like/)
	})

	it('parses JSON payloads', () => {
		process.env[`${TEST_PREFIX}JSON`] = '{"feature":true,"count":2}'

		expect(
			readEnvJson<{ feature: boolean; count: number }>(
				`${TEST_PREFIX}JSON`,
			),
		).toEqual({ feature: true, count: 2 })
	})

	it('throws for invalid JSON payloads', () => {
		process.env[`${TEST_PREFIX}JSON_BAD`] = '{oops}'

		expect(() =>
			readEnvJson(`${TEST_PREFIX}JSON_BAD`, { required: true }),
		).toThrow(/valid JSON/)
	})
})

