import { createHash } from 'node:crypto'

export function objectHash(obj: any): string {
	const hash = createHash('sha1')
	const json = JSON.stringify(obj, Object.keys(obj).sort()) // sort keys for consistent hashing
	hash.update(json)

	const h: string = hash.digest('base64url').slice(0, 16)
	return h
}

