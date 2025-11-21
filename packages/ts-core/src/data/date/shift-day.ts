/**
 * Given any Date, returns a new Date set to midnight (00:00:00.000)
 * of the *previous* or *next* calendar day, in the local timezone.
 */
export function shiftDay(current: Date, direction: 'backward' | 'forward'): Date {
	// extract year, month, day from the incoming date…
	const year = current.getFullYear()
	const month = current.getMonth()    // zero-based!
	const day = current.getDate()

	// construct a new Date at (year, month, day+1) at 00:00:00
	const shiftedDay = (direction === 'backward') ? day - 1 : day + 1
	return new Date(year, month, shiftedDay, 0, 0, 0, 0)
}

export function addDays(date: Date, days: number): Date {
	// making a copy just in case
	const d = new Date(date)
	d.setDate(d.getDate() + days)
	return d
}

export function subtractDays(date: Date, days: number): Date {
	// making a copy just in case
	const d = new Date(date)
	d.setDate(d.getDate() - days)
	return d
}
