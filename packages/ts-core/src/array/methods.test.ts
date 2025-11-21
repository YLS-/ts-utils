import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { first, last, random, swap, chunk } from './methods'


describe('first', () => {
	it('returns the first element or null for empty array', () => {
		expect(first([1, 2, 3])).toBe(1)
		expect(first(['a', 'b'])).toBe('a')
		expect(first<number>([])).toBeNull()
	})
})


describe('last', () => {
	it('returns the last element or null for empty array', () => {
		expect(last([1, 2, 3])).toBe(3)
		expect(last(['a', 'b'])).toBe('b')
		expect(last<number>([])).toBeNull()
	})
})


describe('random', () => {
	beforeEach(() => {
		vi.spyOn(Math, 'random').mockReturnValue(0)
	})

	afterEach(() => {
		vi.restoreAllMocks()
	})

	it('returns a deterministic element with mocked Math.random()', () => {
		expect(random([10, 20, 30])).toBe(10)
	})

	it('works for last index when Math.random() close to 1', () => {
		vi.spyOn(Math, 'random').mockReturnValue(0.9999999)
		const arr = ['x', 'y', 'z']
		const idx = Math.floor(0.9999999 * arr.length)
		expect(idx).toBe(2)
		expect(random(arr)).toBe('z')
	})
})


describe('swap', () => {
	it('swaps two valid indices (mutates array)', () => {
		const arr = [1, 2, 3]
		const res = swap(arr, 0, 2)
		expect(res).toBe(arr)
		expect(arr).toEqual([3, 2, 1])
	})

	it('no-op when indices are out of range', () => {
		const arr = [1, 2, 3]
		swap(arr, -1, 5)
		expect(arr).toEqual([1, 2, 3])
	})
})


describe('chunk', () => {
	it('splits into chunks of given size', () => {
		expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]])
		expect(chunk([1, 2, 3], 3)).toEqual([[1, 2, 3]])
	})

	it('does not mutate original array', () => {
		const arr = [1, 2, 3, 4]
		const copy = [...arr]
		chunk(arr, 3)
		expect(arr).toEqual(copy)
	})

	it('handles chunkSize larger than array length', () => {
		expect(chunk([1, 2], 10)).toEqual([[1, 2]])
	})
})
