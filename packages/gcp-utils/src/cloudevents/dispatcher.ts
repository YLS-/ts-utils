import { CloudEvent } from 'cloudevents'


export interface PubSubEvent {
	// TODO: type as PubsubMessage if needed
	message: {
		data: string	// base64 encoded JSON string
		attributes?: Record<string, string>
		messageId?: string
		publishTime?: string
		orderingKey?: string
	}
	subscription: string
}

// export interface PubSubPayload {
// 	message: PubsubMessage
// 	subscription: string
// }


export class CloudEventDispatcher {
	private _projectId: string
	// private _baseUrl: string

	constructor(projectId: string/*, baseUrl: string = 'http://localhost:5012'*/) {
		this._projectId = projectId
		// this._baseUrl = baseUrl
	}


	/**
	 * Send a Cloud Event request
	 * @param event - The Cloud Event to send (encoded in structured mode)
	 */
	public async sendCloudEvent<T>(event: CloudEvent<T>, targetUrl: string): Promise<Response> {
		const ceBody = event.cloneWith({
			time: event.time ?? new Date().toISOString()
		})

		const response = await fetch(targetUrl, {
			method: 'POST',
			headers: { 'content-type': 'application/cloudevents+json' },
			body: JSON.stringify(ceBody)
		})

		return response
	}


	/**
	 * Wraps a PubSub event in a Cloud Event and sends it
	 * @param topic - The PubSub topic to publish to
	 * @param data - The data to publish
	 * @returns The response from the Cloud Event dispatcher
	 */
	public async publishPubSubEvent(pubsubEvent: PubSubEvent, topic: string, targetUrl: string): Promise<Response> {
		const event: CloudEvent<PubSubEvent> = this._toStructuredCloudEvent(pubsubEvent, topic)
		const response = await this.sendCloudEvent(event, targetUrl)
		return response
	}


	// TODO: separate more cleanly the "PubSub / EventAr" parts from this;
	// TODO: this class should be ONLY a CloudEvent wrapper / sender service (actually it does very little)
	/**
	 * Wraps a PubSub event in a Cloud Event
	 * @param pubsubEvent - The PubSub event to convert
	 * @param topic - The PubSub topic to publish to
	 * @returns The Cloud Event
	 */
	private _toStructuredCloudEvent(pubsubEvent: PubSubEvent, topic: string): CloudEvent<PubSubEvent> {
		const { message } = pubsubEvent

		const event = new CloudEvent<PubSubEvent>({
			specversion: '1.0',
			type: 'google.cloud.pubsub.topic.v1.messagePublished',
			source: `//pubsub.googleapis.com/projects/${this._projectId}/topics/${topic}`,
			id: message.messageId ?? `ce-${topic}-${Math.random().toString(36).slice(2)}`,
			time: message.publishTime ?? new Date().toISOString(),
			data: pubsubEvent,
		})

		return event
	}

}
