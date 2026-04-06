import type { CalibrationProfile } from '../types.js';
import { rgbImageToYCbCr } from './color-space.js';

export interface SkinThresholds {
	yMin: number;
	yMax: number;
	cbMin: number;
	cbMax: number;
	crMin: number;
	crMax: number;
}

export interface SegmentationResult {
	mask: Uint8Array;
	width: number;
	height: number;
	yThreshold: number;
	skinRatio: number;
}

export const DEFAULT_SKIN_THRESHOLDS: SkinThresholds = {
	yMin: 30,
	yMax: 245,
	cbMin: 77,
	cbMax: 127,
	crMin: 133,
	crMax: 173
};

function rgbMatchesSkin(r: number, g: number, b: number): boolean {
	const maximum = Math.max(r, g, b);
	const minimum = Math.min(r, g, b);

	return r > 85 && g > 32 && b > 15 && maximum - minimum > 18 && r - g > 20 && r > g && r > b;
}

function hsvMatchesSkin(r: number, g: number, b: number): boolean {
	const red = r / 255;
	const green = g / 255;
	const blue = b / 255;
	const maximum = Math.max(red, green, blue);
	const minimum = Math.min(red, green, blue);
	const delta = maximum - minimum;

	let hue = 0;
	if (delta !== 0) {
		if (maximum === red) {
			hue = ((green - blue) / delta) % 6;
		} else if (maximum === green) {
			hue = (blue - red) / delta + 2;
		} else {
			hue = (red - green) / delta + 4;
		}

		hue *= 60;
		if (hue < 0) {
			hue += 360;
		}
	}

	const saturation = maximum === 0 ? 0 : delta / maximum;

	return hue >= 0 && hue <= 40 && saturation >= 0.2 && saturation <= 0.75;
}

function otsuThreshold(values: ArrayLike<number>): number {
	if (values.length === 0) {
		return 0;
	}

	const histogram = new Uint32Array(256);
	for (let index = 0; index < values.length; index += 1) {
		const level = values[index] ?? 0;
		histogram[level] = (histogram[level] ?? 0) + 1;
	}

	const total = values.length;
	let sum = 0;
	for (let level = 0; level < histogram.length; level += 1) {
		sum += level * (histogram[level] ?? 0);
	}

	let sumBackground = 0;
	let weightBackground = 0;
	let maxVariance = -1;
	let threshold = 0;

	for (let level = 0; level < histogram.length; level += 1) {
		const count = histogram[level] ?? 0;
		weightBackground += count;
		if (weightBackground === 0) continue;

		const weightForeground = total - weightBackground;
		if (weightForeground === 0) break;

		sumBackground += level * count;
		const meanBackground = sumBackground / weightBackground;
		const meanForeground = (sum - sumBackground) / weightForeground;
		const betweenClassVariance =
			weightBackground * weightForeground * (meanBackground - meanForeground) ** 2;

		if (betweenClassVariance > maxVariance) {
			maxVariance = betweenClassVariance;
			threshold = level;
		}
	}

	return threshold;
}

function profileToThresholds(profile: CalibrationProfile | null | undefined): SkinThresholds {
	if (!profile) {
		return DEFAULT_SKIN_THRESHOLDS;
	}

	return {
		yMin: profile.yRange[0],
		yMax: profile.yRange[1],
		cbMin: profile.cbRange[0],
		cbMax: profile.cbRange[1],
		crMin: profile.crRange[0],
		crMax: profile.crRange[1]
	};
}

export function segmentSkinFromRgba(
	rgba: ArrayLike<number>,
	width: number,
	height: number,
	profile?: CalibrationProfile | null
): SegmentationResult {
	const thresholds = profileToThresholds(profile);
	const ycbcr = rgbImageToYCbCr(rgba);
	const luma = new Uint8Array(width * height);
	const mask = new Uint8Array(width * height);

	for (let index = 0; index < width * height; index += 1) {
		luma[index] = ycbcr[index * 3] ?? 0;
	}

	const yThreshold = profile?.stable
		? thresholds.yMin
		: Math.max(thresholds.yMin, otsuThreshold(luma));

	let skinPixels = 0;
	for (let index = 0; index < width * height; index += 1) {
		const offset = index * 3;
		const y = ycbcr[offset] ?? 0;
		const cb = ycbcr[offset + 1] ?? 0;
		const cr = ycbcr[offset + 2] ?? 0;
		const rgbaOffset = index * 4;
		const r = rgba[rgbaOffset] ?? 0;
		const g = rgba[rgbaOffset + 1] ?? 0;
		const b = rgba[rgbaOffset + 2] ?? 0;
		const chromaMatches =
			cb >= thresholds.cbMin &&
			cb <= thresholds.cbMax &&
			cr >= thresholds.crMin &&
			cr <= thresholds.crMax;
		const isSkin = profile?.stable
			? chromaMatches && y <= thresholds.yMax && y >= yThreshold
			: chromaMatches && rgbMatchesSkin(r, g, b) && hsvMatchesSkin(r, g, b);

		if (isSkin) {
			mask[index] = 1;
			skinPixels += 1;
		}
	}

	return {
		mask,
		width,
		height,
		yThreshold,
		skinRatio: width * height === 0 ? 0 : skinPixels / (width * height)
	};
}

export function segmentSkinMask(
	rgba: ArrayLike<number>,
	width: number,
	height: number,
	profile?: CalibrationProfile | null
): Uint8Array {
	return segmentSkinFromRgba(rgba, width, height, profile).mask;
}

export { otsuThreshold };
