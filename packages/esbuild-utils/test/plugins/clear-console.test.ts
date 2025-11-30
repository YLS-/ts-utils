import { beforeEach, describe, expect, it, vi } from 'vitest'
import { clearConsolePlugin } from '../../src/plugins/clear-console'
import { createMockBuild } from './mocks'

describe('clearConsolePlugin', () => {
	beforeEach(() => {
		vi.restoreAllMocks()
	})

	it('clears the console when a build starts', async () => {
		const build = createMockBuild()
		const clearSpy = vi.spyOn(console, 'clear').mockImplementation(() => {})

		clearConsolePlugin.setup(build as never)
		await build.triggerStart()

		expect(clearSpy).toHaveBeenCalledTimes(1)

		clearSpy.mockRestore()
	})
})

