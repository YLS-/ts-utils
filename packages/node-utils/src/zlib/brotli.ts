import { brotliCompress, type BrotliOptions, constants } from 'node:zlib'

// brotli compression (promisified wrapper)
export async function brotli(buffer: Buffer): Promise<Buffer> {
	// Brotli tuning
	const BROTLI_QUALITY: number = 11
	const BROTLI_LGWIN: number = 22

	// TODO: maybe could expose basic params as options
	const options: BrotliOptions = {
		params: {
			[constants.BROTLI_PARAM_QUALITY]: BROTLI_QUALITY,
			[constants.BROTLI_PARAM_LGWIN]: BROTLI_LGWIN,
		},
		// maxOutputLength: 1024 * 1024 * 10,
	}

	return new Promise((resolve, reject) => {
		brotliCompress(buffer, options, (err: Error | null, result: Buffer) => {
			if (err) reject(err)
			resolve(result)
		})
	})
}
