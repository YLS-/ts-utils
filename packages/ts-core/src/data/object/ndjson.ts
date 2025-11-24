

export function toNDJSON(objArray: unknown[]): Buffer {
	return Buffer.from(objArray.map(obj => JSON.stringify(obj)).join('\n'), 'utf-8')
}
