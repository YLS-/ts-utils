// import { LANGUAGE_FLAGS, type LanguageCode } from '../../../models/language/language.model'


export interface ColoredLabel {
	labelText: string
	backgroundColor: string
	textColor: string
}

export function idLabel(id: string | number): ColoredLabel { return {
	backgroundColor: '#404040',
	textColor: 'white',
	labelText: `${id}`
	}
}

export function timeLabel(): ColoredLabel {
	const t = performance.now()
	const formatted = (t < 1_000) ? `${Math.floor(t)} ms` : `${Number(t / 1_000).toFixed(3)} s`
	return {
		backgroundColor: '#36454F',	// charcoal
		textColor: 'white',
		labelText: formatted
	}
}

// export function langLabel(lang: LanguageCode): ColoredLabel {
// 	return idLabel(LANGUAGE_FLAGS[lang] + ' ' + lang)
// }
