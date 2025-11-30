import { styleText } from 'node:util'
type StyleFormat = Parameters<typeof styleText>[0]
import type { ExecaChildProcess } from '@yohs/node-utils/process'
import { updateStatus } from '@yohs/node-utils/console'

// ESbuild
import type { Plugin, PluginBuild } from 'esbuild'

export interface ProcessPluginOptions {
	runner: (filePath: string) => ExecaChildProcess
	label?: string
	labelStyle?: StyleFormat
}


export type ProcessPluginFactory = (options: ProcessPluginOptions) => Plugin

export const runProcessPlugin: ProcessPluginFactory = (options: ProcessPluginOptions): Plugin => {
	const { runner, label, labelStyle } = options

	function makeLabel(msg: string): string {
		const style: StyleFormat = labelStyle ?? 'white'
		const prefix = label ? `${styleText(style, label)} ` : ''
		return `${prefix}${msg}`
	}

	const setup = (build: PluginBuild) => {
		let currentProcess: ExecaChildProcess | null = null

		build.onEnd(async (result) => {
			if (result.errors.length > 0) return

			if (currentProcess) {
				updateStatus(makeLabel('restarting...'))
				currentProcess.kill('SIGTERM')
				currentProcess = null
				await new Promise((resolve) => setTimeout(resolve, 100))
			}

			try {
				updateStatus(makeLabel('starting...'))
				currentProcess = runner(build.initialOptions.outfile || 'dist/index.js')

				currentProcess.on('spawn', () => {
					updateStatus(makeLabel('watching for changes...'))
				})

				currentProcess.on('error', (error) => {
					console.error(makeLabel('failed to start:'), error.message)
					updateStatus(makeLabel('failed to start'))
				})

				currentProcess.on('exit', (code) => {
					if (code !== 0) {
						updateStatus(makeLabel(`exited with code ${code}`))
					}
				})
			} catch (error) {
				const err = error as Error
				console.error(makeLabel('failed to start:'), err.message)
				updateStatus(makeLabel('failed to start'))
			}
		})

		process.on('exit', () => {
			if (currentProcess) {
				updateStatus(makeLabel('shutting down...'))
				currentProcess.kill('SIGTERM')
			}
		})
	}

	const plugin: Plugin = { name: 'run-process', setup }
	return plugin
}

