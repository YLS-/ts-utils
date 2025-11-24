// Firebase
import { Timestamp } from 'firebase-admin/firestore'
import type { Bucket } from './bucket'
export type SaveData = string | Buffer //| Uint8Array

import type { GcsObjectRef } from './gcs-object'
import { sha256 } from '@yohs/ts-core/crypto'
import { brotli } from '@yohs/ts-core/zlib'


export interface UploadFileMetadata {
	contentType?: string
	cacheControl?: string
}

export interface UploadFileOptions {
	compression?: boolean
	hashedName?: boolean
	metadata?: UploadFileMetadata
	public?: boolean
}

// Cloud Storage upload helper with optional pre-processing (Brotli compression, SHA-256 hash)
export async function uploadFile(bucket: Bucket, fileDir: string, fileName: string, fileExtension: string, data: SaveData, options: UploadFileOptions = {}): Promise<GcsObjectRef> {
	// options merging
	let defaultOptions: UploadFileOptions = { compression: false, public: false, hashedName: false }
	const opts: UploadFileOptions = { ...defaultOptions, ...options }

	// data processing
	let d: SaveData = data
	if (opts.compression && d instanceof Buffer) {
		d = await brotli(d)
	}

	// hashing
	const hash: string = sha256(d)

	// file path (depends on compression & hashing options)
	const fileNameAdjusted: string = opts.hashedName ? `${fileName}.${hash.slice(0, 8)}.${fileExtension}` : `${fileName}.${fileExtension}`
	const fileNameWithCompression: string = opts.compression ? `${fileNameAdjusted}.br` : fileNameAdjusted
	const filePath: string = `${fileDir}/${fileNameWithCompression}`
	const file = bucket.file(filePath)

	// file upload (non-streamed)
	await file.save(d, {
		resumable: false,
		validation: 'crc32c',	// integrity check
		// preconditionOpts: { ifGenerationMatch: 0 },	// only create if not already present
		metadata: {
			contentType: opts.metadata?.contentType,
			contentEncoding: opts.compression ? 'br' : undefined,
			cacheControl: opts.metadata?.cacheControl
		}
	})

	// make file public (if requested)
	if (opts.public) await file.makePublic()

	// GCS object metadata
	const ref: GcsObjectRef = {
		createdAt: Timestamp.now(),
		filePath: filePath,
		fileName: fileNameWithCompression,
		bytes: (d instanceof Buffer) ? d.byteLength : d.length,
		hash: `sha256:${hash}`,
		contentType: opts.metadata?.contentType,
		compression: opts.compression ? 'br' : undefined
	}

	return ref
}
