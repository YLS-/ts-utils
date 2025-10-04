import { of, lastValueFrom, toArray, concat, throwError, EMPTY, take } from 'rxjs'
import { finalizeWith } from '../src'
import { describe, it, expect, vi } from 'vitest'


describe('finalizeWithValue', () => {
	it('passes values through and calls with the last value on complete', async () => {
		const spy = vi.fn()
		const out = of('a', 'b', 'c').pipe(finalizeWith(spy))

		const result = await lastValueFrom(out.pipe(toArray()))
		expect(result).toEqual(['a', 'b', 'c'])
		expect(spy).toHaveBeenCalledTimes(1)
		expect(spy).toHaveBeenCalledWith('c')
	})


	it('calls with the last value on error', async () => {
		const spy = vi.fn()
		const src = concat(of('a', 'b', 'c'), throwError(() => new Error('boom')))
		const out = src.pipe(finalizeWith(spy))

		await expect(lastValueFrom(out)).rejects.toThrow('boom')
		expect(spy).toHaveBeenCalledTimes(1)
		expect(spy).toHaveBeenCalledWith('c')
	})


	it('calls on unsubscribe (e.g., via take)', async () => {
		const spy = vi.fn()
		const out = of('x', 'y', 'z').pipe(finalizeWith(spy), take(1))

		const result = await lastValueFrom(out.pipe(toArray()))
		expect(result).toEqual(['x'])
		expect(spy).toHaveBeenCalledTimes(1)
		expect(spy).toHaveBeenCalledWith('x')
	})


	it('passes undefined when there were no emissions', async () => {
		const spy = vi.fn()
		const out = EMPTY.pipe(finalizeWith(spy))

		await expect(lastValueFrom(out)).rejects.toBeInstanceOf(Error)
		expect(spy).toHaveBeenCalledTimes(1)
		expect(spy).toHaveBeenCalledWith(undefined)
	})


	it('is per-subscription and uses the last value each time', async () => {
		const spy = vi.fn()
		const src = of('a', 'b')
		const out = src.pipe(finalizeWith(spy))

		await lastValueFrom(out.pipe(toArray()))
		await lastValueFrom(out.pipe(toArray()))

		expect(spy).toHaveBeenCalledTimes(2)
		expect(spy).toHaveBeenNthCalledWith(1, 'b')
		expect(spy).toHaveBeenNthCalledWith(2, 'b')
	})
})
