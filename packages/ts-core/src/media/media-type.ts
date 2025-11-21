import { lookup } from 'mime-types'


export type MediaType = 'image' | 'video'

/**
 * Given a file path, infers whether it's an image or video.
 * @param filePath - The file path to classify.
 * @returns The media type, or `null` if it's not an image or video.
*/
export function classifyMediaType(filePath: string): MediaType | null {
  // try to get a MIME type from the extension
	const mimeType = lookup(filePath) || ''
	if (mimeType.startsWith('image/')) return 'image'
	if (mimeType.startsWith('video/')) return 'video'

	// fallback: some common extensions
	const match = filePath.match(/\.(?<ext>[^.\\/]+)$/)
	if (!match?.groups) return null 	// no extension found

	const ext = match.groups['ext'].toLowerCase()
	if (['jpg','jpeg','png','gif','heic','webp'].includes(ext || '')) return 'image'
	if (['mp4','mov','avi','mkv','webm'].includes(ext || '')) return 'video'

	// unknown, not an image or video
	return null
}
