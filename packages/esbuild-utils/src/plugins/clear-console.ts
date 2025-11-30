import type { Plugin } from 'esbuild'

export const clearConsolePlugin: Plugin = {
	name: 'clear-console',
	setup(build) {
		build.onStart(() => {
			console.clear()
		})
	},
}

