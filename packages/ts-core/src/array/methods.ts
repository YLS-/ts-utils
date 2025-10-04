/**
 * Returns the first element of the array.
 * @param arr - The array to get the first element of.
 * @returns The first element of the array.
 */
export function first<T>(arr: T[]): T | null {
	return arr[0] ?? null
}

/**
 * Returns the last element of the array.
 * @param arr - The array to get the last element of.
 * @returns The last element of the array.
 */
export function last<T>(arr: T[]): T | null {
	return arr.at(-1) ?? null
}

/**
 * Returns a random element of the array.
 * @param arr - The array to get a random element of.
 * @returns A random element of the array.
 */
export function random<T>(arr: T[]): T {
	const idx: number = Math.floor(Math.random() * arr.length)
	return arr[idx]
}

/**
 * Swaps two elements of the array. Mutates the original array.
 * @param arr - The array to swap elements of.
 * @param i - The index of the first element to swap.
 * @param j - The index of the second element to swap.
 * @returns The array with the swapped elements.
 */
export function swap<T>(arr: T[], i: number, j: number): T[] {
	if ((i >= 0 && i < arr.length) && (j >= 0 && j < arr.length)) {
		[arr[i], arr[j]] = [arr[j], arr[i]]
	}
	return arr
}

/**
 * Splits the array into chunks of the given size. Does not mutate the original array.
 * @param arr - The array to split into chunks.
 * @param chunkSize - The size of each chunk.
 * @returns An array of chunks.
 */
export function chunk<T>(arr: T[], chunkSize: number): T[][] {
	const splitted: T[][] = []
	const arrCopy: T[] = [...arr]

	while (arrCopy.length) {
		const nextChunk: T[] = arrCopy.splice(0, chunkSize)
		splitted.push(nextChunk)
	}

	return splitted
}
