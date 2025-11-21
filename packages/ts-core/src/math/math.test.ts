import { describe, it, expect } from 'vitest'
import { round, clamp, sigmoid } from './math'


describe('round', () => {
	it('rounds to the given number of decimals', () => {
		expect(round(1.2344, 3)).toBe(1.234)
		expect(round(1.2345, 3)).toBe(1.235)
	})

	it('rounds up by default', () => {
		expect(round(1.005, 2)).toBe(1.01)
	})

	it('works with zero decimals', () => {
		expect(round(12.5, 0)).toBe(13)
		expect(round(12.4, 0)).toBe(12)
	})
})


describe('clamp', () => {
	it('returns the value when within range', () => {
		expect(clamp(5, 0, 10)).toBe(5)
	})

	it('returns min when value is below range', () => {
		expect(clamp(-5, 0, 10)).toBe(0)
	})

	it('returns max when value is above range', () => {
		expect(clamp(15, 0, 10)).toBe(10)
	})
})


describe('sigmoid', () => {
	it('is 0.5 at 0', () => {
		expect(sigmoid(0)).toBeCloseTo(0.5, 12)
	})

	it('approaches 1 for large positive inputs and 0 for large negative inputs', () => {
		expect(sigmoid(10)).toBeGreaterThan(0.999)
		expect(sigmoid(-10)).toBeLessThan(0.001)

		// also bound strictly between 0 and 1
		expect(sigmoid(10)).toBeLessThan(1)
		expect(sigmoid(-10)).toBeGreaterThan(0)
	})

	it('is monotonic increasing', () => {
		const sNeg1 = sigmoid(-1)
		const s0 = sigmoid(0)
		const s1 = sigmoid(1)
		expect(sNeg1).toBeLessThan(s0)
		expect(s0).toBeLessThan(s1)
	})
})


