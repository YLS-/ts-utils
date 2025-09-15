import { MonoTypeOperatorFunction, Observable, timeout } from "rxjs"


/**
 * Convenience version of `timeout` that does nothing if passed `null`.
 * @param after - The optional timeout duration in milliseconds.
 * @returns A MonoTypeOperatorFunction.
 */
export function timeoutOptional<T>(after: number | null): MonoTypeOperatorFunction<T> {
	return (source: Observable<T>) => (after !== null) ? source.pipe(timeout(after)) : source
}
