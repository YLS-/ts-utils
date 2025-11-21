import { clamp } from './math'

/**
 * Geometric primitives
 */

/** A point in 2D space. */
export type Point = { x: number; y: number }

/** A size in 2D space. */
export type Size = { width: number; height: number }

/** Top-left corner with width/height (CSS-like). */
export type Rect = Point & Size

export function isRect(rect: Rect | Bounds): rect is Rect {
	return 'x' in rect && 'y' in rect && 'width' in rect && 'height' in rect
}

/** Two-corner form (aka axis-aligned bounds). */
export type Bounds = { left: number; top: number; right: number; bottom: number }

export function isBounds(b: Rect | Bounds): b is Bounds {
	return 'left' in b && 'top' in b && 'right' in b && 'bottom' in b
}


/** Center + size (e.g. YOLO head format). */
export type CenterRect = { cx: number; cy: number; width: number; height: number }



/**
 * Conversions between shapes
 */

/** Convert a Rect to a Bounds. */
export function rectToBounds(rect: Rect): Bounds {
	return { left: rect.x, top: rect.y, right: rect.x + rect.width, bottom: rect.y + rect.height }
}

/** Convert a Bounds to a Rect. */
export function boundsToRect(bounds: Bounds): Rect {
	return { x: bounds.left, y: bounds.top, width: bounds.right - bounds.left, height: bounds.bottom - bounds.top }
}

/** Convert a CenterRect to a Bounds. */
export function centerRectToBounds(center: CenterRect): Bounds {
	const left = center.cx - center.width / 2
	const top = center.cy - center.height / 2
	return { left, top, right: left + center.width, bottom: top + center.height }
}

/** Convert a Bounds to a CenterRect. */
export function boundsToCenterRect(bounds: Bounds): CenterRect {
	const width = bounds.right - bounds.left
	const height = bounds.bottom - bounds.top
	return { cx: bounds.left + width / 2, cy: bounds.top + height / 2, width, height }
}

/** Clamp a Bounds by size. */
export function clampBounds(b: Bounds, s: Size): Bounds {
	return {
		left: clamp(b.left, 0, s.width),
		top: clamp(b.top, 0, s.height),
		right: clamp(b.right, 0, s.width),
		bottom: clamp(b.bottom, 0, s.height)
	}
}


/* ---------- Pixel ↔ normalized [0..1] ---------- */

/** Convert a Rect from pixel coordinates to normalized [0..1] coordinates. */
export function normalizeRect(rect: Rect, scale: Size): Rect {
	return {
		x: rect.x / scale.width,
		y: rect.y / scale.height,
		width: rect.width / scale.width,
		height: rect.height / scale.height
	}
}

/** Convert a Rect from normalized [0..1] coordinates to pixel coordinates. */
export function denormalizeRect(rect: Rect, scale: Size): Rect {
	return {
		x: rect.x * scale.width,
		y: rect.y * scale.height,
		width: rect.width * scale.width,
		height: rect.height * scale.height
	}
}


/* ---------- Areas, intersection ---------- */

/** Area of a box (0 if degenerate). */
export function area(rect: Rect): number
export function area(bounds: Bounds): number
export function area(box: Rect | Bounds): number {
	if (isBounds(box)) {
		return Math.max(0, box.right - box.left) * Math.max(0, box.bottom - box.top)
	}
	return Math.max(0, box.width) * Math.max(0, box.height)
}



/** Intersection area of two boxes (0 if disjoint). */
export function intersectionArea(a: Bounds, b: Bounds): number {
	const x1 = Math.max(a.left, b.left)
	const y1 = Math.max(a.top, b.top)
	const x2 = Math.min(a.right, b.right)
	const y2 = Math.min(a.bottom, b.bottom)

	return Math.max(0, x2 - x1) * Math.max(0, y2 - y1)
 }

/** Union area (optionally pass areaA/areaB if you precomputed them). */
export function unionArea(a: Bounds, b: Bounds): number {
	const ia = area(a)
	const ib = area(b)
	const inter = intersectionArea(a, b)
	// Avoid negative due to FP error
	return Math.max(0, ia + ib - inter)
}

