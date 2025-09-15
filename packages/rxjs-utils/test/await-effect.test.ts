import { of, lastValueFrom, toArray, concatMap, map, timer, Observable, EMPTY, interval, take } from 'rxjs'
import { awaitEffect } from '../src'
import { describe, it, expect, vi } from 'vitest'


describe('awaitEffect', () => {
	it('passes values after a Promise resolves for each emission', async () => {
		const source$: Observable<string> = of('a', 'b', 'c').pipe(
			// space out emissions to avoid cancellation
			concatMap(v => timer(10).pipe(map(() => v)))
		)

		const out: Observable<string> = source$.pipe(
			awaitEffect(() => Promise.resolve())
		)

		const result = await lastValueFrom(out.pipe(toArray()))
		expect(result).toEqual(['a', 'b', 'c'])
	})


	it('cancels previous effect when new value arrives (switching)', async () => {
		const source$: Observable<string> = of('a', 'b', 'c') // synchronous burst
		const out: Observable<string> = source$.pipe(
			// slow effect -> previous ones get canceled
			awaitEffect(() => timer(5))
		)

		const result = await lastValueFrom(out.pipe(toArray()))
		expect(result).toEqual(['c'])
	})


	it('passes values after the first inner emission (does not wait for inner completion)', async () => {
		const source$: Observable<string> = of('A')
		const out: Observable<string> = source$.pipe(
			// infinite multi-value inner
			awaitEffect(() => interval(1))
		)

		const result = await lastValueFrom(out.pipe(toArray()))
		expect(result).toEqual(['A'])
	})

	it('errors when the effect Observable completes without emitting', async () => {
		const source$: Observable<string> = of('A')
		const out: Observable<string> = source$.pipe(
			awaitEffect(() => EMPTY)
		)

		await expect(lastValueFrom(out)).rejects.toThrow('Effect produced no first value')
	})


	it('works with Observable effects and passes values after the first inner emission', async () => {
		const source$: Observable<number> = of(1, 2, 3).pipe(
			concatMap(v => timer(5).pipe(map(() => v))) // spaced emissions
		)
		const out: Observable<number> = source$.pipe(
			// inner completes shortly after
			awaitEffect(() => timer(2))
		)

		const result = await lastValueFrom(out.pipe(toArray()))
		expect(result).toEqual([1, 2, 3])
	})


	it('ignores inner emissions and only forwards the original value after the first inner emission', async () => {
		const source$: Observable<string> = of('A')
		const out: Observable<string> = source$.pipe(
			// these inner values are ignored
			awaitEffect(() => of('x', 'y', 'z'))
		)

		const result = await lastValueFrom(out.pipe(toArray()))
		expect(result).toEqual(['A'])
	})


	it('propagates errors from the effect', async () => {
		const source$: Observable<number> = of(123)
		const out: Observable<number> = source$.pipe(
			awaitEffect(() => Promise.reject(new Error('boom')))
		)

		await expect(lastValueFrom(out)).rejects.toThrow('boom')
	})


	it('calls the effect for each source value', async () => {
		const spy = vi.fn().mockImplementation(() => Promise.resolve())
		const source$: Observable<string> = of('a', 'b', 'c')
		const out: Observable<string> = source$.pipe(awaitEffect(spy))

		// Drain to ensure all effects had a chance to run
		await expect(lastValueFrom(out.pipe(toArray()))).resolves.toEqual(['c']) // only 'c' due to cancellation
		expect(spy).toHaveBeenCalledTimes(3)
		expect(spy).toHaveBeenNthCalledWith(1, 'a')
		expect(spy).toHaveBeenNthCalledWith(2, 'b')
		expect(spy).toHaveBeenNthCalledWith(3, 'c')
	})
})
