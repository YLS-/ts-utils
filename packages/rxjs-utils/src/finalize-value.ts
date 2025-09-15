import { MonoTypeOperatorFunction, Observable, defer, tap, finalize } from "rxjs"


/**
 * Caches the last emitted value and passes it to the finalize `callback` when the Observable completes or errors.
 * @param callback - The callback function to call with the last emitted value.
 * @returns A MonoTypeOperatorFunction that passes through all values unchanged.
 * @example
 * ```ts
 * of(1, 2, 3).pipe(
 *   finalizeWithValue(lastValue => console.log('Last value was:', lastValue))
 * ).subscribe()
 * // Output: "Last value was: 3"
 * ```
 */
export function finalizeWithValue<T>(callback: (value: T) => void): MonoTypeOperatorFunction<T>  {
	return (source: Observable<T>) => defer(() => {
		let lastValue: T

		return source.pipe(
			tap(value => lastValue = value),
			finalize(() => callback(lastValue))
		)
	})
}
