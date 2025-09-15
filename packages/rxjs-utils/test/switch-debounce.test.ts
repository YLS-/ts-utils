import { of, lastValueFrom, toArray, concatMap, map, timer, Observable, concat, throwError } from 'rxjs'
import { switchDebounce } from '../src'
import { describe, it, expect } from 'vitest'


describe('switchDebounce', () => {
	it('passes normal values immediately (no delay for non-null)', async () => {
		const source$: Observable<string> = of('a', 'b', 'c').pipe(
			concatMap((v, i) => timer(i * 5).pipe(map(() => v)))
		)
		const out = source$.pipe(switchDebounce<string | null>(20))

		const result = await lastValueFrom(out.pipe(toArray()))
		expect(result).toEqual(['a', 'b', 'c'])
	})


	it('emits null only after the debounce time', async () => {
		const source$ = of('x', null).pipe(
			concatMap((v, i) => timer(i * 5).pipe(map(() => v)))
		)
		const out = source$.pipe(switchDebounce<string | null>(20))

		const result = await lastValueFrom(out.pipe(toArray()))
		// 'x' at t=0, null scheduled at t=25, stream completes soon after and flushes
		expect(result).toEqual(['x', null])
	})


	it('cancels pending null when a new non-null arrives before debounce elapses', async () => {
		const source$ = of('a', null, 'b').pipe(
			concatMap((v, i) => timer(i * 10).pipe(map(() => v)))
		)
		const out = source$.pipe(switchDebounce<string | null>(25))

		const result = await lastValueFrom(out.pipe(toArray()))
		expect(result).toEqual(['a', 'b']) // null is cancelled by 'b'
	})

	
	it('ignores consecutive nulls (second null does not reset the timer)', async () => {
		const source$ = of('a', null, null).pipe(
			concatMap((v, i) => timer(i * 10).pipe(map(() => v)))
		)
		const out = source$.pipe(switchDebounce<string | null>(15))

		const result = await lastValueFrom(out.pipe(toArray()))
		expect(result).toEqual(['a', null])
	})


	it('propagates source errors', async () => {
		const src = concat(of('ok'), throwError(() => new Error('boom')))
		const out = src.pipe(switchDebounce<string | null>(10))

		await expect(lastValueFrom(out)).rejects.toThrow('boom')
	})
})
