import { describe, expect, it, vi } from 'vitest'
import type { Message, PubSub, Topic } from '@google-cloud/pubsub'

import { buildAckMetadata, createJsonPublisher, decodeJsonMessage, publishJson } from '../../src/pubsub'

describe('publishJson', () => {
	it('publishes payloads with normalized attributes', async () => {
		const publishMessage = vi.fn(async () => '42')
		const topic = { publishMessage } as unknown as Topic

		const id = await publishJson(topic, { foo: 'bar' }, { attributes: { flag: true, optional: undefined } })

		expect(id).toBe('42')
		expect(publishMessage).toHaveBeenCalledWith(
			expect.objectContaining({
				attributes: { flag: 'true' },
			})
		)
	})

	it('rejects payloads bigger than configured limit', async () => {
		const topic = { publishMessage: vi.fn() } as unknown as Topic
		await expect(publishJson(topic, 'x'.repeat(1024), { maxBytes: 10 })).rejects.toThrow(/exceeds/)
	})
})

describe('createJsonPublisher', () => {
	it('reuses the underlying topic helper', async () => {
		const publishMessage = vi.fn(async () => 'id')
		const topic = { publishMessage } as unknown as Topic
		const pubsub = {
			topic: vi.fn(() => topic),
		} as unknown as PubSub

		const publish = createJsonPublisher(pubsub, 'demo', { attributes: { source: 'test' } })
		await publish({ foo: 'bar' })

		expect(pubsub.topic).toHaveBeenCalledWith('demo', expect.anything())
		expect(publishMessage).toHaveBeenCalledTimes(1)
	})
})

describe('decodeJsonMessage', () => {
	it('parses message buffer as json', () => {
		const message = { data: Buffer.from(JSON.stringify({ value: 1 })) } as Message
		const payload = decodeJsonMessage<{ value: number }>(message)
		expect(payload.value).toBe(1)
	})
})

describe('buildAckMetadata', () => {
	it('extracts ack details', () => {
		const meta = buildAckMetadata({
			ackId: 'abc',
			publishTime: new Date('2020-01-01'),
		} as unknown as Message)

		expect(meta).toEqual({ ackId: 'abc', publishedAt: new Date('2020-01-01') })
	})
})
