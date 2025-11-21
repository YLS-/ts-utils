import { describe, expect, it } from 'vitest'
import { CloudEvent } from 'cloudevents'

import { matchesEventarcFilter, pickEventarcContext } from '../../src/eventarc'

describe('matchesEventarcFilter', () => {
	it('matches wildcard filters', () => {
		const event = new CloudEvent({ type: 'google.cloud.pubsub.topic.v1.messagePublished', source: '//pubsub.googleapis.com', subject: 'projects/demo/topics/topic-1', extensions: { location: 'us-central1' } })
		const result = matchesEventarcFilter(event, {
			type: 'google.cloud.*',
			subject: '*topic-1',
			location: ['us-central1', 'europe-west1'],
		})
		expect(result).toBe(true)
	})

	it('fails when attribute missing', () => {
		const event = new CloudEvent({ type: 'demo', source: 'source' })
		expect(matchesEventarcFilter(event, { location: 'us' })).toBe(false)
	})
})

describe('pickEventarcContext', () => {
	it('extracts useful attributes', () => {
		const event = new CloudEvent({
			type: 'demo',
			source: 'source',
			data: {},
			extensions: { channel: 'projects/1/locations/1/channels/foo', serviceName: 'run', location: 'us-central1' },
		})

		expect(pickEventarcContext(event)).toEqual({
			type: 'demo',
			source: 'source',
			subject: undefined,
			channel: 'projects/1/locations/1/channels/foo',
			location: 'us-central1',
			service: 'run',
		})
	})
})
