import { describe, it, expect, vi, beforeEach } from 'vitest'


describe('classifyMediaType - via mime-types lookup', () => {
	let classifyMediaType: (p: string) => ReturnType<typeof import('./media-type').classifyMediaType>

	beforeEach(async () => {
		vi.resetModules()
		vi.doUnmock('mime-types')
		;({ classifyMediaType } = await import('./media-type'))
	})

	it('returns image for jpg and video for mp4 (case-insensitive)', () => {
		expect(classifyMediaType('/tmp/photo.jpg')).toBe('image')
		expect(classifyMediaType('/tmp/VIDEO.MP4')).toBe('video')
	})
})


describe('classifyMediaType - fallback logic when lookup fails', () => {
	let classifyMediaType: (p: string) => ReturnType<typeof import('./media-type').classifyMediaType>

	beforeEach(async () => {
		vi.resetModules()
		vi.mock('mime-types', () => ({ lookup: () => false }))
		;({ classifyMediaType } = await import('./media-type'))
	})

	it('uses fallback lists for image and video extensions', () => {
		expect(classifyMediaType('/tmp/picture.HEIC')).toBe('image')
		expect(classifyMediaType('/tmp/clip.mkv')).toBe('video')
	})

	it('returns null for unknown extensions and no extension', () => {
		expect(classifyMediaType('/tmp/file.xyz')).toBeNull()
		expect(classifyMediaType('/tmp/file')).toBeNull()
	})
})

