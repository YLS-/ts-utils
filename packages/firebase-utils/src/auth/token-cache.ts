import type { Auth, DecodedIdToken } from 'firebase-admin/auth'

export interface TokenCacheOptions {
	/**
	 * Hard TTL applied on top of the token's exp claim. Defaults to one minute.
	 */
	ttlMs?: number
	/**
	 * Clock provider mainly used for testing.
	 */
	clock?: () => number
	/**
	 * Milliseconds shaved from the computed expiry to avoid cutting it too close.
	 */
	safetyWindowMs?: number
}

export interface VerifyTokenOptions {
	forceRefresh?: boolean
	checkRevoked?: boolean
}

interface CacheEntry {
	claims: DecodedIdToken
	expiresAt: number
}

/**
 * Thin cache that wraps {@link Auth.verifyIdToken} to shield Firebases Admin from bursts.
 */
export class TokenVerifierCache {
	private readonly cache = new Map<string, CacheEntry>()
	private readonly ttlMs: number
	private readonly clock: () => number
	private readonly safetyWindow: number

	constructor(private readonly auth: Auth, options: TokenCacheOptions = {}) {
		this.ttlMs = Math.max(1, options.ttlMs ?? 60_000)
		this.clock = options.clock ?? Date.now
		this.safetyWindow = Math.max(0, options.safetyWindowMs ?? 2_000)
	}

	async verify(token: string, options: VerifyTokenOptions = {}): Promise<DecodedIdToken> {
		const now = this.clock()
		const cached = this.cache.get(token)
		if (!options.forceRefresh && cached && cached.expiresAt > now) {
			return cached.claims
		}

		const claims = await this.auth.verifyIdToken(token, options.checkRevoked)
		const expiresAt = this.computeExpiry(claims, now)
		this.cache.set(token, { claims, expiresAt })
		return claims
	}

	clear(token?: string): void {
		if (!token) {
			this.cache.clear()
			return
		}
		this.cache.delete(token)
	}

	private computeExpiry(claims: DecodedIdToken, now: number): number {
		const hardLimit = now + this.ttlMs
		const expClaim = claims.exp ? claims.exp * 1_000 : Number.POSITIVE_INFINITY
		return Math.min(hardLimit, expClaim) - this.safetyWindow
	}
}
