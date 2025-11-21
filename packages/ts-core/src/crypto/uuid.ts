
// creates Firebase-style random UUIDs
export function generateFirestoreAutoID(): string {
	// alphanumeric characters
	const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'.split('')

	let autoId = ''
	while (autoId.length < 20) {
		const randomIndex = Math.floor(Math.random() * chars.length)
		autoId += chars[randomIndex]
	}

	return autoId
}


// 0->A, 1->B,... 25->Z, 26->AA, etc.
export function alphaLabel(idx: number): Uppercase<string> {
	let s: string = ''
	idx++
	while (idx > 0) {
		const m = (idx - 1) % 26
		// ASCII codes: 65 = 'A', 90 = 'Z'
		s = String.fromCharCode(65 + m) + s
		idx = Math.floor((idx - 1) / 26)
	}
	return s as Uppercase<string>
}
