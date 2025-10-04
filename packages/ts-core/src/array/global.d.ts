export {}

// Array prototype convenience extensions
declare global {
	interface Array<T> {
		first(): T | null
		last(): T | null
		random(): T
		swap(i: number, j: number): this
		chunk(chunkSize: number): Array<Array<T>>
	}
}
