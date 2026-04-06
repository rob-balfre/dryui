import { hsbToHsl, hslToHex, type BrandInput } from './derivation.js';

export interface PaletteResult {
	swatches: string[];
	bg: string;
	accent: string;
}

/**
 * Generate a 4-color display palette from a brand HSB input.
 * Sweeps from a deep complement through the brand to a light accent.
 */
export function generatePalette(brand: BrandInput): PaletteResult {
	const h = brand.h;

	const specs = [
		{ hOff: -105, s: 58, b: 45 },
		{ hOff: -50, s: 72, b: 58 },
		{ hOff: -18, s: 80, b: 72 },
		{ hOff: 25, s: 65, b: 82 }
	];

	const swatches = specs.map(({ hOff, s, b }) => {
		const hue = (((h + hOff) % 360) + 360) % 360;
		const hsl = hsbToHsl(hue, s / 100, b / 100);
		return hslToHex(hsl.h, hsl.s, hsl.l);
	});

	// Keep background in the dark blue-indigo range, with subtle brand influence
	const bgHue = 230 + Math.sin((h / 360) * Math.PI * 2) * 25;
	const bgHsl = hsbToHsl(bgHue, 0.5, 0.14);
	const bg = hslToHex(bgHsl.h, bgHsl.s, bgHsl.l);

	const accent = swatches[3]!;

	return { swatches, bg, accent };
}

/**
 * Deterministically map arbitrary text to a BrandInput.
 * Same text always produces the same color.
 */
export function textToBrand(text: string): BrandInput {
	const normalized = text.trim().toLowerCase();
	if (!normalized) return { h: 230, s: 65, b: 85 };

	let hash = 0;
	for (let i = 0; i < normalized.length; i++) {
		hash = ((hash << 5) - hash + normalized.charCodeAt(i)) | 0;
	}
	hash = Math.abs(hash);

	return {
		h: hash % 360,
		s: 55 + (hash % 30),
		b: 60 + ((hash >> 8) % 25)
	};
}
