import { dirname } from 'node:path'
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises'

type Json = string | number | boolean | null | Json[] | { [key: string]: Json }

export type WriteJsonFileOptions = {
	indent?: number
}

const isNodeError = (error: unknown): error is NodeJS.ErrnoException =>
	typeof error === 'object' && error !== null && 'code' in error

export const ensureDir = async (targetPath: string): Promise<void> => {
	await mkdir(targetPath, { recursive: true })
}

export const ensureFileDir = async (filePath: string): Promise<void> => {
	await ensureDir(dirname(filePath))
}

export const writeJsonFile = async (
	filePath: string,
	data: Json,
	options: WriteJsonFileOptions = {},
): Promise<void> => {
	await ensureFileDir(filePath)

	const indent = options.indent ?? 2
	const serialized = `${JSON.stringify(data, null, indent)}\n`

	await writeFile(filePath, serialized, 'utf8')
}

export const readJsonFile = async <T = Json>(filePath: string): Promise<T> => {
	try {
		const contents = await readFile(filePath, 'utf8')
		return JSON.parse(contents) as T
	} catch (error) {
		if (error instanceof SyntaxError) {
			throw new Error(
				`Failed to parse JSON from "${filePath}": ${error.message}`,
			)
		}

		if (isNodeError(error) && error.code === 'ENOENT') {
			throw new Error(`JSON file not found: "${filePath}"`)
		}

		if (error instanceof Error) {
			throw new Error(`Unable to read "${filePath}": ${error.message}`)
		}

		throw error
	}
}

export const pathExists = async (pathToCheck: string): Promise<boolean> => {
	try {
		await stat(pathToCheck)
		return true
	} catch (error) {
		if (isNodeError(error) && error.code === 'ENOENT') {
			return false
		}

		throw error
	}
}

