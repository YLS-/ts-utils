# @yohs/node-utils

Lightweight Node.js helpers for:

- Confident environment variable parsing
- Filesystem niceties (JSON IO + safe directory creation)
- Console UX helpers (spinners + progress bars)
- CLI/process orchestration utilities (run NPX, serialize args)
- Handy crypto/zlib/http helpers for common scripts

## Quick start

```bash
pnpm add @yohs/node-utils
```

```ts
import {
	readEnvBoolean,
	runNpx,
	serializeArgs,
	startSpinner,
	stopSpinner,
	writeJsonFile,
	withWorkingDirectory,
} from '@yohs/node-utils'

const shouldDeploy = readEnvBoolean('CI_DEPLOY', { defaultValue: false })

const cliArgs = serializeArgs({
	project: 'api',
	define: { 'process.env.NODE_ENV': 'production' },
})
console.log('tsdown', ...cliArgs)

startSpinner('Building API bundle')
await runNpx('tsdown', {
	_: ['build'],
	target: 'es2023',
	minify: true,
})
stopSpinner()

await writeJsonFile('./.cache/build.json', {
	status: shouldDeploy ? 'deploy' : 'skip',
})

await withWorkingDirectory('apps/server', async () => {
	// run build scripts relative to apps/server
})
```

## Available entry-points

- `@yohs/node-utils` – exports every helper
- `@yohs/node-utils/env` – strict env parsing helpers
- `@yohs/node-utils/fs` – filesystem utilities
- `@yohs/node-utils/process` – process-level orchestration helpers (run NPX, serialize args, signal/cwd helpers)
- `@yohs/node-utils/console` – console UX helpers (spinners, progress bars)
- `@yohs/node-utils/crypto` – SHA utilities + lightweight object hashing
- `@yohs/node-utils/http` – emulator-friendly waiters & polling helpers
- `@yohs/node-utils/zlib` – brotli compression helpers

## Scripts

- `pnpm build` – compiles ESM + d.ts files via **tsdown**
- `pnpm test` – runs the Vitest suite
- `pnpm lint` / `pnpm typecheck` – local validation helpers


