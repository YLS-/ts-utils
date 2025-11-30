import { ColoredLabel } from "./base-labels"
import { EXTENSION_LABELS, LoggerLabelName } from "./extension-labels"
// type LogFunction = typeof console.log

type LogFunction = (msg?: any, ...params: any[]) => void

class Logger {

	private _makeColoredLabels(labels: ColoredLabel[]): string[] {
		const styles: string[] = labels.map((l, i) => `padding: 2px 5px; background-color: ${l.backgroundColor}; border-radius: 4px; color: ${l.textColor};`
			+ (i > 0 ? 'margin-left: 6px;' : ''))
		return [labels.map(l => `%c${l.labelText}`).join(''), ...styles]
	}

	//! refactor to use _makeColoredLabels() => maybe not possible, because of ordering of text + CSS 1 + CSS 2...
	private _makeLabeledMessage(label: LoggerLabelName, text?: string): string[] {
		const logger = EXTENSION_LABELS.find(l => l.name === label)!
		const labelStyle: string = `padding: 2px 5px; background-color: ${logger.backgroundColor}; border-radius: 4px; color: ${logger.textColor};`
		return [`%c${logger.labelText}`, labelStyle].concat(text ? [text] : [])
	}

	private _log(loggingFunction: LogFunction, labels: LoggerLabelName | [LoggerLabelName, ColoredLabel[]], text?: string, ...params: any[]) {
		const msgParts: string[] = []
		if (Array.isArray(labels)) {
			const logger = EXTENSION_LABELS.find(l => l.name === labels[0])!
			msgParts.push(...this._makeColoredLabels([logger, ...labels[1]]).concat(text ? [text] : []))
		} else {
			msgParts.push(...this._makeLabeledMessage(labels, text))
		}
		loggingFunction(...msgParts, ...params)
	}

	public log(labels: LoggerLabelName | [LoggerLabelName, ColoredLabel[]], text?: string, ...params: any[]) {
		this._log(console.log, labels, text, ...params)
	}

	public warn(labels: LoggerLabelName | [LoggerLabelName, ColoredLabel[]], text?: string, ...params: any[]) {
		this._log(console.warn, labels, text, ...params)
	}

	public error(labels: LoggerLabelName | [LoggerLabelName, ColoredLabel[]], text?: string, ...params: any[]) {
		this._log(console.error, labels, text, ...params)
	}

}


export const logger = new Logger()
