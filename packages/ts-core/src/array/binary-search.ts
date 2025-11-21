
//* Array searching (binary search)

export function binarySearchFirst<T, R>(sortedArray: R[], keyPath: (el: R) => T, element: T, compare_fn: (a: T, b: T) => number): number | null {
	let start = 0
	let end = sortedArray.length - 1

	while (start <= end) {
		const middle = Math.floor((start + end) / 2)
		if (keyPath(sortedArray[middle]) === element) { return middle }

		const diff: number = compare_fn(element, keyPath(sortedArray[middle]))
		// console.log(element, keyPath(sortedArray[middle]), diff)
		if (diff > 0) {
			start = middle + 1
		} else {
			end = middle - 1
		}
	}

	return null	// element not found
}


export function binarySearchAll<T, R>(sortedArray: R[], keyPath: (el: R) => T, element: T, compare_fn: (a: T, b: T) => number): number[] {
	const indexes: number[] = []

	const matchIndex: number | null = binarySearchFirst(sortedArray, keyPath, element, compare_fn)
	if (matchIndex) {
		let index = matchIndex
		while ((index < sortedArray.length - 1) && compare_fn(keyPath(sortedArray[index]), element) === 0) {
			indexes.push(index)
			index += 1
		}
	}

	return indexes
}
