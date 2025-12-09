import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

/** Absolute path to the current module's folder (works in ESM/CJS builds). */
export function moduleDir(metaUrl: string): string {
	// __dirname exists in CJS builds; in ESM we derive it from import.meta.url
	// _@ts-expect-error: __dirname is only defined in CJS, the typeof guard is fine
	return (typeof __dirname !== 'undefined') ? __dirname : dirname(fileURLToPath(metaUrl))
}

/** Resolve a file path relative to the module that calls this. */
export function resolveAsset(metaUrl: string, ...rel: string[]): string {
	return join(moduleDir(metaUrl), ...rel)
}


