import { defer, MonoTypeOperatorFunction, Observable, tap } from "rxjs"


/**
 * Calls the side-effect function `fn` on the first emission, then never again.
 * @param fn - The side-effect function.
 * @returns A MonoTypeOperatorFunction.
 */
export function tapOnce<T>(fn: (value: T) => void): MonoTypeOperatorFunction<T> {
	return (source: Observable<T>) => defer(() => {
		// new flag per subscription
		let called = false
		
		return source.pipe(
			tap(v => {
				if (!called) {
				  called = true
				  fn(v)
				}
			})
		)}
	)
}
