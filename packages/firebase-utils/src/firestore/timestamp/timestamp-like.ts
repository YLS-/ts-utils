// Works with both admin and client Timestamp
export interface TimestampLike {
	seconds: number
	nanoseconds: number
	toMillis(): number
	toDate(): Date
}
