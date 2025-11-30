import { Socket } from 'node:net'
import http from 'node:http'
import https from 'node:https'


const frames = ['⠋','⠙','⠹','⠸','⠼','⠴','⠦','⠧','⠇','⠏']

function parseTcp(addr: string) {
	const match = addr.match(/^tcp:(.+):(\d+)$/)
	if (!match) throw new Error(`Invalid TCP address: ${addr}`)
	return { host: match[1], port: Number(match[2]) }
}

function isTcpOpen(host: string, port: number, timeout = 800): Promise<boolean> {
	return new Promise(resolve => {
		const socket = new Socket()
		let settled = false

		socket.setTimeout(timeout)
		socket.once('connect', () => { settled = true; socket.destroy(); resolve(true) })
		socket.once('timeout', () => { if (!settled) { settled = true; socket.destroy(); resolve(false) } })
		socket.once('error', () => { if (!settled) { settled = true; resolve(false) } })
		socket.connect(port, host)
	})
}

function isHttpReady(url: string, timeout = 1000): Promise<boolean> {
	return new Promise(resolve => {
		const httpLib = url.startsWith('https') ? https : http

		const req = httpLib.request(url, { method: 'HEAD', timeout }, res => {
			resolve((res.statusCode ?? 500) < 500) // treat 2xx/3xx/4xx as “up”
		})

		req.on('timeout', () => { req.destroy(); resolve(false) })
		req.on('error', () => resolve(false))
		req.end()
	})
}

export async function waitForPubSubEmulator(pubsubAddr: string, targetUrl: string) {
	const { host, port } = parseTcp(pubsubAddr)
	let i = 0

	while (true) {
		const [pubsubUp, targetUp] = await Promise.all([
			isTcpOpen(host, port, 300),
			isHttpReady(targetUrl, 300),
		])
		const spinner = frames[i++ % frames.length]
		const statusSymbol = (isReady: boolean) => isReady ? '✅' : '…'
		const line = `${spinner} Pub/Sub (emulator): ${statusSymbol(pubsubUp)}  |  Target (functions-framework): ${statusSymbol(targetUp)}`
		process.stdout.write(`\r\x1b[2K${line}`)
		if (pubsubUp && targetUp) {
			process.stdout.write(`\r\x1b[2K✅ Pub/Sub and Target are ready\n`)
			return
		}
		await new Promise(r => setTimeout(r, 500))
	}
}
