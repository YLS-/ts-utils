// Firebase
import type { TimestampLike } from './timestamp-like'


export function timestampsDifference(t1: TimestampLike, t2: TimestampLike): number {
	return (t1.seconds - t2.seconds) + (t1.nanoseconds - t2.nanoseconds) / (10 ** 9)
}


export function timestampDateFormatted(timestamp: TimestampLike): string {
	const date: Date = timestamp.toDate()

	const formatter = new Intl.DateTimeFormat('fr-FR', {
		dateStyle: 'medium'
	})

	return formatter.format(date) //date.toDateString() //`${date.getHours()}:${date.getMinutes()}`
}



export function timestampTimeFormatted(timestamp: TimestampLike, seconds: boolean = false): string {
	const date: Date = timestamp.toDate()
	return date.toLocaleTimeString('fr-FR', { hour12: false, hour: '2-digit', minute: '2-digit', second: seconds ? '2-digit' : undefined })
}


// TODO: just streamline as "relative time formatter"

export function timestampDaysAgo(timestamp: TimestampLike): number {
	const date: Date = timestamp.toDate()
	const now = new Date()
	const diffTime: number = Math.abs(now.getTime() - date.getTime())
	const diffDays: number = Math.floor(diffTime / (1000 * 60 * 60 * 24))
	return diffDays
}


export function timestampTimeAgoFormatted(timestamp: TimestampLike): string {
	const date: Date = timestamp.toDate()
	const now = new Date()
	const diffTime: number = Math.abs(now.getTime() - date.getTime())

	const diffDays: number = Math.floor(diffTime / (1000 * 60 * 60 * 24))
	if (diffDays >= 1) {
		return `${diffDays} day` + ((diffDays > 1) ? 's' : '')
	}

	const diffHours: number = Math.floor(diffTime / (1000 * 60 * 60))
	if (diffHours >= 1) {
		return `${diffHours} hour` + ((diffHours > 1) ? 's' : '')
	}

	const diffMinutes: number = Math.floor(diffTime / (1000 * 60))
	return `${diffMinutes} minute` + ((diffMinutes > 1) ? 's' : '')
}
