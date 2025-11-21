import { describe, expect, it, vi } from 'vitest'
import type { Auth, DecodedIdToken } from 'firebase-admin/auth'

import { TokenVerifierCache } from './token-cache'

describe('TokenVerifierCache', () => {
	const buildAuth = (claims: DecodedIdToken) => ({
		verifyIdToken: vi.fn(async () => claims),
	} as unknown as Auth)

	it('returns cached tokens until ttl expires', async () => {
		let now = 0
		const auth = buildAuth({ uid: 'uid', exp: 10 })
		const cache = new TokenVerifierCache(auth, { ttlMs: 5_000, clock: () => now, safetyWindowMs: 0 })

		const first = await cache.verify('token')
		expect(first.uid).toBe('uid')
		expect((auth as unknown as { verifyIdToken: () => Promise<DecodedIdToken> }).verifyIdToken).toHaveBeenCalledTimes(1)

		now = 2_000
		await cache.verify('token')
		expect((auth as unknown as { verifyIdToken: () => Promise<DecodedIdToken> }).verifyIdToken).toHaveBeenCalledTimes(1)

		now = 10_000
		await cache.verify('token')
		expect((auth as unknown as { verifyIdToken: () => Promise<DecodedIdToken> }).verifyIdToken).toHaveBeenCalledTimes(2)
	})

	it('forces refresh when requested', async () => {
		let version = 0
		const auth = {
			verifyIdToken: vi.fn(async () => ({ uid: `v${version++}` } as DecodedIdToken)),
		} as unknown as Auth
		const cache = new TokenVerifierCache(auth, { ttlMs: 60_000, clock: () => 0 })

		const first = await cache.verify('token')
		expect(first.uid).toBe('v0')

		const forced = await cache.verify('token', { forceRefresh: true })
		expect(forced.uid).toBe('v1')
	})
})
