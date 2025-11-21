
export function sizeInBytes(object: any): number {
	const serialized: string = (typeof object === 'string') ? object : JSON.stringify(object)
	const bytes: number = new TextEncoder().encode(serialized).length
	return bytes
}
