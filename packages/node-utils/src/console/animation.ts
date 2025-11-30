const spinners = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']

let spinnerInterval: NodeJS.Timeout | undefined
let spinnerIndex = 0
let isWatchMode = false
let currentStatus = 'Ready'

const nextSpinner = (): string => {
	const frame = spinners[spinnerIndex]
	spinnerIndex = (spinnerIndex + 1) % spinners.length
	return frame
}

export const startPersistentSpinner = (): void => {
	if (spinnerInterval) return

	spinnerInterval = setInterval(() => {
		process.stdout.write('\x1b[s') // Save cursor position
		process.stdout.write('\x1b[H') // Move to top-left corner
		process.stdout.write(`\x1b[K${nextSpinner()} ${currentStatus}`)
		process.stdout.write('\x1b[u') // Restore cursor position
	}, 100)
}

export const stopPersistentSpinner = (): void => {
	if (!spinnerInterval) return
	clearInterval(spinnerInterval)
	spinnerInterval = undefined
	process.stdout.write('\x1b[s\x1b[H\x1b[K\x1b[u')
}

export const updateStatus = (status: string): void => {
	currentStatus = status
}

export const setWatchMode = (watchMode: boolean): void => {
	isWatchMode = watchMode
}

export const getWatchMode = (): boolean => isWatchMode

export const startSpinner = (message: string): void => {
	if (spinnerInterval) return
	spinnerInterval = setInterval(() => {
		process.stdout.write(`\r${nextSpinner()} ${message}`)
	}, 80)
}

export const stopSpinner = (): void => {
	if (!spinnerInterval) return
	clearInterval(spinnerInterval)
	spinnerInterval = undefined
	process.stdout.write('\r' + ' '.repeat(50) + '\r')
}

export const createProgressBar = (total: number) => {
	let current = 0
	const barLength = 20

	return {
		update: (increment: number = 1) => {
			current += increment
			const progress = Math.min(current / total, 1)
			const filled = Math.round(barLength * progress)
			const empty = barLength - filled
			const bar = '█'.repeat(filled) + '░'.repeat(empty)
			const percentage = Math.round(progress * 100)
			process.stdout.write(`\r[${bar}] ${percentage}%`)
		},
		complete: () => {
			process.stdout.write('\r' + ' '.repeat(50) + '\r')
		},
	}
}

