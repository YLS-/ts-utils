import { EventEmitter } from 'node:events'
import { vi } from 'vitest'

export interface BuildEndPayload {
	errors: Array<Record<string, unknown>>
	warnings: Array<Record<string, unknown>>
}

type BuildHook<TArgs extends any[] = []> = (...args: TArgs) => void | Promise<void>

export const createMockBuild = () => {
	let onStartHook: BuildHook | undefined
	let onEndHook: BuildHook<[BuildEndPayload]> | undefined

	return {
		initialOptions: { outfile: 'dist/index.js' },
		onStart(cb: BuildHook) {
			onStartHook = cb
		},
		onEnd(cb: BuildHook<[BuildEndPayload]>) {
			onEndHook = cb
		},
		async triggerStart() {
			await onStartHook?.()
		},
		async triggerEnd(result: Partial<BuildEndPayload> = {}) {
			const payload: BuildEndPayload = {
				errors: [],
				warnings: [],
				...result,
			}
			await onEndHook?.(payload)
		},
	}
}

export class FakeProcess extends EventEmitter {
	kill = vi.fn((_signal?: string) => {
		/* noop */
	})
}

export const consoleMocks = {
	updateStatus: vi.fn(),
	getWatchMode: vi.fn(() => false),
	startPersistentSpinner: vi.fn(),
	stopPersistentSpinner: vi.fn(),
	startSpinner: vi.fn(),
	stopSpinner: vi.fn(),
}

vi.mock('@yohs/node-utils/console', () => consoleMocks)

const isViMock = (fn: unknown): fn is ReturnType<typeof vi.fn> => {
	return typeof fn === 'function' && 'mockClear' in fn
}

export const resetConsoleMocks = () => {
	Object.values(consoleMocks).forEach((mockFn) => {
		if (isViMock(mockFn)) mockFn.mockClear()
	})
	consoleMocks.getWatchMode.mockReturnValue(false)
}

