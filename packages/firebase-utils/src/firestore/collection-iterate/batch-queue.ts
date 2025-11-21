import type { DocumentReference } from 'firebase-admin/firestore'


// wrapper on Firestore's WriteBatch to allow more granular control of batching,
// especially pre-chunking of batched operations when operations queue is too big for one transaction
export class BatchTaskQueue<T> {

	private _tasks: BatchTask<T>[] = []

	public create(doc: DocumentReference<T>, data: any) {
		this._tasks.push({ type: 'create', docRef: doc, data: data })
	}

	public update(doc: DocumentReference<T>, data: any) {
		this._tasks.push({ type: 'update', docRef: doc, data: data })
	}

	public set(doc: DocumentReference<T>, data: any) {
		this._tasks.push({ type: 'set', docRef: doc, data: data })
	}

	public delete(doc: DocumentReference<T>) {
		this._tasks.push({ type: 'delete', docRef: doc })
	}

	public tasks(): BatchTask<T>[] {
		return [...this._tasks]
	}

}

export type BatchTaskType = 'create' | 'update' | 'set' | 'delete'

export interface BatchTask<T> {
	type: BatchTaskType
	docRef: DocumentReference<T>
	data?: any //WithFieldValue<T>
}
