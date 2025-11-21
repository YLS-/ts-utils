import { NGramTokens } from './ngram'

//! => in the end, not "normalizing" with IDF, because i DO want to consider n-grams vastly shared among multiple translations,
//! it does make those translations more similar; IDF is only useful when trying to isolate the SPECIFIC parts of document among the corpus

export function idfVector(tokensVectors: NGramTokens[]) {
	const ngrams: Set<string> = new Set(tokensVectors.flat())
	// console.log('\n🧬 n-grams for all translations :')
	// console.dir(ngrams, { depth: null, colors: true })

	const N: number = tokensVectors.length
	const idf_vector: { token: string, idf: number }[] = [...ngrams].map(tk => {
		// # of translations containing that 2-gram
		const docFreq: number = tokensVectors.filter(tokens => tokens.includes(tk)).length

		// idf = "discounting" factor, the more a token appears in most translations;
		// the least "information-rich" it is considered (factor near 0; token in all docs = log(N / N) = log(1) = 0, no useful information)
		const idf = Math.log10(N / docFreq)
		return { token: tk, idf: idf }
	})

	// console.dir(idf_vector, { depth: null, colors: true })
	return idf_vector
}
