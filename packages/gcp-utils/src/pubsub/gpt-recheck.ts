import type { Message, PubSub, Topic } from '@google-cloud/pubsub'

export type AttributeValue = string | number | boolean | null | undefined
export type AttributesInput = Record<string, AttributeValue>

export interface PublishJsonOptions {
	attributes?: AttributesInput
	orderingKey?: string
	maxBytes?: number
}

const DEFAULT_MAX_BYTES = 9.5 * 1024 * 1024

export async function publishJson(
	topic: Topic,
	payload: unknown,
	options: PublishJsonOptions = {},
): Promise<string> {
	const data = Buffer.from(JSON.stringify(payload))
	const maxBytes = options.maxBytes ?? DEFAULT_MAX_BYTES
	if (data.byteLength > maxBytes) {
		throw new Error(`Pub/Sub message exceeds ${maxBytes} bytes`)
	}

	const messageId = await topic.publishMessage({
		data,
		attributes: normalizeAttributes(options.attributes),
		orderingKey: options.orderingKey,
	})

	return messageId
}

export function createJsonPublisher(pubsub: PubSub, topicName: string, defaults: PublishJsonOptions = {}) {
	return async (payload: unknown, overrides: PublishJsonOptions = {}) => {
		const topic = pubsub.topic(topicName, { batching: { maxBytes: overrides.maxBytes ?? defaults.maxBytes } })
		return publishJson(topic, payload, { ...defaults, ...overrides })
	}
}

export function decodeJsonMessage<T = unknown>(message: Pick<Message, 'data'>): T {
	const buffer = message.data
	if (!Buffer.isBuffer(buffer)) {
		throw new Error('Message data must be a Buffer')
	}
	return JSON.parse(buffer.toString('utf8')) as T
}

export interface AckMetadata {
	ackId: string
	publishedAt: Date
}

export function buildAckMetadata(message: Pick<Message, 'ackId' | 'publishTime'>): AckMetadata {
	return {
		ackId: message.ackId ?? 'unknown',
		publishedAt: message.publishTime ?? new Date(0),
	}
}

function normalizeAttributes(attributes?: AttributesInput) {
	if (!attributes) {
		return undefined
	}

	return Object.entries(attributes).reduce<Record<string, string>>((acc, [key, value]) => {
		if (value === undefined) {
			return acc
		}
		acc[key] = typeof value === 'string' ? value : JSON.stringify(value)
		return acc
	}, {})
}
