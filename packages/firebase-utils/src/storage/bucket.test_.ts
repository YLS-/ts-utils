import { describe, expect, it, vi } from 'vitest'
import type { Storage } from 'firebase-admin/storage'
import type { Bucket, File } from './types'

import { buildGcsUri, ensureBucket, getSignedDownloadUrl, uploadJson } from './bucket'

describe('ensureBucket', () => {
	it('creates the bucket when needed', async () => {
		const bucket = {
			exists: vi.fn(async () => [false]),
		} as unknown as Bucket
		const storage = {
			bucket: vi.fn(() => bucket),
			createBucket: vi.fn(async () => [bucket]),
		} as unknown as Storage

		const result = await ensureBucket(storage, 'demo')

		expect(result).toBe(bucket)
		expect(storage.bucket).toHaveBeenCalledWith('demo')
	})
})

describe('uploadJson', () => {
	it('writes JSON payloads using deterministic settings', async () => {
		const save = vi.fn(async () => undefined)
		const bucket = {
			file: vi.fn(() => ({ save })),
		} as unknown as Bucket

		await uploadJson(bucket, 'document.json', { foo: 'bar' }, { pretty: true })

		expect(save).toHaveBeenCalledWith(
			`{
  "foo": "bar"
}`,
			expect.objectContaining({
			contentType: 'application/json; charset=utf-8',
			gzip: true,
			}),
		)
	})
})

describe('getSignedDownloadUrl', () => {
	it('requests a signed url with sane defaults', async () => {
		const file = {
			getSignedUrl: vi.fn(async () => ['https://signed.example.com']),
		} as unknown as File

		const url = await getSignedDownloadUrl(file, { expiresInSeconds: 30 })

		expect(url).toBe('https://signed.example.com')
		expect(file.getSignedUrl).toHaveBeenCalled()
	})
})

describe('buildGcsUri', () => {
	it('normalizes multiple slashes', () => {
		expect(buildGcsUri('bucket', '/nested/file.txt')).toBe('gs://bucket/nested/file.txt')
	})
})
