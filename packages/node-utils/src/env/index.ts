const hasOwn = Object.prototype.hasOwnProperty

export type EnvReadOptions<T> = {
	defaultValue?: T
	required?: boolean
}

const truthyValues = new Set(['1', 'true', 'yes', 'on'])
const falsyValues = new Set(['0', 'false', 'no', 'off'])

const normalize = (value?: string | null): string | undefined => {
	if (value == null) {
		return undefined
	}

	const trimmed = value.trim()

	return trimmed.length === 0 ? undefined : trimmed
}

const resolveMissing = <T>(
	key: string,
	options: EnvReadOptions<T>,
): T | undefined => {
	if (hasOwn.call(options, 'defaultValue')) {
		return options.defaultValue
	}

	if (options.required) {
		throw new Error(`Missing required env var "${key}"`)
	}

	return undefined
}

export const readEnvString = (
	key: string,
	options: EnvReadOptions<string> = {},
): string | undefined => {
	const normalized = normalize(process.env[key])

	if (normalized === undefined) {
		return resolveMissing(key, options)
	}

	return normalized
}

export const readEnvNumber = (
	key: string,
	options: EnvReadOptions<number> = {},
): number | undefined => {
	const normalized = normalize(process.env[key])

	if (normalized === undefined) {
		return resolveMissing(key, options)
	}

	const parsed = Number(normalized)

	if (!Number.isFinite(parsed)) {
		throw new Error(`Env var "${key}" must be a finite number`)
	}

	return parsed
}

export const readEnvBoolean = (
	key: string,
	options: EnvReadOptions<boolean> = {},
): boolean | undefined => {
	const normalized = normalize(process.env[key])

	if (normalized === undefined) {
		return resolveMissing(key, options)
	}

	const lowered = normalized.toLowerCase()

	if (truthyValues.has(lowered)) {
		return true
	}

	if (falsyValues.has(lowered)) {
		return false
	}

	throw new Error(
		`Env var "${key}" must be a boolean-like value (true/false/1/0/yes/no)`,
	)
}

export const readEnvJson = <T = unknown>(
	key: string,
	options: EnvReadOptions<T> = {},
): T | undefined => {
	const normalized = normalize(process.env[key])

	if (normalized === undefined) {
		return resolveMissing(key, options)
	}

	try {
		return JSON.parse(normalized) as T
	} catch (error) {
		if (error instanceof Error) {
			throw new Error(
				`Env var "${key}" must contain valid JSON (${error.message})`,
			)
		}

		throw new Error(`Env var "${key}" must contain valid JSON`)
	}
}

