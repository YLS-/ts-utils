

type Tuple<T, N extends number, R extends readonly T[] = []> = R['length'] extends N ? R : Tuple<T, N, readonly [T, ...R]>
// export type Vector<N extends number> = Tuple<number, N>
//! => can't really manipulate that type easily... TSS doesnt even really treat it as a real tuple, if manaipulatnig it as generic parameter


export type Vector = number[]


// export function dotproduct<N extends number>(a: Vector<N>, b: Vector<N>): number {
export function dotproduct(a: number[], b: number[]): number {
		if (a.length !== b.length) {
		throw new Error('Dot product : vectors are not of the same length')
	}

	return a.reduce((sum, x, i) => sum + x * b[i], 0)
}


export function norm(a: number[]): number {
	const squared: number = a.reduce((sum, x) => sum + x * x, 0)
	return Math.sqrt(squared)
}


export function cosine(a: number[], b: number[]): number {
	if (a.length !== b.length) {
		throw new Error('Cosine : vectors are not of the same length')
	}

	return dotproduct(a, b) / (norm(a) * norm(b))
}