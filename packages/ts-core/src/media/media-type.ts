export type MediaType = 'image' | 'video'

/**
 * Given a file path, infers whether it's an image or video.
 * @param filePath - The file path to classify.
 * @returns The media type, or `null` if it's not an image or video.
*/
export function classifyMediaType(filePath: string): MediaType | null {
	const imageExts = new Set(['jpg','jpeg','png','gif','heic','webp'])
	const videoExts = new Set(['mp4','mov','avi','mkv','webm'])

	const match = filePath.match(/\.(?<ext>[^.\\/]+)$/)
	if (!match?.groups) return null 	// no extension found

	const ext = match.groups['ext'].toLowerCase()
	if (imageExts.has(ext)) return 'image'
	if (videoExts.has(ext)) return 'video'

	// unknown, not an image or video
	return null
}
