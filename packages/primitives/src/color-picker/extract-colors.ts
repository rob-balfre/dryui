import { rgbToHex } from './color-utils.js';

/**
 * Extracts dominant colors from an image file by downscaling to a small canvas
 * and bucketing pixels by hue. Returns hex color strings sorted by dominance.
 *
 * Requires a browser environment (uses Canvas API).
 */
export async function extractColorsFromImage(file: File, count: number = 5): Promise<string[]> {
	const img = await loadImage(file);
	const canvas = document.createElement('canvas');
	const size = 64;
	canvas.width = size;
	canvas.height = size;
	const ctx = canvas.getContext('2d')!;
	ctx.drawImage(img, 0, 0, size, size);
	const { data } = ctx.getImageData(0, 0, size, size);

	const bucketCount = 36;
	const buckets = Array.from({ length: bucketCount }, () => ({
		h: 0,
		s: 0,
		v: 0,
		count: 0
	}));

	for (let i = 0; i < data.length; i += 4) {
		const r = data[i]! / 255;
		const g = data[i + 1]! / 255;
		const b = data[i + 2]! / 255;
		const max = Math.max(r, g, b);
		const min = Math.min(r, g, b);
		const sat = max === 0 ? 0 : (max - min) / max;

		if (sat < 0.15 || max < 0.1 || max > 0.95) continue;

		const d = max - min;
		let hue = 0;
		if (d > 0) {
			if (max === r) hue = ((g - b) / d + (g < b ? 6 : 0)) * 60;
			else if (max === g) hue = ((b - r) / d + 2) * 60;
			else hue = ((r - g) / d + 4) * 60;
		}

		const bucket = buckets[Math.floor(hue / 10) % bucketCount];
		if (!bucket) continue;
		bucket.h += hue;
		bucket.s += sat;
		bucket.v += max;
		bucket.count++;
	}

	return buckets
		.filter((b) => b.count > 0)
		.sort((a, b) => b.count - a.count)
		.slice(0, count)
		.map((b) => {
			const h = b.h / b.count;
			const s = b.s / b.count;
			const v = b.v / b.count;
			const c = v * s;
			const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
			const m = v - c;
			let r1 = 0,
				g1 = 0,
				b1 = 0;
			if (h < 60) {
				r1 = c;
				g1 = x;
			} else if (h < 120) {
				r1 = x;
				g1 = c;
			} else if (h < 180) {
				g1 = c;
				b1 = x;
			} else if (h < 240) {
				g1 = x;
				b1 = c;
			} else if (h < 300) {
				r1 = x;
				b1 = c;
			} else {
				r1 = c;
				b1 = x;
			}
			return rgbToHex({
				r: Math.round((r1 + m) * 255),
				g: Math.round((g1 + m) * 255),
				b: Math.round((b1 + m) * 255)
			});
		});
}

function loadImage(file: File): Promise<HTMLImageElement> {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.onload = () => resolve(img);
		img.onerror = reject;
		img.src = URL.createObjectURL(file);
	});
}
