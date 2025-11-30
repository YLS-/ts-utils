import { createRequire } from 'node:module'
import type { Plugin } from 'esbuild'
import { runProcessPlugin, type ProcessPluginOptions } from './run-process'

// Functions framework process factory
import type { FunctionsOptions, FunctionsProcessFactory } from '@yohs/gcp-utils/functions'

// lazy require
const requireModule = createRequire(import.meta.url)
let cachedRunner: FunctionsProcessFactory | undefined

const resolveRunFunctions = (): FunctionsProcessFactory => {
	if (cachedRunner) {
		return cachedRunner
	}

	try {
		const mod = requireModule('@yohs/gcp-utils/functions') as {
			runFunctions: FunctionsProcessFactory
		}

		cachedRunner = mod.runFunctions
		return cachedRunner
	} catch (error) {
		throw new Error('runFunctionsPlugin requires @yohs/gcp-utils. Install it in your project to enable this plugin.',
			{ cause: error instanceof Error ? error : undefined },
		)
	}
}

export type RunFunctionsPluginOptions =
	Omit<ProcessPluginOptions, 'runner'> &
	Omit<FunctionsOptions, 'source'>

export const runFunctionsPlugin = (options: RunFunctionsPluginOptions): Plugin =>
	runProcessPlugin({
		...options,
		runner: (filePath) => resolveRunFunctions()({ ...options, source: filePath }),
	})

export type { FunctionsOptions } from '@yohs/gcp-utils/functions'
