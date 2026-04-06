export interface RGB {
	r: number;
	g: number;
	b: number;
}

export interface YCbCr {
	y: number;
	cb: number;
	cr: number;
}

export function clampByte(value: number): number {
	return Math.min(255, Math.max(0, Math.round(value)));
}

export function rgbToYCbCr({ r, g, b }: RGB): YCbCr {
	const y = 0.299 * r + 0.587 * g + 0.114 * b;
	const cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b;
	const cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b;

	return {
		y: clampByte(y),
		cb: clampByte(cb),
		cr: clampByte(cr)
	};
}

export function ycbcrToRgb({ y, cb, cr }: YCbCr): RGB {
	const red = y + 1.402 * (cr - 128);
	const green = y - 0.344136 * (cb - 128) - 0.714136 * (cr - 128);
	const blue = y + 1.772 * (cb - 128);

	return {
		r: clampByte(red),
		g: clampByte(green),
		b: clampByte(blue)
	};
}

export function rgbImageToYCbCr(rgba: ArrayLike<number>): Uint8Array {
	const pixels = Math.floor(rgba.length / 4);
	const converted = new Uint8Array(pixels * 3);

	for (let index = 0; index < pixels; index += 1) {
		const base = index * 4;
		const { y, cb, cr } = rgbToYCbCr({
			r: rgba[base] ?? 0,
			g: rgba[base + 1] ?? 0,
			b: rgba[base + 2] ?? 0
		});

		const out = index * 3;
		converted[out] = y;
		converted[out + 1] = cb;
		converted[out + 2] = cr;
	}

	return converted;
}

export function ycbcrImageToLuma(ycbcr: ArrayLike<number>): Uint8Array {
	const pixels = Math.floor(ycbcr.length / 3);
	const luma = new Uint8Array(pixels);

	for (let index = 0; index < pixels; index += 1) {
		luma[index] = clampByte(ycbcr[index * 3] ?? 0);
	}

	return luma;
}
