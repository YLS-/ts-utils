export interface BuildCloudRunUrlOptions {
	service: string
	region: string
	projectNumber?: string | number
	domain?: string
	https?: boolean
}

export function buildCloudRunUrl(options: BuildCloudRunUrlOptions): string {
	const protocol = options.https === false ? 'http' : 'https'
	if (options.domain) {
		return `${protocol}://${options.domain}`
	}
	const normalizedRegion = options.region.replace(/\s+/g, '-')
	const projectPart = options.projectNumber ? `${options.projectNumber}-` : ''
	return `${protocol}://${options.service}-${projectPart}${normalizedRegion}.a.run.app`
}

export interface InvokeCloudRunOptions {
	url: string
	method?: string
	headers?: Record<string, string>
	body?: unknown
	json?: boolean
	idToken?: string | (() => Promise<string>)
	fetchImpl?: typeof fetch
}

export async function invokeCloudRun(options: InvokeCloudRunOptions): Promise<Response> {
	const fetcher = options.fetchImpl ?? fetch
	const headers: Record<string, string> = {
		...(options.json ? { 'content-type': 'application/json' } : {}),
		...(options.headers ?? {}),
	}
	let body: BodyInit | undefined

	if (options.json && options.body !== undefined) {
		body = JSON.stringify(options.body)
	} else if (typeof options.body === 'string' || options.body instanceof Blob || options.body instanceof ArrayBuffer || options.body instanceof URLSearchParams || options.body instanceof FormData) {
		body = options.body as BodyInit
	} else if (options.body !== undefined) {
		body = JSON.stringify(options.body)
		headers['content-type'] = headers['content-type'] ?? 'application/json'
	}

	const token = typeof options.idToken === 'function' ? await options.idToken() : options.idToken
	if (token) {
		headers['authorization'] = `Bearer ${token}`
	}

	return fetcher(options.url, {
		method: options.method ?? 'POST',
		headers,
		body,
	})
}
