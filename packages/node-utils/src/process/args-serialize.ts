type Primitive = string | number | boolean
type JsonLike = Primitive | Primitive[] | Record<string, any> | null | undefined

export interface ArgSerializerOptions {
	style?: 'equals' | 'space'
	booleanStyle?: 'flag' | 'assign'
	keepFalse?: boolean
	negationPrefix?: 'no-' | false
	repeatStyle?: 'repeat' | 'csv'
	positionalKey?: string
	allowShort?: boolean
	aliases?: Record<string, string | { short?: string; long?: string }>
	keyTransformer?: (key: string) => string
	order?: 'alpha' | 'preserve'
	nestedSeparator?: string
}

const defaultKeyTransform = (k: string): string =>
	k
		.replace(/[_\s]+/g, '-')
		.replace(/([a-z0-9])([A-Z])/g, '$1-$2')
		.replace(/\.+/g, '-')
		.toLowerCase()

const flatten = (
	obj: Record<string, any>,
	sep: string,
	prefix = '',
): Record<string, JsonLike> => {
	const out: Record<string, JsonLike> = {}

	for (const [k, v] of Object.entries(obj)) {
		const key = prefix ? `${prefix}${sep}${k}` : k
		if (v && typeof v === 'object' && !Array.isArray(v)) {
			Object.assign(out, flatten(v, sep, key))
		} else {
			out[key] = v as JsonLike
		}
	}

	return out
}

const aliasFor = (
	key: string,
	opt: ArgSerializerOptions,
): { name: string; isShort: boolean } => {
	const map = opt.aliases ?? {}
	const a = map[key]

	if (!a) return { name: key, isShort: false }

	if (typeof a === 'string') {
		return { name: a, isShort: a.length === 1 }
	}

	const picked = opt.allowShort && a.short ? a.short : a.long ?? key
	const isShort = !!(opt.allowShort && a.short && picked === a.short)
	return { name: picked, isShort }
}

export const serializeArgs = (
	args: Record<string, JsonLike>,
	config: ArgSerializerOptions = {},
): string[] => {
	const {
		style = 'equals',
		booleanStyle = 'flag',
		keepFalse = false,
		negationPrefix = 'no-',
		repeatStyle = 'repeat',
		positionalKey = '_',
		allowShort = false,
		aliases = {},
		keyTransformer = defaultKeyTransform,
		order = 'preserve',
		nestedSeparator = '.',
	} = config

	const positional = args[positionalKey]
	const base: Record<string, JsonLike> = { ...args }
	delete base[positionalKey]

	const flat = flatten(base, nestedSeparator)
	const entries = Object.entries(flat)
	if (order === 'alpha') entries.sort(([a], [b]) => a.localeCompare(b))

	const argv: string[] = []

	for (const [rawKey, rawVal] of entries) {
		if (rawVal == null) continue

		const keyCore = keyTransformer(rawKey)
		const { name, isShort } = aliasFor(keyCore, {
			...config,
			aliases,
			allowShort,
		})
		const prefix = isShort ? '-' : '--'
		const flag = `${prefix}${name}`

		const pushKV = (val: Primitive) => {
			if (style === 'equals') argv.push(`${flag}=${String(val)}`)
			else argv.push(flag, String(val))
		}

		const pushFlagTrue = () => {
			if (booleanStyle === 'assign') pushKV(true)
			else argv.push(flag)
		}

		const pushFlagFalse = () => {
			if (!keepFalse) return

			if (negationPrefix && !isShort) {
				const neg = `--${negationPrefix}${name}`
				if (style === 'equals' && booleanStyle === 'assign') {
					argv.push(`${neg}=true`)
				} else {
					argv.push(neg)
				}
			} else if (style === 'equals') {
				argv.push(`${flag}=false`)
			} else {
				argv.push(flag, 'false')
			}
		}

		const val = rawVal

		if (typeof val === 'boolean') {
			val ? pushFlagTrue() : pushFlagFalse()
			continue
		}

		if (Array.isArray(val)) {
			if (repeatStyle === 'csv') {
				pushKV(val.filter((item) => item != null).join(','))
			} else {
				for (const item of val) {
					if (item == null) continue
					pushKV(item as Primitive)
				}
			}
			continue
		}

		if (typeof val === 'object') {
			pushKV(JSON.stringify(val))
			continue
		}

		pushKV(val as Primitive)
	}

	if (positional != null) {
		if (Array.isArray(positional)) {
			for (const p of positional) {
				if (p != null) argv.push(String(p))
			}
		} else {
			argv.push(String(positional))
		}
	}

	return argv
}

