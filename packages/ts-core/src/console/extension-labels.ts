import { ColoredLabel, idLabel } from "./base-labels"


export type LoggerLabelName =
	| 'extension'
	| 'functions_request'
	| 'firestore'
	| 'indexed_db'
	| 'netflix'
	| 'cards'
	| 'dict'
	| 'videos'
	| 'level'

interface LoggerLabel<N extends LoggerLabelName> {
	name: N
	labelText: string
	backgroundColor: string
	textColor: string
}

const extensionLabel: LoggerLabel<'extension'> = {
	name: 'extension',
	labelText: 'extension',
	backgroundColor: '#196639',	// dark desaturated green
	textColor: 'white'
}

const functionsLabel: LoggerLabel<'functions_request'> = {
	name: 'functions_request',
	labelText: 'functions',
	backgroundColor: '#4f0099',	// dark purple
	textColor: 'white'
}

const firestoreLabel: LoggerLabel<'firestore'> = {
	name: 'firestore',
	labelText: 'firestore',
	backgroundColor: '#a87e00',	// dark yellow
	textColor: 'white'
}

const indexedDBLabel: LoggerLabel<'indexed_db'> = {
	name: 'indexed_db',
	labelText: 'indexedDB',
	backgroundColor: '#404040',	// dark gray
	textColor: 'white'
}

const netflixLabel: LoggerLabel<'netflix'> = {
	name: 'netflix',
	labelText: 'netflix',
	backgroundColor: '#661919',	// dark desaturated red
	textColor: 'white'
}

const cardsLabel: LoggerLabel<'cards'> = {
	name: 'cards',
	labelText: 'cards',
	backgroundColor: '#ca6f1e',	// dark desaturated orange
	textColor: 'white'
}

const dictLabel: LoggerLabel<'dict'> = {
	name: 'dict',
	labelText: 'dict',
	backgroundColor: '#006c80',	// dark teal
	textColor: 'white'
}

const videosLabel: LoggerLabel<'videos'> = {
	name: 'videos',
	labelText: 'videos',
	backgroundColor: '#004080',	// dark desaturated blue
	textColor: 'white'
}

const levelLabel: LoggerLabel<'level'> = {
	name: 'level',
	labelText: 'level',
	backgroundColor: '#000000',	// black
	textColor: 'white'
}


export const EXTENSION_LABELS: LoggerLabel<LoggerLabelName>[] = [
	extensionLabel,
	functionsLabel,
	firestoreLabel,
	indexedDBLabel,
	netflixLabel,
	cardsLabel,
	dictLabel,
	videosLabel,
	levelLabel
]


// odyssée
export const authLabels: [LoggerLabelName, ColoredLabel[]] = ['extension', [idLabel('background'), idLabel('🔑 auth')]]
export const dictLabels: [LoggerLabelName, ColoredLabel[]] = ['extension', [idLabel('background'), idLabel('📓 dict')]]
export const cardsLabels: [LoggerLabelName, ColoredLabel[]] = ['extension', [idLabel('background'), idLabel('🃏 cards')]]
export const videosLabels: [LoggerLabelName, ColoredLabel[]] = ['extension', [idLabel('background'), idLabel('🎥 videos')]]
export const subsLabels: [LoggerLabelName, ColoredLabel[]] = ['extension', [idLabel('background'), idLabel('💬 subs')]]
export const subsControllerLabels: [LoggerLabelName, ColoredLabel[]] = ['extension', [idLabel('content'), idLabel('💬 subs')]]

// Netflix
export const netflixServiceLabels: [LoggerLabelName, ColoredLabel[]] = ['extension', [idLabel('background'), idLabel('🎬 netflix')]]
export const xmlParserLabels: [LoggerLabelName, ColoredLabel[]] = ['extension', [idLabel('background'), idLabel('📄 xml-parser')]]
export const ttDownloaderLabels: [LoggerLabelName, ColoredLabel[]] = ['extension', [idLabel('background'), idLabel('💾 tt-downloader')]]
export const scannerLabels: [LoggerLabelName, ColoredLabel[]] = ['extension', [idLabel('background'), idLabel('🔍 scanner')]]
