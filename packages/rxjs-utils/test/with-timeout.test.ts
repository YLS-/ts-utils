import { of, timer, map, lastValueFrom, toArray, TimeoutError, concat, throwError, Observable, ignoreElements, EmptyError } from 'rxjs'
import { describe, it, expect } from 'vitest'
import { withTimeout } from '../src'


describe('withTimeout', () => {
	it('emits normally when the first emission is within timeout', async () => {
		const source$: Observable<string> = timer(10).pipe(map(() => 'ok'))
		const out = withTimeout(source$, 20)

		await expect(lastValueFrom(out)).resolves.toBe('ok')
	})


	it('times out if the first emission is delayed beyond timeout duration', async () => {
		const source$ = timer(20).pipe(map(() => 'late'))
		const out = withTimeout(source$, 10)

		await expect(lastValueFrom(out)).rejects.toBeInstanceOf(TimeoutError)
	})


	it('does not timeout if the source completes without any emission within timeout', async () => {
		const source$ = timer(5).pipe(ignoreElements())
		const out = withTimeout(source$, 10)

		// lastValueFrom rejects with EmptyError if the source completes without any emission,
		// but this does not mean that `withTimeout` itself errored; this is just for testing purposes
		await expect(lastValueFrom(out as unknown as Observable<unknown>)).rejects.toBeInstanceOf(EmptyError)
	})


	it('passes through source values unchanged when first emission is on time', async () => {
		const source$ = of('a', 'b', 'c')
		const out = withTimeout(source$, 5)

		const result = await lastValueFrom(out.pipe(toArray()))
		expect(result).toEqual(['a', 'b', 'c'])
	})


	it('propagates source errors', async () => {
		const src = concat(of('ok'), throwError(() => new Error('boom')))
		const out = withTimeout(src, 50)

		await expect(lastValueFrom(out)).rejects.toThrow('boom')
	})
})
