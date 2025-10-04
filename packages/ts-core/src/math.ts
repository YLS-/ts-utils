/**
 * Math utilities
 */


/**
 * Rounds a number to a given number of decimal places.
 * @param x - A floating point number.
 * @param decimals - The number of decimal places to round to.
 * @returns The rounded number.
 */
export function round(x: number, decimals: number): number {
	const e = Math.pow(10, decimals)
	return Math.round((x + Number.EPSILON) * e) / e
}


/**
 * Clamps a value between a minimum and maximum value.
 * @param value - The value to clamp.
 * @param min - The minimum value.
 * @param max - The maximum value.
 * @returns The clamped value.
 */
export function clamp(value: number, min: number, max: number): number {
	return Math.max(min, Math.min(max, value))
}



/**
 * Applies the sigmoid function to a number.
 * @param x - The number to apply the sigmoid function to
 * @returns The sigmoid of the number (0-1)
 */
export function sigmoid(x: number): number {
	return 1 / (1 + Math.exp(-x))
}





