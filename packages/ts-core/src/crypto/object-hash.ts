import crypto from 'crypto'

export function objectHash(obj: any) {
	const hash = crypto.createHash('sha1')
	const json = JSON.stringify(obj, Object.keys(obj).sort()) // sort keys for consistent hashing
	hash.update(json)

	const h: string = hash.digest('base64url').slice(0, 16)
	return h
}
