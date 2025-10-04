
/**
 * Sleeps for a given duration.
 * @param ms - The duration to sleep, in milliseconds.
 * @returns A Promise that always resolves.
 */
export function sleep$(ms: number): Promise<void> {
	return new Promise<void>((resolve, _) => setTimeout(() => resolve(), ms) )
}


/**
 * Sleeps for a random duration between a minimum and maximum value.
 * @param minTime - The minimum duration to sleep, in milliseconds.
 * @param maxTime - The maximum duration to sleep, in milliseconds.
 * @returns A Promise that always resolves.
 */
export async function randomPause(minTime: number, maxTime: number): Promise<void> {
	const delay: number = Math.random() * (maxTime - minTime) + minTime
	return sleep$(delay)
}
