import { of, lastValueFrom, toArray } from 'rxjs'
import { tapOnce } from '../src'
import { describe, it, expect, vi } from 'vitest'


describe('tapOnce', () => {
	it('calls side-effect only for the first item and lets all items through', async () => {
	  const spy = vi.fn()
	  const out = of('a', 'b', 'c').pipe(tapOnce(spy))

	  // Drain the stream to completion (collect all values)
	  const result = await lastValueFrom(out.pipe(toArray()))

	  expect(result).toEqual(['a', 'b', 'c'])      	// nothing got dropped
	  expect(spy).toHaveBeenCalledTimes(1)   			// side-effect fired once
	  expect(spy).toHaveBeenCalledWith('a')    		// ...on the first value
	})


	it('is per-subscription (fires once each subscribe)', async () => {
		const spy = vi.fn()
		const src = of('a', 'b', 'c')
		const out = src.pipe(tapOnce(spy))

		await lastValueFrom(out.pipe(toArray()))
		await lastValueFrom(out.pipe(toArray()))  	// second, independent subscription

		expect(spy).toHaveBeenCalledTimes(2)     		// once per subscription
		expect(spy).toHaveBeenNthCalledWith(1, 'a')
		expect(spy).toHaveBeenNthCalledWith(2, 'a')
	})
})
