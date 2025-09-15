import { ObservableInput, Observable, timeout, from } from "rxjs"


/**
 * Creates an Observable that mirrors the source Observable,
 * or throws a `TimeoutError` if the source Observable doesn't emit or complete before the `timeOut`.
 * @param source - The source Observable.
 * @param timeOut - The timeOut in milliseconds.
 * @returns An Observable that emits the source value with a timeout condition.
 * @example
 * ```ts
 * // Source that emits after 500ms - will succeed
 * const fastSource$ = timer(500).pipe(map(() => 'fast value'))
 *
 * withTimeout(fastSource$, 1000).subscribe({
 *   next: console.log,
 *   error: err => console.error(err.message)
 * })
 * // Output: "fast value"
 *
 * // Source that emits after 2000ms - will timeout
 * const slowSource$ = timer(2000).pipe(map(() => 'slow value'))
 *
 * withTimeout(slowSource$, 1000).subscribe({
 *   next: console.log,
 *   error: err => console.error(err.message)
 * })
 * // Output: TimeoutError
 * ```
 */

export function withTimeout<T>(source: ObservableInput<T>, timeOut: number): Observable<T> {
	return from(source).pipe(timeout({ first: timeOut })) 	// throws TimeoutError by default
}
