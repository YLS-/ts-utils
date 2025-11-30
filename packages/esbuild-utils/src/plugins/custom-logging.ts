import type { Plugin } from 'esbuild'
import { getWatchMode, startPersistentSpinner, startSpinner, stopPersistentSpinner, stopSpinner, updateStatus } from '@yohs/node-utils/console'

export const customLoggingPlugin: Plugin = {
	name: 'custom-logging',
	setup(build) {
		build.onStart(() => {
			updateStatus('Building...')
			if (getWatchMode()) startPersistentSpinner()
			else startSpinner('Building TypeScript files')
		})

		build.onEnd((result) => {
			if (getWatchMode()) stopPersistentSpinner()
			else stopSpinner()

			if (result.errors.length === 0) {
				const warnings = result.warnings.length
				const warningText = warnings > 0 ? ` (${warnings} warnings)` : ''
				updateStatus(`Build successful${warningText}`)

				if (getWatchMode()) startPersistentSpinner()
			} else {
				console.log(`❌ Build failed with ${result.errors.length} error(s)`)
				result.errors.forEach((error, index) => {
					console.log(`   ${index + 1}. ${error.text}`)
				})

				if (getWatchMode()) {
					updateStatus('Build failed - watching for changes...')
					startPersistentSpinner()
				}
			}
		})
	},
}

