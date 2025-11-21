import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { sleep$, randomPause } from './sleep'


describe('sleep$', () => {
	beforeEach(() => {
		vi.useFakeTimers()
	})

	afterEach(() => {
		vi.useRealTimers()
		vi.restoreAllMocks()
	})

	it('resolves after the specified delay', async () => {
		let resolved = false
		const promise = sleep$(1000).then(() => {
			resolved = true
		})

		expect(resolved).toBe(false)
		await vi.advanceTimersByTimeAsync(999)
		expect(resolved).toBe(false)
		await vi.advanceTimersByTimeAsync(1)
		expect(resolved).toBe(true)

		await promise
	})
})


describe('randomPause', () => {
	beforeEach(() => {
		vi.useFakeTimers()
	})

	afterEach(() => {
		vi.useRealTimers()
		vi.restoreAllMocks()
	})

	it('uses the minimum delay when Math.random() returns 0', async () => {
		vi.spyOn(Math, 'random').mockReturnValue(0)

		let resolved = false
		const promise = randomPause(1000, 2000).then(() => {
			resolved = true
		})

		await vi.advanceTimersByTimeAsync(999)
		expect(resolved).toBe(false)
		await vi.advanceTimersByTimeAsync(1)
		expect(resolved).toBe(true)

		await promise
	})

	it('uses a delay within the provided range (midpoint)', async () => {
		vi.spyOn(Math, 'random').mockReturnValue(0.5)

		let resolved = false
		const promise = randomPause(1000, 2000).then(() => {
			resolved = true
		})

		await vi.advanceTimersByTimeAsync(1499)
		expect(resolved).toBe(false)
		await vi.advanceTimersByTimeAsync(1)
		expect(resolved).toBe(true)

		await promise
	})
})
