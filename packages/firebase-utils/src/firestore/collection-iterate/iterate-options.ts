import type { DocumentReference, Filter } from 'firebase-admin/firestore'
import type { BatchTaskQueue } from './batch-queue'


export interface IterateCollectionOptions<T> {
	// logging string including {count} substring for replacement with documents count
	logCount?: (count: number) => string,
	batchSize?: number
	batchCount?: number
	batchProcessing?: 'serial' | 'parallel'
	batchMaxOperations?: number
	batchHandler: IterateCollectionHandler<T>
	batchLog?: () => string,
	idField?: string
	idFieldType?: 'string' | 'number'
	startAfterId?: string | number
	queryFilter?: Parameters<typeof Filter.where>
	// queryFilter?: (q: Query<T>) => Query<T>
	skipDocument?: (data: T, id: string) => boolean | Promise<boolean>
	noCommit?: boolean,
	ignoreUndefinedProperties?: boolean
}

// type IterateCollectionHandler<T> = (data: T, id: string, ref: DocumentReference<T>, batch: WriteBatch, countProcessed: () => void) => Promise<void>
type IterateCollectionHandler<T> = (data: T, id: string, ref: DocumentReference<T>, batch: BatchTaskQueue<T>, countProcessed: () => void) => Promise<void>
