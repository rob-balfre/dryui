import { describe, expect, it } from 'bun:test';
import {
	buildCalibrationHistogram,
	calculateCalibrationProfile,
	mergeCalibrationProfiles,
	type CalibrationSample
} from '../../../packages/hand-tracking/src/pipeline/calibration.js';

function makeSamples(
	count: number,
	base: CalibrationSample = { y: 120, cb: 110, cr: 150 }
): CalibrationSample[] {
	return Array.from({ length: count }, (_, i) => ({
		y: base.y + (i % 5),
		cb: base.cb + (i % 3),
		cr: base.cr + (i % 4)
	}));
}

describe('calibration', () => {
	it('builds a histogram with correct sample count', () => {
		const samples = makeSamples(10);
		const histogram = buildCalibrationHistogram(samples);

		expect(histogram.sampleCount).toBe(10);
		expect(histogram.y).toBeInstanceOf(Uint32Array);
		expect(histogram.y.length).toBe(256);
	});

	it('accumulates histogram bins correctly', () => {
		const samples: CalibrationSample[] = [
			{ y: 100, cb: 110, cr: 150 },
			{ y: 100, cb: 110, cr: 150 },
			{ y: 101, cb: 111, cr: 151 }
		];
		const histogram = buildCalibrationHistogram(samples);

		expect(histogram.y[100]).toBe(2);
		expect(histogram.y[101]).toBe(1);
		expect(histogram.cb[110]).toBe(2);
		expect(histogram.cr[150]).toBe(2);
	});

	it('produces a stable profile when sample count reaches 30', () => {
		const profile = calculateCalibrationProfile(makeSamples(30));

		expect(profile.stable).toBe(true);
		expect(profile.confidence).toBe(1);
		expect(profile.sampleCount).toBe(30);
	});

	it('produces an unstable profile below 30 samples', () => {
		const profile = calculateCalibrationProfile(makeSamples(10));

		expect(profile.stable).toBe(false);
		expect(profile.confidence).toBeCloseTo(10 / 30);
	});

	it('calculates ranges within sample bounds', () => {
		const profile = calculateCalibrationProfile(makeSamples(30));

		expect(profile.yRange[0]).toBeLessThanOrEqual(profile.mean.y);
		expect(profile.yRange[1]).toBeGreaterThanOrEqual(profile.mean.y);
		expect(profile.cbRange[0]).toBeLessThanOrEqual(profile.mean.cb);
		expect(profile.crRange[0]).toBeLessThanOrEqual(profile.mean.cr);
	});

	it('merges two profiles with weighted averages', () => {
		const first = calculateCalibrationProfile(makeSamples(20));
		const second = calculateCalibrationProfile(makeSamples(30, { y: 130, cb: 120, cr: 160 }));
		const merged = mergeCalibrationProfiles(first, second);

		expect(merged.sampleCount).toBe(50);
		expect(merged.mean.y).toBeGreaterThan(first.mean.y);
		expect(merged.mean.y).toBeLessThan(second.mean.y);
	});

	it('returns next profile when current is null', () => {
		const profile = calculateCalibrationProfile(makeSamples(30));
		const merged = mergeCalibrationProfiles(null, profile);

		expect(merged).toBe(profile);
	});
});
