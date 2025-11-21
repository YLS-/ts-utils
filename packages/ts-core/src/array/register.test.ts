import { describe, it, expect, beforeEach } from 'vitest'


describe('Array.prototype registration (array/register)', () => {
	beforeEach(async () => {
		const { vi } = await import('vitest')
		vi.resetModules()
		await import('./register')
	})

	it('registers methods on Array.prototype', async () => {
		const arr: any[] = []
		expect(typeof (arr as any).first).toBe('function')
		expect(typeof (arr as any).last).toBe('function')
		expect(typeof (arr as any).random).toBe('function')
		expect(typeof (arr as any).swap).toBe('function')
		expect(typeof (arr as any).chunk).toBe('function')
	})

	it('defines methods as non-enumerable', async () => {
		const arr: any[] = []
		expect(Object.prototype.propertyIsEnumerable.call(arr, 'first')).toBe(false)
		expect(Object.prototype.propertyIsEnumerable.call(arr, 'last')).toBe(false)
		expect(Object.prototype.propertyIsEnumerable.call(arr, 'random')).toBe(false)
		expect(Object.prototype.propertyIsEnumerable.call(arr, 'swap')).toBe(false)
		expect(Object.prototype.propertyIsEnumerable.call(arr, 'chunk')).toBe(false)
	})

	it('does not alter method identity when imported again (idempotent)', async () => {
		const arr: any[] = []
		const firstRef1 = (arr as any).first

		await import('./register')
		const firstRef2 = (arr as any).first
		expect(firstRef2).toBe(firstRef1)
	})
})
