import { createHash } from 'node:crypto'

export function sha256(buffer: string | Buffer): string {
	return createHash('sha256').update(buffer).digest('hex')
}
