/**
 * Get the byte size of an object.
 */
export function byteSize(object: any): number {
	const serialized: string = (typeof object === 'string') ? object : JSON.stringify(object)
	const bytes: number = new TextEncoder().encode(serialized).length
	return bytes
}

/**
 * Format a byte count as “XX kB” (for <1 MB) or “X.XX MB” (for ≥1 MB).
 */
export function formatByteSize(bytes: number): string {
	const KB = 1024
	const MB = KB * 1024

	if (bytes < KB) {
		return `${bytes} B`
	}

	else if (bytes < MB) {
		// round to nearest kilobyte
		const kbs = Math.round(bytes / KB)
		return `${kbs} kB`
	}

	else {
		// two decimal places in megabytes
		const mbs = bytes / MB
		return `${mbs.toFixed(2)} MB`
	}
}
