import { mkdtemp, realpath, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

import { isInteractive, onceSignals, withWorkingDirectory } from '../src/process'

const delay = (ms = 10): Promise<void> =>
	new Promise((resolve) => setTimeout(resolve, ms))

const createTempDir = (): Promise<string> =>
	mkdtemp(join(tmpdir(), 'node-utils-process-'))

describe('withWorkingDirectory', () => {
	it('switches directories for the callback duration', async () => {
		const original = process.cwd()
		const tempDir = await createTempDir()

		try {
			await withWorkingDirectory(tempDir, async () => {
				expect(await realpath(process.cwd())).toBe(await realpath(tempDir))
			})

			expect(await realpath(process.cwd())).toBe(await realpath(original))
		} finally {
			await rm(tempDir, { recursive: true, force: true })
		}
	})

	it('restores the cwd even if the callback throws', async () => {
		const original = process.cwd()
		const tempDir = await createTempDir()

		try {
			await expect(
				withWorkingDirectory(tempDir, () => {
					throw new Error('boom')
				}),
			).rejects.toThrow('boom')

			expect(await realpath(process.cwd())).toBe(await realpath(original))
		} finally {
			await rm(tempDir, { recursive: true, force: true })
		}
	})
})

describe('onceSignals', () => {
	it('resolves when a signal is emitted', async () => {
		const subscription = onceSignals(['SIGTERM'])

		process.emit('SIGTERM')

		await expect(subscription.promise).resolves.toBe('SIGTERM')
	})

	it('can be disposed before signals fire', async () => {
		const subscription = onceSignals(['SIGINT'])

		subscription.dispose()

		process.emit('SIGINT')

		const result = await Promise.race([
			subscription.promise.then(() => 'resolved'),
			delay(20).then(() => 'timeout'),
		])

		expect(result).toBe('timeout')
	})
})

describe('isInteractive', () => {
	it('honors TTY status and env flags', () => {
		const interactEnv: NodeJS.ProcessEnv = {
			TERM: 'xterm-256color',
		}

		expect(
			isInteractive({
				stdout: { isTTY: true },
				stderr: { isTTY: true },
				env: interactEnv,
			}),
		).toBe(true)

		const ciEnv: NodeJS.ProcessEnv = {
			TERM: 'xterm-256color',
			CI: 'true',
		}

		expect(
			isInteractive({
				stdout: { isTTY: true },
				stderr: { isTTY: true },
				env: ciEnv,
			}),
		).toBe(false)

		expect(
			isInteractive({
				stdout: { isTTY: false },
				stderr: { isTTY: true },
				env: interactEnv,
			}),
		).toBe(false)
	})
})

