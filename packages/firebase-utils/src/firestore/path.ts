export function joinFirestorePath(...segments: ReadonlyArray<string | number | undefined | null>): string {
	return segments
		.flatMap((segment) => `${segment ?? ''}`.split('/'))
		.map((segment) => segment.trim())
		.filter(Boolean)
		.join('/')
}

export function splitFirestorePath(path: string): string[] {
	return path
		.split('/')
		.map((segment) => segment.trim())
		.filter(Boolean)
}

export function isDocumentPath(path: string): boolean {
	return splitFirestorePath(path).length % 2 === 0
}

export function isCollectionPath(path: string): boolean {
	return !isDocumentPath(path)
}

export function getParentPath(path: string): string | undefined {
	const segments = splitFirestorePath(path)
	if (!segments.length) {
		return undefined
	}
	segments.pop()
	return segments.join('/') || undefined
}
