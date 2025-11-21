import { describe, expect, it } from 'vitest'
import { CloudEvent } from 'cloudevents'

import { buildCloudEvent, parseHttpEvent, toBinaryHttp, toStructuredHttp } from '../../src/cloudevents'

describe('buildCloudEvent', () => {
	it('creates a CloudEvent with custom extensions', () => {
		const event = buildCloudEvent({
			type: 'com.demo.test',
			source: '/tests',
			subject: 'resource',
			data: { ping: true },
			extensions: { foo: 'bar' },
		})

		expect(event).toBeInstanceOf(CloudEvent)
		expect(event.type).toBe('com.demo.test')
		expect((event as Record<string, unknown>).foo).toBe('bar')
	})
})

describe('HTTP helpers', () => {
	it('serializes and parses binary messages', () => {
		const event = new CloudEvent({ type: 'demo', source: 'test', data: { ok: true } })
		const message = toBinaryHttp(event)
		const parsed = parseHttpEvent(message.headers, message.body)
		expect(parsed.id).toBe(event.id)
	})

	it('serializes structured messages', () => {
		const event = new CloudEvent({ type: 'demo', source: 'test', data: 'payload' })
		const message = toStructuredHttp(event)
		const parsed = parseHttpEvent(message.headers, message.body)
		expect(parsed.data).toBe('payload')
	})
})
