/**
* Formats a numeric time interval into a string representation.
* @param value time interval in seconds
* @param millisecondsDigits number of digits for milliseconds value
*/
export function formatDuration(value: number, millisecondsDigits: number = 0): string {
	const date = new Date(0)
	date.setSeconds(value)
	const formatted_date = date.toISOString().substring(11, 19)

	if (millisecondsDigits > 0) {
		const ms = (value * 1000) % 1000
		return formatted_date + '.' + String(ms).substring(0, millisecondsDigits - 1)
	} else {
		return formatted_date
	}
}
