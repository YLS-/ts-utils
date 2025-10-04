import { Observable, OperatorFunction, filter } from "rxjs"


/**
 * Skips `null` and `undefined` values from the source Observable.
 * @returns A new Observable that emits non-null values.
 * @example
 * ```ts
 * of(1, null, 2, undefined, 3).pipe(skipNull()).subscribe(console.log)
 * // Output: 1, 2, 3
 * ```
 */
export function skipNull<T>(): OperatorFunction<T, NonNullable<T>> {
	return (source: Observable<T>) => source.pipe(
		filter((value: T): value is NonNullable<T> => value !== null && value !== undefined)
	)
}
