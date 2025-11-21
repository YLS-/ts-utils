import type { CloudEvent } from 'cloudevents'

export type EventarcFilterValue = string | ReadonlyArray<string>
export type EventarcFilter = Record<string, EventarcFilterValue>

export interface MatchOptions {
	caseInsensitive?: boolean
}

export function matchesEventarcFilter<T>(event: CloudEvent<T>, filter: EventarcFilter, options: MatchOptions = {}): boolean {
	const comparator = options.caseInsensitive ? toLower : passthrough

	return Object.entries(filter).every(([key, expected]) => {
		const value = getAttribute(event, key)
		if (value === undefined || value === null) {
			return false
		}
		const actual = comparator(String(value))
		const accepted = Array.isArray(expected) ? expected : [expected]
		return accepted.some((candidate) => matchValue(actual, comparator(candidate)))
	})
}

export function pickEventarcContext<T>(event: CloudEvent<T>) {
	return {
		type: event.type,
		source: event.source,
		subject: event.subject,
		channel: getAttribute(event, 'channel') as string | undefined,
		location: getAttribute(event, 'location') as string | undefined,
		service: getAttribute(event, 'serviceName') as string | undefined,
	}
}

function getAttribute<T>(event: CloudEvent<T>, key: string): unknown {
	if (key in event) {
		return (event as Record<string, unknown>)[key]
	}
	const extensions = (event as Record<string, unknown>).extensions as Record<string, unknown> | undefined
	return extensions?.[key]
}

function matchValue(actual: string, expected: string): boolean {
	if (expected.includes('*')) {
		const pattern = new RegExp('^' + expected.split('*').map(escapeRegex).join('.*') + '$')
		return pattern.test(actual)
	}
	return actual === expected
}

const SPECIAL_REGEX_CHARS = /[.*+?^${}()|[\]\\]/g

function escapeRegex(input: string): string {
	return input.replace(SPECIAL_REGEX_CHARS, '\\$&')
}

const toLower = (value: string) => value.toLowerCase()
const passthrough = (value: string) => value
