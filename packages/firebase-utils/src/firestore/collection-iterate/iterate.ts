// utils
// import '@yohs/ts-core/array/register'
import { chunk } from '@yohs/ts-core/array/methods'
import { ProgressBar } from '@yohs/node-utils/console'

// Firebase API
import * as admin from 'firebase-admin'
import type { DocumentReference, Filter, Query, QueryDocumentSnapshot } from 'firebase-admin/firestore'
import { IterateCollectionOptions } from './iterate-options'
import { BatchTaskQueue, BatchTask } from './batch-queue'


// exposing private property of Firestore SDK...
export function docPath<T>(doc: DocumentReference<T>): string[] {
	// @ts-ignore
	return doc._path.segments
}

interface IterateCollectionResult<T> {

}


// TODO: return a structured object with clearer info

// TODO: turn this into a CollectionProcessor class (makes config / methods more discoverable)
// TODO: and publish this as package

//! AND MAKE FIRESTORE AN INJECTED DEPENDENCY, WITH THE PACKAGE USING admin-firestore AS PEER DEP

// returns the number of actually processed documents (excluding skipped docs based on condition on data)
export async function iterateCollection<T>(collection: Query<T>, options: IterateCollectionOptions<T>): Promise<number> {
	//! must change settings here, BEFORE using 'firestore' class for anything elses
	const firestore = admin.firestore()
	if (options.ignoreUndefinedProperties) {
		firestore.settings({ ignoreUndefinedProperties: true })
	}

	//? builds filtered & ordered collection
	const idField: string = options.idField ?? '_id'
	//! can only define ONE where clause, and orderBy() must use the same field (order necessary for pagination),
	//! so the where() clause cant be defined directly on 'collection' parameter
	const filteredCollection = options.queryFilter ?
		collection.where(...options.queryFilter).orderBy(options.queryFilter[0]) :
		collection.orderBy(idField, 'asc')

	//? get query count first
	const snapshot = await filteredCollection.count().get()
	const docsCount: number = snapshot.data().count

	//? optionally display documents count
	if (options.logCount) {
		const logCount: string = options.logCount(docsCount)
		console.log(logCount.replace(String(docsCount), `\x1b[93m${docsCount}\x1b[0m`))
	}

	//? progress bar
	const progress = new ProgressBar('Processed\t :bar :pct (\x1b[93m:current\x1b[0m / \x1b[93m:total\x1b[0m)', { total: docsCount })
	progress.update(0)

	let batchIndex: number = 0
	let processedDocs: number = 0

	//! fix this, 'startAfterId' not working anymore now
	const idFieldType: string = options.idFieldType ?? 'string'
	let lastBatchedDocID: string | number = options.startAfterId ?? (idFieldType === 'string' ? '' : 0)
	let lastBatchedDoc: QueryDocumentSnapshot<T> | null = null

	if (!options.batchProcessing) { options.batchProcessing = 'serial' }
	if (!options.batchMaxOperations) { options.batchMaxOperations = 100 }
	if (!options.noCommit) { options.noCommit = false }

	do {
		//? paginated querying
		// only process first {batchCount} batches
		if (options.batchCount && (batchIndex >= options.batchCount)) { break }

		// ordered paginated query
		let q = filteredCollection
			// .orderBy(idField, 'asc')

		if (lastBatchedDoc) {
			q = q.startAfter(lastBatchedDoc)
		}

		// query filter
		// if (options.queryFilter) {
		// 	q = options.queryFilter(q)
			// if (lastBatchedDoc) {
			// 	q = q.startAfter(lastBatchedDoc)
			// }
		// } else {
		// 	q = q.orderBy(idField, 'asc')
		// 		.startAfter(lastBatchedDocID)
		// }

		// batch size
		if (options.batchSize) {
			q = q.limit(options.batchSize)
		}

		// end iteration when no more documents
		const snapshot = await q.get()
		if (snapshot.size === 0) { break }

		//? batch processing

		// Firestore write batch object passed to batch handler
		const queue = new BatchTaskQueue<T>()

		const docHandler$ = async (doc: QueryDocumentSnapshot<T>) => {
			const data: T = doc.data()

			// skips docs under given filtering condition
			if (options.skipDocument) {
				const skipCondition: boolean | Promise<boolean> = options.skipDocument(data, doc.id)
				// const shouldSkip: boolean = isPromise(skipCondition) ? await skipCondition : skipCondition
				const shouldSkip: boolean = await Promise.resolve(skipCondition)
				if (shouldSkip) { return }
			}

			// let countProcessedCalled = false
			function _countProcessed() {
				processedDocs++
				// countProcessedCalled = true
			}

			// await options.batchHandler({ data: data, id: doc.id, ref: doc.ref }, batch)
			await options.batchHandler(data, doc.id, doc.ref, queue, _countProcessed)

			// if countProcessed() handler not used manually (for more user-defined granularity of counting): just count every doc not-skipped
			// if (!countProcessedCalled) {
			// 	processedDocs++
			// }
		}

		// batch docs processing
		switch (options.batchProcessing) {
			case 'parallel':
				await Promise.all(snapshot.docs.map(async doc => docHandler$(doc)))
				break

			case 'serial':
				for (const doc of snapshot.docs) { await docHandler$(doc) }
				break
		}

		//? Firestore commit
		if (!options.noCommit) {
			await _commitTasks(queue, options.batchMaxOperations)
		}

		// progress bar update
		const batchLog: string = options.batchLog?.() ?? `processed \x1b[93m${processedDocs}\x1b[0m docs`
		// console.log(`🔷 Batch #${batchIndex + 1}, ${snapshot.size} docs (${batchLog})\n`)
		const iteratedDocs: number = options.batchSize ? (batchIndex * options.batchSize + snapshot.size) : docsCount
		progress.update(iteratedDocs)

		batchIndex++
		lastBatchedDocID = snapshot.docs.at(-1)!.get(idField)
		lastBatchedDoc = snapshot.docs.at(-1)!
	} while (true)

	progress.finish()
	return processedDocs
}


async function _commitTasks<T>(queue: BatchTaskQueue<T>, maxOperations: number) {
	const firestore = admin.firestore()
	// console.dir(queue.tasks(), { color: true, depth: null })

	// unwrapping all tasks stored in the queue, and chunking into smaller batches
	const chunks: BatchTask<T>[][] = chunk(queue.tasks(), maxOperations)
	for (const tasksChunk of chunks) {
		const batch = firestore.batch()

		tasksChunk.forEach(task => {
			switch (task.type) {
				case 'create': batch.create<T, any>(task.docRef, task.data); break;
				case 'update': batch.update<T, any>(task.docRef, task.data); break;
				case 'set': batch.set<T, any>(task.docRef, task.data, { merge: true }); break;
				case 'delete': batch.delete(task.docRef); break;
			}
		})

		await batch.commit()
	}
}
