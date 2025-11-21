// not including 'and' on purpose, 'and' really shouldnt appear in good headword translations, so it should be penalized
export const STOP_WORDS_ENGLISH: string[] = ['of', 'to', 'the', 'a', 'be', 'have']


export type NGramTokens = string[]

// extracts all n-grams (with repetitions) from a list of words
export function ngramTokenize(words: string[], size: number = 2, padding: 'none' | 'start' | 'end' | 'both' = 'none'): NGramTokens {
	return words.reduce<string[]>((arr, word) => {
		let _word: string = word

		// padding every word's start and end with out-of-alphabet character,
		// to build additional n-grams properly embedding all the sub-sequences, even if smaller than n-gram size
		// e.g. word = 'truck', size = 3, no padding: ['tru', 'ruc', 'uck'];  with padding: ['##t', '#tr', 'tru', 'ruc', 'uck', 'ck#', 'k##']
		if (padding !== 'none') {
			if (['start', 'both'].includes(padding)) {
				_word = '#'.repeat(size - 1) + _word
			}

			if (['end', 'both'].includes(padding)) {
				_word = _word + '#'.repeat(size - 1)
			}
		}

		// can't tokenize any word shorter (post-padding) than n-gram length
		if (_word.length < size) { return arr }

		for (let i = 0; i <= _word.length - size; i++) {
			const ngram = _word.slice(i, i + size)
			arr.push(ngram)
		}

		return arr
	}, [])
}
