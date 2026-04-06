import type { CalibrationProfile } from '../types.js';
import { clampByte } from './color-space.js';

export interface CalibrationSample {
	y: number;
	cb: number;
	cr: number;
}

export interface CalibrationHistogram {
	y: Uint32Array;
	cb: Uint32Array;
	cr: Uint32Array;
	sampleCount: number;
}

export function buildCalibrationHistogram(samples: CalibrationSample[]): CalibrationHistogram {
	const histogram: CalibrationHistogram = {
		y: new Uint32Array(256),
		cb: new Uint32Array(256),
		cr: new Uint32Array(256),
		sampleCount: samples.length
	};

	for (const sample of samples) {
		const yIndex = clampByte(sample.y);
		const cbIndex = clampByte(sample.cb);
		const crIndex = clampByte(sample.cr);
		histogram.y[yIndex] = (histogram.y[yIndex] ?? 0) + 1;
		histogram.cb[cbIndex] = (histogram.cb[cbIndex] ?? 0) + 1;
		histogram.cr[crIndex] = (histogram.cr[crIndex] ?? 0) + 1;
	}

	return histogram;
}

function meanAndDeviation(values: ArrayLike<number>): { mean: number; deviation: number } {
	if (values.length === 0) {
		return { mean: 0, deviation: 0 };
	}

	let sum = 0;
	for (let index = 0; index < values.length; index += 1) {
		sum += values[index] ?? 0;
	}

	const mean = sum / values.length;
	let variance = 0;
	for (let index = 0; index < values.length; index += 1) {
		const delta = (values[index] ?? 0) - mean;
		variance += delta * delta;
	}

	return {
		mean,
		deviation: Math.sqrt(variance / values.length)
	};
}

function percentile(values: number[], fraction: number): number {
	if (values.length === 0) {
		return 0;
	}

	const sorted = [...values].sort((a, b) => a - b);
	const index = Math.min(
		sorted.length - 1,
		Math.max(0, Math.round((sorted.length - 1) * fraction))
	);
	return sorted[index] ?? 0;
}

export function calculateCalibrationProfile(samples: CalibrationSample[]): CalibrationProfile {
	const histogram = buildCalibrationHistogram(samples);
	const yValues = samples.map((sample) => sample.y);
	const cbValues = samples.map((sample) => sample.cb);
	const crValues = samples.map((sample) => sample.cr);
	const yStats = meanAndDeviation(yValues);
	const cbStats = meanAndDeviation(cbValues);
	const crStats = meanAndDeviation(crValues);

	const yLow = percentile(yValues, 0.1);
	const yHigh = percentile(yValues, 0.9);
	const cbLow = percentile(cbValues, 0.1);
	const cbHigh = percentile(cbValues, 0.9);
	const crLow = percentile(crValues, 0.1);
	const crHigh = percentile(crValues, 0.9);

	const confidence = Math.min(1, samples.length / 30);

	return {
		sampleCount: histogram.sampleCount,
		confidence,
		yRange: [
			clampByte(Math.min(yLow, yStats.mean - yStats.deviation)),
			clampByte(Math.max(yHigh, yStats.mean + yStats.deviation))
		],
		cbRange: [
			clampByte(Math.min(cbLow, cbStats.mean - cbStats.deviation)),
			clampByte(Math.max(cbHigh, cbStats.mean + cbStats.deviation))
		],
		crRange: [
			clampByte(Math.min(crLow, crStats.mean - crStats.deviation)),
			clampByte(Math.max(crHigh, crStats.mean + crStats.deviation))
		],
		mean: {
			y: yStats.mean,
			cb: cbStats.mean,
			cr: crStats.mean
		},
		deviation: {
			y: yStats.deviation,
			cb: cbStats.deviation,
			cr: crStats.deviation
		},
		stable: samples.length >= 30 && confidence >= 1
	};
}

export function mergeCalibrationProfiles(
	current: CalibrationProfile | null,
	next: CalibrationProfile
): CalibrationProfile {
	if (!current) {
		return next;
	}

	const sampleCount = current.sampleCount + next.sampleCount;
	const weightCurrent = current.sampleCount / sampleCount;
	const weightNext = next.sampleCount / sampleCount;

	return {
		sampleCount,
		confidence: Math.min(1, current.confidence * weightCurrent + next.confidence * weightNext),
		yRange: [
			clampByte(Math.min(current.yRange[0], next.yRange[0])),
			clampByte(Math.max(current.yRange[1], next.yRange[1]))
		],
		cbRange: [
			clampByte(Math.min(current.cbRange[0], next.cbRange[0])),
			clampByte(Math.max(current.cbRange[1], next.cbRange[1]))
		],
		crRange: [
			clampByte(Math.min(current.crRange[0], next.crRange[0])),
			clampByte(Math.max(current.crRange[1], next.crRange[1]))
		],
		mean: {
			y: current.mean.y * weightCurrent + next.mean.y * weightNext,
			cb: current.mean.cb * weightCurrent + next.mean.cb * weightNext,
			cr: current.mean.cr * weightCurrent + next.mean.cr * weightNext
		},
		deviation: {
			y: current.deviation.y * weightCurrent + next.deviation.y * weightNext,
			cb: current.deviation.cb * weightCurrent + next.deviation.cb * weightNext,
			cr: current.deviation.cr * weightCurrent + next.deviation.cr * weightNext
		},
		stable: current.stable || next.stable
	};
}
