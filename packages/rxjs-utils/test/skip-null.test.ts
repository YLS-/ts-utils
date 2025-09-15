import { of, lastValueFrom, toArray, concat, throwError, Observable } from 'rxjs'
import { skipNull } from '../src'
import { describe, it, expect, expectTypeOf } from 'vitest'


describe('skipNull', () => {
	it('filters out null and undefined, and passes through other values', async () => {
		const out = of('a', null, 'b', undefined, 'c').pipe(skipNull())

		const result = await lastValueFrom(out.pipe(toArray()))
		expect(result).toEqual(['a', 'b', 'c'])
	})


	it('does not drop other falsy values (false, 0, "")', async () => {
		const out = of(null, undefined, false, 0, '').pipe(skipNull())

		const result = await lastValueFrom(out.pipe(toArray()))
		expect(result).toEqual([false, 0, ''])
	})


	it('emits nothing when all values are nullish (lastValueFrom rejects)', async () => {
		const out = of(null, undefined).pipe(skipNull())

		await expect(lastValueFrom(out)).rejects.toBeInstanceOf(Error)
	})


	it('propagates source errors', async () => {
		const src = concat(of(null), throwError(() => new Error('boom')))
		const out = src.pipe(skipNull())

		await expect(lastValueFrom(out)).rejects.toThrow('boom')
	})


	it('narrows the output type to NonNullable<T>', () => {
		const src: Observable<string | null | undefined> = of('x', null, undefined)
		const out = src.pipe(skipNull())

		expectTypeOf(out).toEqualTypeOf<Observable<string>>()
	})
})
