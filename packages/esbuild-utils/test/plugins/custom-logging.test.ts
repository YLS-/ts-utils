import { beforeEach, describe, expect, it } from 'vitest'
import { consoleMocks, createMockBuild, resetConsoleMocks } from './mocks'
import { customLoggingPlugin } from '../../src/plugins/custom-logging'

const {
	startSpinner,
	stopSpinner,
	startPersistentSpinner,
	stopPersistentSpinner,
	updateStatus,
	getWatchMode,
} = consoleMocks

describe('customLoggingPlugin', () => {
	beforeEach(() => {
		resetConsoleMocks()
	})

	it('uses transient spinner outside watch mode', async () => {
		const build = createMockBuild()
		customLoggingPlugin.setup(build as never)

		await build.triggerStart()
		expect(startSpinner).toHaveBeenCalledWith('Building TypeScript files')

		await build.triggerEnd({ errors: [], warnings: [] })
		expect(stopSpinner).toHaveBeenCalledTimes(1)

		const statuses = updateStatus.mock.calls.map(([msg]) => msg)
		expect(statuses).toContain('Building...')
		expect(statuses).toContain('Build successful')
	})

	it('uses persistent spinner in watch mode', async () => {
		getWatchMode.mockReturnValue(true)
		const build = createMockBuild()
		customLoggingPlugin.setup(build as never)

		await build.triggerStart()
		expect(startPersistentSpinner).toHaveBeenCalledTimes(1)

		await build.triggerEnd({ errors: [], warnings: [] })
		expect(stopPersistentSpinner).toHaveBeenCalledTimes(1)
		expect(startPersistentSpinner).toHaveBeenCalledTimes(2) // re-enter watch status
		expect(stopSpinner).not.toHaveBeenCalled()
	})
})

