import { CloudEvent, HTTP } from 'cloudevents'

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

export function toBinaryHttp(event: CloudEvent): HttpCloudEvent {
	const message = HTTP.binary(event)
	return {
		headers: flattenHeaders(message.headers),
		body: message.body,
	}
}

export function toStructuredHttp(event: CloudEvent): HttpCloudEvent {
	const message = HTTP.structured(event)
	return {
		headers: flattenHeaders(message.headers),
		body: message.body,
	}
}

export function parseHttpEvent(headers: HttpHeaders, body: unknown): CloudEvent<unknown> {
	return HTTP.toEvent({ headers, body })
}

export function isCloudEvent(input: unknown): input is CloudEvent {
	return input instanceof CloudEvent
}

function flattenHeaders(headers: Headers | Record<string, string>): Record<string, string> {
	const result: Record<string, string> = {}
	if (typeof (headers as Headers).forEach === 'function') {
		;(headers as Headers).forEach((value, key) => {
			result[key] = value
		})
		return result
	}
	return { ...(headers as Record<string, string>) }
}
