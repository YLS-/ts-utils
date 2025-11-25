import type { Storage } from 'firebase-admin/storage'
import type { Bucket, CreateBucketRequest, File, GetSignedUrlConfig, SaveOptions } from './types'


export interface EnsureBucketOptions extends CreateBucketRequest {
	autoCreate?: boolean
}

export async function ensureBucket(storage: Storage, bucketName: string, options?: EnsureBucketOptions): Promise<Bucket> {
	const { autoCreate = true, ...bucketOptions } = options ?? {}
	const bucket = storage.bucket(bucketName)
	if (!autoCreate) {
		return bucket
	}

	const [exists] = await bucket.exists()
	if (!exists) {
		await storage.bucket(bucketName).create(bucketOptions)
	}
	return bucket
}

export interface UploadJsonOptions extends SaveOptions {
	pretty?: boolean
}

export async function uploadJson(
	bucket: Bucket,
	filePath: string,
	payload: unknown,
	options: UploadJsonOptions = {},
): Promise<File> {
	const body = JSON.stringify(payload, null, options.pretty ? 2 : undefined)
	const file = bucket.file(filePath)
	await file.save(body, {
		resumable: false,
		gzip: true,
		contentType: 'application/json; charset=utf-8',
		...options,
	})
	return file
}

export interface SignedDownloadUrlOptions extends Omit<GetSignedUrlConfig, 'action' | 'expires'> {
	expiresInSeconds?: number
}

export async function getSignedDownloadUrl(
	file: File,
	options: SignedDownloadUrlOptions = {},
): Promise<string> {
	const expiresInSeconds = options.expiresInSeconds ?? 60 * 60
	const expires = Date.now() + expiresInSeconds * 1_000
	const [url] = await file.getSignedUrl({
		action: 'read',
		expires,
		version: 'v4',
		...options,
	})
	return url
}

export function buildGcsUri(bucketName: string, filePath: string): string {
	const cleaned = filePath.replace(/^\/+/, '')
	return `gs://${bucketName}/${cleaned}`
}
