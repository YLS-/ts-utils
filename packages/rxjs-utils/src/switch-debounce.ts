import { MonoTypeOperatorFunction, Observable, of, switchMap, delay, distinctUntilChanged } from "rxjs"


/**
 * Switches immediately to the latest source value,
 * but only switches to `null` after a debounce time has elapsed.
 * This emulates a "delayed cancellation" behavior.
 * @param debounceTime - The debounce time in milliseconds.
 * @returns A MonoTypeOperatorFunction.
 * @example
 * ```ts
 * // Fast sequence where null gets replaced before debounce completes
 * // (emits 'a', 'b', null, 'c' in 500ms intervals)
 * const source$ = of('a', 'b', null, 'c').pipe(
 *   concatMap((value, index) => timer(index * 500).pipe(map(() => value)))
 * )
 *
 * source$.pipe(switchDebounce(1000)).subscribe(console.log)
 * // At t=0ms: receives 'a', outputs 'a' immediately
 * // At t=500ms: receives 'b', outputs 'b' immediately
 * // At t=1000ms: receives null, starts 1000ms debounce timer
 * // At t=1500ms: receives 'c', cancels null timer, outputs 'c' immediately
 * // Output: 'a', 'b', 'c' (null was ignored because 'c' arrived before debounce)
 * ```
 */
export function switchDebounce<T>(debounceTime: number): MonoTypeOperatorFunction<T> {
	return (source: Observable<T>) => source.pipe(
		// Suppress consecutive nulls so a second null does not reset the timer
		distinctUntilChanged((prev, curr) => (prev === null && curr === null)),
		// value === null means that the previous value has been "cancelled",
		// but the stream will output null only after debounceTime;
		// if a new, non-null value comes in, the previous null is cancelled
		switchMap(value => of(value).pipe(delay(value === null ? debounceTime : 0)))
	)
}
