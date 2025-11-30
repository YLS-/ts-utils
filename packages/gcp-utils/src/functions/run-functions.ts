import { runNpx, type ExecaChildProcess } from '@yohs/node-utils/process'

export interface FunctionsOptions {
	source: string
	target: string
	signatureType: 'http' | 'event' | 'cloudevent'
	port: number
}

export type FunctionsProcessFactory = (options: FunctionsOptions) => ExecaChildProcess

export const runFunctions: FunctionsProcessFactory = (options) =>
	runNpx(
		'functions-framework',
		{
			source: options.source,
			target: options.target,
			'signature-type': options.signatureType,
			port: options.port,
		},
		{
			npxArgs: ['--yes'],
			execa: { stdio: 'inherit' },
		},
	)

