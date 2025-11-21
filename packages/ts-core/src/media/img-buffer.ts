import { Size } from '../math/geom'


export type ChannelOrder = 'RGB' | 'BGR'

export type NormSpec =
	| { type: 'none' }                                   // x
	| { type: 'unit' }                                   // x / 255
	| { type: 'offsetScale'; offset: number | [number, number, number]; scale: number | [number, number, number] } // (x - offset) * scale
	| { type: 'meanStd'; mean: [number, number, number]; std: [number, number, number] }                          // (x - mean) / std

export type HwcToChwOptions = {
	order?: ChannelOrder 		// default: 'RGB'
	norm?: NormSpec      		// default: { type: 'unit' }
	expectChannels?: 3 | 4 		// optional guard; if omitted, inferred from buffer length
}

/**
 * Convert a buffer from HWC uint8 (height, width, channels) to CHW float32 normalized [0,1] (channels, height, width)
 * @param hwc - The input buffer in HWC format
 * @param size - The size of the image (width and height)
 * @returns The buffer in CHW format
 */
export function hwcToChw(hwc: Buffer | Uint8Array, size: Size, options: HwcToChwOptions = {}): Float32Array {
	const order: ChannelOrder = options.order ?? 'RGB'
	const norm: NormSpec = options.norm ?? { type: 'unit' }

	const pixels = size.width * size.height
	const inferredChannels = (hwc.length % pixels === 0) ? hwc.length / pixels : NaN
	if (Number.isNaN(inferredChannels) || (options.expectChannels && inferredChannels !== options.expectChannels)) {
		throw new Error(`Unexpected HWC buffer length ${hwc.length}. ` +
			`Got ${inferredChannels?.toString() || "?"} channels; expected ${options.expectChannels ?? "3 or 4"}.`
		)
	}
	const srcCh: 3 | 4 = (inferredChannels === 3 || inferredChannels === 4) ? inferredChannels : 3
	const step = srcCh 	// 3 or 4

	// Source channel index mapping: which byte to read for each output channel plane
	// We always emit 3 planes (B,G,R or R,G,B)
	const map: [number, number, number] = order === 'BGR' ? [2, 1, 0] : [0, 1, 2]

	// build per-channel scale & bias, so the hot loop is just y = x*scale + bias
	let scale: [number, number, number] = [1, 1, 1]
	let bias: [number, number, number] = [0, 0, 0]

	switch (norm.type) {
		// x
		case 'none':
			break

		// x / 255
		case 'unit':
			scale = [1 / 255, 1 / 255, 1 / 255]
			break

		// (x - off) * scl  => x * scl + (-off * scl)
		case 'offsetScale': {
			const off = Array.isArray(norm.offset) ? norm.offset : [norm.offset, norm.offset, norm.offset]
			const scl = Array.isArray(norm.scale) ? norm.scale : [norm.scale, norm.scale, norm.scale]
			scale = [scl[0], scl[1], scl[2]]
			bias = [-off[0] * scl[0], -off[1] * scl[1], -off[2] * scl[2]]
			break
		}

		// (x - mean) / std => x * (1/std) + (-mean / std)
		case 'meanStd': {
			const invStd: [number, number, number] = [1 / norm.std[0], 1 / norm.std[1], 1 / norm.std[2]]
			scale = invStd
			bias = [-norm.mean[0] * invStd[0], -norm.mean[1] * invStd[1], -norm.mean[2] * invStd[2]]
			break
		}
	}

	const out = new Float32Array(3 * pixels)
	// Hot loop: single pass, per pixel
	for (let p = 0, o = 0; p < hwc.length; p += step, o++) {
		const r = hwc[p + 0] as number
		const g = hwc[p + 1] as number
		const b = hwc[p + 2] as number

		// plane offsets
		const o0 = 0 * pixels + o
		const o1 = 1 * pixels + o
		const o2 = 2 * pixels + o

		// pick source channel per plane using `map`
		const c0 = map[0] === 0 ? r : map[0] === 1 ? g : b
		const c1 = map[1] === 0 ? r : map[1] === 1 ? g : b
		const c2 = map[2] === 0 ? r : map[2] === 1 ? g : b
		out[o0] = c0 * scale[0] + bias[0]
		out[o1] = c1 * scale[1] + bias[1]
		out[o2] = c2 * scale[2] + bias[2]
	}

	return out
}

// YOLOv8/11 detect: RGB, values in [0,1]
export function hwcToChwYOLO(hwc: Buffer | Uint8Array, size: Size): Float32Array {
	return hwcToChw(hwc, size, { order: 'RGB', norm: { type: 'unit' }, expectChannels: 3 })
}

 // SCRFD: RGB, (x - 127.5) / 128 normalization, black background (InsightFace)
export function hwcToChwSCRFD(hwc: Buffer | Uint8Array, size: Size): Float32Array {
	return hwcToChw(hwc, size, { order: 'RGB', norm: { type: 'offsetScale', offset: 127.5, scale: 1 / 128 }, expectChannels: 3 })
}


/**
 * Convert a buffer from CHW float32 normalized [0,1] (channels, height, width) to HWC uint8 (height, width, channels)
 * @param chw - The input buffer in CHW format
 * @param size - The size of the image (width and height)
 * @returns The buffer in HWC format
 */
export function chwToHwc(chw: Float32Array, size: number): Buffer {
	const hwc: Buffer = Buffer.alloc(size * size * 3)

	for (let y = 0; y < size; y++) {
		for (let x = 0; x < size; x++) {
			const o = y * size + x, i = o * 3;
			hwc[i + 0] = Math.round(255 * chw[0 * size * size + o])
			hwc[i + 1] = Math.round(255 * chw[1 * size * size + o])
			hwc[i + 2] = Math.round(255 * chw[2 * size * size + o])
		}
	}

	return hwc
}


export function diff(a: Buffer, b: Buffer) {
	console.log('▽ Buffer sizes:', { a: a.length, b: b.length })
	if (a.length !== b.length) throw new Error('buffers have different sizes')

	let pixelsChanged = 0, maxDelta = 0
	for (let i = 0; i < a.length; i += 3) {
		const d0 = Math.abs(a[i + 0] - b[i + 0])
		const d1 = Math.abs(a[i + 1] - b[i + 1])
		const d2 = Math.abs(a[i + 2] - b[i + 2])

		if (d0 | d1 | d2) pixelsChanged++
		maxDelta = Math.max(maxDelta, d0, d1, d2)
	}

	console.log('pixels different:', pixelsChanged, 'max per-channel delta:', maxDelta)
	return { pixelsChanged, maxDelta }
}
