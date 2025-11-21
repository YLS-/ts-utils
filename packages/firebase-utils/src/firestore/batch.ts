import type {
	DocumentData,
	DocumentReference,
	Firestore,
	UpdateData,
	SetOptions,
	WriteResult,
} from 'firebase-admin/firestore'

export type WriteOperation<T extends DocumentData = DocumentData> =
	| { type: 'set'; ref: DocumentReference<T>; data: T; options?: SetOptions }
	| { type: 'update'; ref: DocumentReference<T>; data: Partial<T> }
	| { type: 'delete'; ref: DocumentReference<T> }
	| { type: 'create'; ref: DocumentReference<T>; data: T }

export interface CommitChunk<T extends DocumentData = DocumentData> {
	index: number
	size: number
	operations: ReadonlyArray<WriteOperation<T>>
	results: WriteResult[]
}

export interface CommitInChunksOptions {
	chunkSize?: number
}

const DEFAULT_CHUNK_SIZE = 450 // API limit is 500, leave some room for retries

export async function commitInChunks<T extends DocumentData = DocumentData>(
	db: Firestore,
	operations: ReadonlyArray<WriteOperation<T>>,
	options: CommitInChunksOptions = {},
): Promise<CommitChunk<T>[]> {
	if (!operations.length) {
		return []
	}

	const chunkSize = options.chunkSize ?? DEFAULT_CHUNK_SIZE
	if (chunkSize <= 0 || !Number.isFinite(chunkSize)) {
		throw new Error('chunkSize must be a positive number')
	}

	const chunks: CommitChunk<T>[] = []
	let index = 0

	for (const batchOperations of chunkArray(operations, chunkSize)) {
		const batch = db.batch()
		for (const operation of batchOperations) {
			switch (operation.type) {
				case 'set':
					batch.set(operation.ref, operation.data, operation.options ?? {})
					break
				case 'update':
					batch.update(operation.ref, operation.data as UpdateData<T>)
					break
				case 'delete':
					batch.delete(operation.ref)
					break
				case 'create':
					batch.create(operation.ref, operation.data)
					break
		default:
			throw new Error(`Unsupported write operation: ${String((operation as WriteOperation).type)}`)
			}
		}

		const results = await batch.commit()
		chunks.push({ index, size: batchOperations.length, operations: batchOperations, results })
		index += 1
	}

	return chunks
}

export function chunkArray<T>(input: ReadonlyArray<T>, size: number): T[][] {
	if (size <= 0 || !Number.isFinite(size)) {
		throw new Error('size must be a positive number')
	}

	const output: T[][] = []
	for (let i = 0; i < input.length; i += size) {
		output.push(input.slice(i, i + size))
	}
	return output
}
