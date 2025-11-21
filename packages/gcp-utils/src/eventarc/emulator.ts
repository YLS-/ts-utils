import chalk from 'chalk'

import { Message, PubSub, Subscription, Topic } from '@google-cloud/pubsub'
import { CloudEventDispatcher, PubSubEvent } from '../cloudevents/dispatcher'


export class EventarcEmulator {

	// private _projectId: string
	private _pubsub: PubSub
	private _dispatcher: CloudEventDispatcher


	constructor(projectId: string, pubsubClient: PubSub) {
		// this._projectId = projectId
		this._pubsub = pubsubClient
		this._dispatcher = new CloudEventDispatcher(projectId)
	}


	public async listTopics() {
		const [topics] = await this._pubsub.getTopics()
		console.log(`${chalk.red('[eventarc]')} Found ${chalk.yellow(topics.length)} topics`, topics.map(t => t.name))

		const [subs] = await this._pubsub.getSubscriptions()
		console.log(`${chalk.red('[eventarc]')} Found ${chalk.yellow(subs.length)} subscriptions`, subs.map(s => s.name))
	}


	private _bridgeSubName(topic: string): string {
		return `${topic}-bridge-sub`
	}


	private async _ensure(topicName: string) {
		console.log(`${chalk.red('[eventarc]')} Ensuring topic ${chalk.blue(topicName)} exists...`)

		const topic: Topic = this._pubsub.topic(topicName)
		const [topicExists] = await topic.exists()

		if (topicExists) {
			console.log(`${chalk.red('[eventarc]')} Topic ${chalk.blue(topicName)} already exists`)
		} else {
			console.log(`${chalk.red('[eventarc]')} Topic ${chalk.blue(topicName)} does not exist, creating...`)
			try {
				await topic.create()
				console.log(`${chalk.red('[eventarc]')} Topic ${chalk.blue(topicName)} created`)
			} catch (e: any) {
				if (e.code !== 6 /* ALREADY_EXISTS */) throw e
			}
		}

		const subName = this._bridgeSubName(topicName)
		const sub: Subscription = topic.subscription(subName)

		// delete and re-create subscription every time
		try { await sub.delete() }
		catch (error) {}

		try {
			await sub.create()
			console.log(`${chalk.red('[eventarc]')} Subscription ${chalk.blue(subName)} created`)
		} catch (e: any) {
			if (e.code !== 6) throw e
		}

		return { topic: topicName, subscription: subName }
	}


	private async _bootstrapRoute(topic: string, targetUrl: string) {
		const subName = this._bridgeSubName(topic)
		const sub: Subscription = this._pubsub.subscription(subName)

		sub.on('message', async (message: Message) => {
			// const time = Timestamp.fromDate(message.publishTime)
			// const timeFormatted = timestampTimeFormatted(time, true)
			// console.log(`${chalk.red('[eventarc]')} ${chalk.blue('(' + topic + ':' + message.id + ')')} Received PubSub message ${chalk.gray('(' + timeFormatted + ')')}`)

			// decode
			const buffer: Buffer = message.data
			const payload: any = JSON.parse(buffer.toString())

			// console.dir({
			// 	subscription: sub.name,
			// 	messageId: message.id,
			// 	publishTime: message.publishTime.toISOString(),
			// 	attributes: message.attributes,
			// 	data: payload
			// }, { depth: null, colors: true })

			// maps the received PubSub message to a PubSubEvent to re-publish wrapped in a CloudEvent
			const pubsubEvent: PubSubEvent = {
				message: {
					data: message.data.toString('base64'),
					attributes: message.attributes,
					messageId: message.id,
					publishTime: message.publishTime.toISOString(),
				},
				subscription: sub.name
			}

			try {
				// Send as *structured* CloudEvent JSON (what functions-framework accepts)
				const res: Response = await this._dispatcher.publishPubSubEvent(pubsubEvent, topic)
				if (!res.ok) throw new Error(`${res.status} ${await res.text()}`)
				message.ack()
			} catch (e) {
				console.error(`${chalk.red('[eventarc]')} ❌ Forward error:`, e)
				// message.nack()
			}
		})

		console.log(`${chalk.red('[eventarc]')} Set up route for ${chalk.blue(topic)} → ${chalk.gray(targetUrl)}`)
	}


	public async addRoute(topic: string, targetUrl: string) {
		await this._ensure(topic)
		await this._bootstrapRoute(topic, targetUrl)
	}

}
