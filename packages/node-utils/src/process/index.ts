export * from './args-serialize'
export * from './run-npx'

type MaybePromise<T> = Promise<T> | T

type TtyLike = {
	isTTY?: boolean | null
}

export type SignalSubscription = {
	readonly promise: Promise<NodeJS.Signals>
	dispose(): void
}

export type InteractiveCheckOptions = {
	stdout?: TtyLike | null
	stderr?: TtyLike | null
	env?: NodeJS.ProcessEnv
}

export const withWorkingDirectory = async <T>(
	nextDirectory: string,
	fn: () => MaybePromise<T>,
): Promise<T> => {
	const initialDirectory = process.cwd()

	if (initialDirectory === nextDirectory) {
		return await Promise.resolve(fn())
	}

	process.chdir(nextDirectory)

	try {
		return await Promise.resolve(fn())
	} finally {
		process.chdir(initialDirectory)
	}
}

export const onceSignals = (
	signals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM'],
): SignalSubscription => {
	if (signals.length === 0) {
		throw new Error('Provide at least one signal')
	}

	const handlers: Array<[NodeJS.Signals, () => void]> = []
	let disposed = false

	const cleanup = (): void => {
		if (disposed) {
			return
		}

		disposed = true

		for (const [signal, handler] of handlers) {
			process.off(signal, handler)
		}

		handlers.length = 0
	}

	const promise = new Promise<NodeJS.Signals>((resolve) => {
		for (const signal of signals) {
			const handler = (): void => {
				cleanup()
				resolve(signal)
			}

			handlers.push([signal, handler])
			process.once(signal, handler)
		}
	})

	return {
		promise,
		dispose: cleanup,
	}
}

export const isInteractive = (
	options: InteractiveCheckOptions = {},
): boolean => {
	const stdout = options.stdout ?? process.stdout
	const stderr = options.stderr ?? process.stderr
	const env = options.env ?? process.env

	if (!stdout || !stderr) {
		return false
	}

	if (!stdout.isTTY || !stderr.isTTY) {
		return false
	}

	if (env.TERM === 'dumb') {
		return false
	}

	return env.CI !== 'true'
}

