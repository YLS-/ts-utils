import { MonoTypeOperatorFunction, Observable, ObservableInput, switchMap, from, take, throwIfEmpty, map } from "rxjs"


/**
 * Waits for an async side-effect (Promise or Observable) to resolve/emit once, before passing through the source value.
 * Acts like tap() but with a waiting effect - the source Observable is paused until the inner effect completes with at least one value.
 * A new source value emitted before the inner effect completes will cancel the waiting effect and trigger a new one.
 * @param effect - A side-effect async function that takes the source value and returns a Promise or Observable to await.
 * @returns A MonoTypeOperatorFunction that passes through source values.
 * @example
 * ```ts
 * // Wait for HTTP request to complete before continuing
 * source$.pipe(
 *   awaitEffect(value => fetch(`/api/log/${value}`))
 * ).subscribe(console.log)
 *
 * // Wait for Observable to emit before continuing
 * source$.pipe(
 *   awaitEffect(value => timer(1000)) // wait 1 second
 * ).subscribe(console.log)
 * ```
 */
export function awaitEffect<T>(effect: (value: T) => ObservableInput<unknown>): MonoTypeOperatorFunction<T> {
	return (source: Observable<T>) => source.pipe(
		switchMap(value => from(effect(value)).pipe(
			take(1),               // wait for first emission only
			map(() => value),      // then pass original value
			throwIfEmpty(() => new Error('Effect produced no first value'))
		))
	)
}
