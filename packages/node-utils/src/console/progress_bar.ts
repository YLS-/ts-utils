
export interface ProgressBarOptions {
	// appearance
	length: number
	filled: string
	empty: string

	// state
	current: number
	total: number
}


export class ProgressBar {

	private _format: string
	private _options: ProgressBarOptions

	private _current: number = 0
	private _total: number = 10

	// console patching
	private _logOriginal: (...data: any) => void


	constructor(format: string, options: Partial<ProgressBarOptions>) {
		this._format = format

		const defaultOptions: ProgressBarOptions = {
			length: 50,				// process.stdout.columns - 30
			empty: '\u2591',		// ░
			filled: '\u2588',		// █

			current: 0,
			total: 10
		}

		this._options = { ...defaultOptions, ...options }
		this._current = this._options.current
		this._total = this._options.total

		// monkey-patches console.log
		this._logOriginal = console.log
		this._patchConsole()

		// always keep 1 empty line above progress bar
		process.stdout.write('\n')
	}


	// monkey-patch version to replace console.log
	private _patchConsole() {
		console.log = new Proxy(console.log, {
			apply: (target, thisArg, args: Parameters<typeof console.log>) => {
				// clears the current bar
				process.stdout.clearLine(0)	// deletes last line
				process.stdout.cursorTo(0)		// moves cursor to beginning of (cleared) last line

				// logs the user-side content
				process.stdout.moveCursor(0, -1) // up one line (relative move)
				target(...args)

				// redraws the bar "below" in the same state
				process.stdout.write('\n')
				this.update(this._current)
			}
		})
	}


	public update(current: number) {
		this._current = current

		const progress = this._current / this._total
		this._draw(progress)
	}


	public finish() {
		process.stdout.write('\n')

		// restores original function
		console.log = this._logOriginal
	}


	private _draw(progress: number) {
		// bars computations
		const length_filled: number = Math.floor(this._options.length * progress)
		const bar_filled = this._makeBar(length_filled, this._options.filled, '')

		const length_empty: number = this._options.length - length_filled
		const bar_empty = this._makeBar(length_empty, this._options.empty, '')

		// redrawing
		process.stdout.clearLine(0)
		process.stdout.cursorTo(0)

		const output: string = this._format
			.replace(':bar', `${bar_filled}${bar_empty}`)
			.replace(':current', String(this._current))
			.replace(':total', String(this._total))
			.replace(':pct', `${(progress * 100).toFixed(2)}%`)

		process.stdout.write(output)
	}


	private _makeBar(length: number, char: string, color: string): string {
		let bar: string = ''
		for (let i = 0; i < length; i++) {
			bar += char
		}
		return bar
	}


}