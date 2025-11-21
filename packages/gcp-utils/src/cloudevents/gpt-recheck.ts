import { CloudEvent, HTTP } from 'cloudevents'
import type { CloudEventV1 } from 'cloudevents'

export interface BuildCloudEventOptions<T> {
	type: string
	source: string
	id?: string
	subject?: string
	data?: T
	partitionKey?: string
	dataContentType?: string
	dataSchema?: string
	extensions?: Record<string, unknown>
}

export function buildCloudEvent<T>(options: BuildCloudEventOptions<T>): CloudEvent<T> {
	const extensions = { ...(options.extensions ?? {}) }
	if (options.partitionKey !== undefined) {
		extensions.partitionkey = options.partitionKey
	}

	return new CloudEvent<T>({
		id: options.id,
		source: options.source,
		subject: options.subject,
		type: options.type,
		data: options.data,
		datacontenttype: options.dataContentType,
		dataschema: options.dataSchema,
		...extensions,
	})
}

export type HttpHeaders = Record<string, string | readonly string[] | undefined>

export interface HttpCloudEvent {
	headers: Record<string, string>
	body: unknown
}

export function toBinaryHttp<T>(event: CloudEvent<T>): HttpCloudEvent {
	const message = HTTP.binary(event)
	return {
		headers: flattenHeaders(message.headers),
		body: message.body,
	}
}

export function toStructuredHttp<T>(event: CloudEvent<T>): HttpCloudEvent {
	const message = HTTP.structured(event)
	return {
		headers: flattenHeaders(message.headers),
		body: message.body,
	}
}

export function parseHttpEvent(headers: HttpHeaders, body: unknown): CloudEvent<unknown> {
	const normalized = normalizeHttpHeaders(headers)
	const eventOrEvents = HTTP.toEvent({ headers: normalized, body })
	const payload = Array.isArray(eventOrEvents) ? eventOrEvents[0] : eventOrEvents
	return new CloudEvent(payload as CloudEventV1<unknown>)
}

export function isCloudEvent(input: unknown): input is CloudEvent {
	return input instanceof CloudEvent
}

function flattenHeaders(headers: unknown): Record<string, string> {
	const result: Record<string, string> = {}
	if (headers && typeof (headers as Headers).forEach === 'function') {
		;(headers as Headers).forEach((value, key) => {
			result[key] = value
		})
		return result
	}

	if (headers && typeof (headers as Iterable<[string, string]>)[Symbol.iterator] === 'function') {
		for (const [key, value] of headers as Iterable<[string, string]>) {
			result[key] = value
		}
		return result
	}

	if (headers && typeof headers === 'object') {
		for (const [key, value] of Object.entries(headers as Record<string, string>)) {
			result[key] = value
		}
	}

	return result
}

function normalizeHttpHeaders(headers: HttpHeaders): Record<string, string | string[]> {
	const result: Record<string, string | string[]> = {}
	for (const [key, value] of Object.entries(headers)) {
		if (value === undefined) {
			continue
		}
		result[key] = isStringArray(value) ? [...value] : value
	}
	return result
}

function isStringArray(value: unknown): value is readonly string[] {
	return Array.isArray(value)
}
