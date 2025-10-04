import { first, last, random, swap, chunk } from './methods'
import './global.d.ts'

// helper to register array methods on the prototype
function define(name: PropertyKey, value: unknown): void {
	// don't clobber if same function is already installed
	// (keeps idempotency across HMR / multiple imports)
	const proto = Array.prototype as unknown as Record<PropertyKey, unknown>
	if (proto[name] === value) return

	// define as non-enumerable, to avoid breaking for..in / Object.keys
	Object.defineProperty(proto, name, {
		value,
		writable: true,
		configurable: true,
		enumerable: false
	})
}

// Wrap methods to call the pure implementations on `this`
define('first', function <T>(this: T[]) { return first(this) })
define('last', function <T>(this: T[]) { return last(this) 	})
define('random', function <T>(this: T[]) { return random(this) })
define('swap', function <T>(this: T[], i: number, j: number) { return swap(this, i, j)})
define('chunk', function <T>(this: T[], chunkSize: number) { return chunk(this, chunkSize) })
