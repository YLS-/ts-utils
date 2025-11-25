// utils
import { toNDJSON } from '@yohs/ts-core/data'

// Firebase
import type { Bucket } from './types'
import type { GcsObjectRef } from './gcs-object'
import { type UploadFileOptions, type UploadFileMetadata, uploadFile } from './upload-file'



export type UploadJSONOptions = UploadFileOptions & {
	metadata?: Omit<UploadFileMetadata, 'contentType'>
}

export async function uploadJSON(bucket: Bucket, fileDir: string, fileName: string, obj: object, options: UploadJSONOptions = {}): Promise<GcsObjectRef> {
	// JSON serialization
	const json: Buffer = Buffer.from(JSON.stringify(obj), 'utf-8')

	let opts: UploadFileOptions = {
		...options,
		metadata: { ...options.metadata, contentType: 'application/json' }
	}

	// upload file
	const ref: GcsObjectRef = await uploadFile(bucket, fileDir, fileName, 'json', json, opts)
	return ref
}


export type UploadNDJSONOptions = UploadFileOptions & {
	metadata?: Omit<UploadFileMetadata, 'contentType'>
}

export async function uploadNDJSON(bucket: Bucket, fileDir: string, fileName: string, objArray: any[], options: UploadNDJSONOptions = {}): Promise<GcsObjectRef> {
	// JSON serialization
	const ndjson: Buffer = toNDJSON(objArray)

	let opts: UploadFileOptions = {
		...options,
		metadata: { ...options.metadata, contentType: 'application/x-ndjson' }
	}

	// upload file
	const ref: GcsObjectRef = await uploadFile(bucket, fileDir, fileName, 'jsonl', ndjson, opts)
	return ref
}

