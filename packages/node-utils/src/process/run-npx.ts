import { execa } from 'execa'
import type { Options as ExecaOptions, ResultPromise } from 'execa'
import type { ArgSerializerOptions } from './args-serialize'
import { serializeArgs } from './args-serialize'

type PerKeyAdapter = (value: any) => string[]

export interface RunNpxOptions {
	serializer?: ArgSerializerOptions
	perKey?: Record<string, PerKeyAdapter>
	npxArgs?: string[]
	execa?: ExecaOptions
}

const defaultSerializer: ArgSerializerOptions = {}

export const runNpx = (
	packageName: string,
	cliOptions: Record<string, any> = {},
	options: RunNpxOptions = {},
): ResultPromise => {
	const {
		serializer = defaultSerializer,
		perKey = {},
		npxArgs = [],
		execa: execaOpts,
	} = options

	const adaptedArgs: string[] = []
	const passthrough: Record<string, any> = {}
	for (const [key, value] of Object.entries(cliOptions)) {
		if (perKey[key]) adaptedArgs.push(...perKey[key](value))
		else passthrough[key] = value
	}

	const genericArgs = serializeArgs(passthrough, serializer)

	return execa(
		'npx',
		[...npxArgs, packageName, ...adaptedArgs, ...genericArgs],
		execaOpts,
	)
}

export type ExecaChildProcess = ResultPromise
export type { ExecaOptions }

