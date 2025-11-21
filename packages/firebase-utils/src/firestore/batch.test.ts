import { describe, expect, it, vi } from 'vitest'
import type { DocumentData, DocumentReference, Firestore, WriteResult } from 'firebase-admin/firestore'

import { chunkArray, commitInChunks, type WriteOperation } from '../../src/firestore/batch'

const stubRef = (path: string) => ({ path } as DocumentReference<DocumentData>)
const stubResult = (): WriteResult => ({ updateTime: new Date() } as WriteResult)

const createFirestore = () => {
	return {
		batch: vi.fn(() => ({
			set: vi.fn(),
			update: vi.fn(),
			delete: vi.fn(),
			create: vi.fn(),
			commit: vi.fn(async () => [stubResult()]),
		})),
	} as unknown as Firestore
}

describe('chunkArray', () => {
	it('splits arrays deterministically', () => {
		expect(chunkArray([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]])
	})

	it('throws on invalid size', () => {
		expect(() => chunkArray([1], 0)).toThrowError('size must be a positive number')
	})
})

describe('commitInChunks', () => {
	it('commits batches respecting the limit', async () => {
		const db = createFirestore()
		const operations: WriteOperation[] = Array.from({ length: 10 }, (_, index) => ({
			type: 'set',
			ref: stubRef(`documents/${index}`),
			data: { index },
		}))

		const result = await commitInChunks(db, operations, { chunkSize: 4 })

		expect(result).toHaveLength(3)
		expect(result.map((chunk) => chunk.size)).toEqual([4, 4, 2])
	})

	it('short-circuits when there is nothing to do', async () => {
		const db = createFirestore()
		await expect(commitInChunks(db, [])).resolves.toEqual([])
		expect((db as unknown as { batch: () => void }).batch).not.toHaveBeenCalled()
	})
})
