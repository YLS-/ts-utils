import { beforeEach, describe, expect, it, vi } from 'vitest'
import { consoleMocks, createMockBuild, FakeProcess, resetConsoleMocks } from './mocks'
import { runProcessPlugin } from '../../src/plugins/run-process'

const { updateStatus } = consoleMocks

describe('runProcessPlugin', () => {
	beforeEach(() => {
		resetConsoleMocks()
	})

	it('runs supplied process after successful builds', async () => {
		const build = createMockBuild()
		const process = new FakeProcess()
		const runner = vi.fn(() => process as never)

		const plugin = runProcessPlugin({ runner })
		plugin.setup(build as never)

		await build.triggerEnd({ errors: [], warnings: [] })
		expect(runner).toHaveBeenCalledWith('dist/index.js')
		expect(updateStatus).toHaveBeenCalledWith('starting...')

		process.emit('spawn')
		expect(updateStatus).toHaveBeenLastCalledWith('watching for changes...')

		process.emit('exit', 2)
		expect(updateStatus).toHaveBeenLastCalledWith('exited with code 2')
	})

	it('terminates the previous process before restarting', async () => {
		const build = createMockBuild()
		const first = new FakeProcess()
		const second = new FakeProcess()
		const runner = vi.fn()
		runner.mockReturnValueOnce(first as never).mockReturnValueOnce(second as never)

		const plugin = runProcessPlugin({ runner, label: '[dev]' })
		plugin.setup(build as never)

		await build.triggerEnd({ errors: [], warnings: [] })
		await build.triggerEnd({ errors: [], warnings: [] })

		expect(first.kill).toHaveBeenCalledWith('SIGTERM')
		expect(runner).toHaveBeenCalledTimes(2)
	})

	it('skips running processes when build results contain errors', async () => {
		const build = createMockBuild()
		const runner = vi.fn(() => new FakeProcess() as never)
		const plugin = runProcessPlugin({ runner })
		plugin.setup(build as never)

		await build.triggerEnd({ errors: [{ text: 'boom' }], warnings: [] })
		expect(runner).not.toHaveBeenCalled()
	})
})

