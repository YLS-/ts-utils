// Firestore
import type { DocumentData, FirestoreDataConverter, QueryDocumentSnapshot, WithFieldValue } from 'firebase-admin/firestore'

export function defaultConverter<T extends {}>(): FirestoreDataConverter<T> {
	return {
		toFirestore(obj: WithFieldValue<T>): DocumentData {
			return obj as DocumentData
		},

		fromFirestore(snapshot: QueryDocumentSnapshot): T {
			const data = snapshot.data()!
			return data as T
		}
	}
}
