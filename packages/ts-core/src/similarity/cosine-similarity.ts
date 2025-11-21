import { round, cosine } from '../math'


//? Similarity measurement between 2 featurized elements

// using a keypath to know which property of T contains the frequencies vector
export function cosineSimilarity<Element>(a: Element, b: Element, frequencies: (el: Element) => number[]): number {
	const tf_a: number[] = frequencies(a)
	const tf_b: number[] = frequencies(b)

	const cos: number = cosine(tf_a, tf_b)
	return cos
}

// export function cosineSimilarity_2<T>(a: Featurized<T>, b: Featurized<T>): number {
// 	const tf_a: number[] = a[1](a[0])
// 	const tf_b: number[] = b[1](b[0])

// 	const cos: number = cosine(tf_a, tf_b)
// 	return cos
// }


//? computes cosine similarity matrix for all pairs
export function logSimilarityMatrix<Element>(elements: Element[], frequencies: (el: Element) => number[], label: (el: Element) => string) {
	const cosines_labeled: Record<string, any> = {}

	for (const a of elements) {
		const row_labeled: Record<string, number> = {}

		for (const b of elements) {
			row_labeled[label(b)] = round(cosineSimilarity(a, b, frequencies), 3)
		}

		cosines_labeled[label(a)] = row_labeled
	}

	console.table(cosines_labeled)
}
