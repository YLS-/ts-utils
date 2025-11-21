import { describe, expect, it, vi } from 'vitest'

import { buildCloudRunUrl, invokeCloudRun } from '../../src/cloud-run'

describe('buildCloudRunUrl', () => {
	it('builds default run domain', () => {
		const url = buildCloudRunUrl({ service: 'api', region: 'us-central1', projectNumber: '123' })
		expect(url).toBe('https://api-123-us-central1.a.run.app')
	})

	it('respects custom domain', () => {
		const url = buildCloudRunUrl({ service: 'api', region: 'us', domain: 'api.example.com' })
		expect(url).toBe('https://api.example.com')
	})
})

describe('invokeCloudRun', () => {
	it('invokes fetch with id token and json body', async () => {
		const fetchImpl = vi.fn(async () => new Response('ok', { status: 200 }))
		await invokeCloudRun({
			url: 'https://api.run.app',
			json: true,
			body: { hello: 'world' },
			idToken: async () => 'token',
			fetchImpl: fetchImpl as unknown as typeof fetch,
		})

		expect(fetchImpl).toHaveBeenCalledWith(
			'https://api.run.app',
			expect.objectContaining({
				headers: expect.objectContaining({ authorization: 'Bearer token', 'content-type': 'application/json' }),
				method: 'POST',
			})
		)
	})
})
