import { of, timer, concat, throwError, lastValueFrom, toArray, map, concatMap, Observable, TimeoutError } from 'rxjs'
import { describe, it, expect } from 'vitest'
import { timeoutOptional } from '../src'


describe('timeoutOptional', () => {
	it('returns the original Observable when duration is null', () => {
		const source$: Observable<string> = of('a', 'b', 'c')
		const out = source$.pipe(timeoutOptional<string>(null))
		expect(out).toBe(source$)
	})


	it('passes through values unchanged when duration is null (no timeout)', async () => {
		const source$: Observable<string> = of('a', 'b', 'c').pipe(
			concatMap((v, i) => timer(i * 5).pipe(map(() => v)))
		)
		const out = source$.pipe(timeoutOptional<string>(null))

		const result = await lastValueFrom(out.pipe(toArray()))
		expect(result).toEqual(['a', 'b', 'c'])
	})


	it('emits normally when all gaps are <= timeout duration', async () => {
		const source$ = of('a', 'b', 'c').pipe(
			concatMap((v, i) => timer(i * 5).pipe(map(() => v))) // 0, 5, 10
		)
		const out = source$.pipe(timeoutOptional<string>(15))

		const result = await lastValueFrom(out.pipe(toArray()))
		expect(result).toEqual(['a', 'b', 'c'])
	})


	it('times out if the first emission is delayed longer than timeout duration', async () => {
		const source$ = timer(10).pipe(map(() => 'x')) // first at ~10ms
		const out = source$.pipe(timeoutOptional<string>(5))

		await expect(lastValueFrom(out)).rejects.toBeInstanceOf(TimeoutError)
	})


	it('times out when a gap between emissions exceeds timeout duration', async () => {
		const source$ = of('a', 'b').pipe(
			concatMap((v, i) => timer(i === 0 ? 0 : 15).pipe(map(() => v))) // gap ~15ms
		)
		const out = source$.pipe(timeoutOptional<string>(10))

		await expect(lastValueFrom(out)).rejects.toBeInstanceOf(TimeoutError)
	})

	
	it('propagates source errors', async () => {
		const src = concat(of('ok'), throwError(() => new Error('boom')))
		const out = src.pipe(timeoutOptional<string>(50))

		await expect(lastValueFrom(out)).rejects.toThrow('boom')
	})
})