/** IoU = intersection / union  (returns 0..1). */
export function iou(a: Bounds, b: Bounds): number {
	const inter = intersectionArea(a, b)
	const union = unionArea(a, b)
	return (union > 0) ? (inter / union) : 0
}


/* ---------- Letterbox mappings ---------- */

// Letterboxing: keeping original aspect ratio, padding the canvas with black bars
// https://en.wikipedia.org/wiki/Letterboxing_(filmmaking)
// https://www.redsharknews.com/studio-broadcast/item/1870-what-you-need-to-know-about-aspect-ratios-and-letterboxing
export type LetterboxParams = {
	original: Size	      // original (post-rotate) image
	canvas: Size	      // e.g., {640,640}
	scale: number	      // min(canvasW/iw, canvasH/ih)
	padding: Bounds	   // background padding (left, top, right, bottom)
}


export function computeLetterboxParams(original: Size, canvas: number | Size): LetterboxParams {
	const c: Size = (typeof canvas === "number") ? { width: canvas, height: canvas } : canvas
	const scale: number = Math.min(c.width / original.width, c.height / original.height)

	// new width/height
	const nw: number = Math.round(original.width * scale)
	const nh: number = Math.round(original.height * scale)

	// padding
	const left: number = Math.floor((c.width - nw) / 2)
	const top: number = Math.floor((c.height - nh) / 2)
	const right: number = c.width - nw - left
	const bottom: number = c.height - nh - top
	const padding: Bounds = { left, top, right, bottom }

	const params: LetterboxParams = { original, canvas: c, scale, padding }
	return params
}

/** Map a Bounds box from canvas (letterboxed) → original image pixels. */
export function canvasBoundsToImage(bounds: Bounds, params: LetterboxParams): Bounds {
	const inv = (v: number, pad: number) => (v - pad) / params.scale

	const imgRect: Bounds = {
		left: inv(bounds.left, params.padding.left),
		top: inv(bounds.top, params.padding.top),
		right: inv(bounds.right, params.padding.left),
		bottom: inv(bounds.bottom, params.padding.top)
	}

	return imgRect
}

/** Map a Bounds box from original image pixels → canvas (letterboxed) pixels. */
export function imageBoundsToCanvas(bounds: Bounds, params: LetterboxParams): Bounds {
	const fwd = (v: number, pad: number) => v * params.scale + pad

	const canvasRect: Bounds = {
		left: fwd(bounds.left, params.padding.left),
		top: fwd(bounds.top, params.padding.top),
		right: fwd(bounds.right, params.padding.left),
		bottom: fwd(bounds.bottom, params.padding.top)
	}

	return canvasRect
}



export type NormalizedRect = Rect

export interface Detection<B extends Rect | Bounds> {
	bbox: B
	confidence: number | null
}


/**
 * Non-maximum suppression
 * @param boxes - The bounding boxes to suppress.
 * @param scores - The scores of the bounding boxes.
 * @param threshold - The IoU threshold for suppression.
 * @returns The indices of the bounding boxes to keep.
 */
export function nms(detections: Detection<Bounds>[], threshold: number, maxDet = 300): number[] {
	// sort scores indices by decreasing confidence
	const idxScores = detections.map((d, i) => [d.confidence!, i] as const).sort((a, b) => b[0] - a[0]).map((x) => x[1])
	const keep: number[] = []

	while (idxScores.length) {
		const i: number = idxScores.shift()!
		keep.push(i)
		if (keep.length >= maxDet) break

		const boxI: Bounds = detections[i].bbox

		// compute overlap with all other boxes
		for (let k = idxScores.length - 1; k >= 0; k--) {
			const j: number = idxScores[k]
			const boxJ: Bounds = detections[j].bbox

			const overlap: number = iou(boxI, boxJ)
			if (overlap > threshold) idxScores.splice(k, 1)
		}
	}

	return keep
}

/** Filter detections by NMS. */
export function nmsFilter(detections: Detection<Bounds>[], threshold: number, maxDet = 300): Detection<Bounds>[] {
	const keep: number[] = nms(detections, threshold, maxDet)
	return keep.map((i) => detections[i])
}

