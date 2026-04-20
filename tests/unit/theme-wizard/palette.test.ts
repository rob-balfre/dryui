import { describe, expect, test } from 'bun:test';
import {
	hsbToHsl,
	hslToHex,
	type BrandInput
} from '../../../packages/theme-wizard/src/engine/derivation.ts';
import { generatePalette, textToBrand } from '../../../packages/theme-wizard/src/engine/palette.ts';

const SWATCH_SPECS = [
	{ hOff: -105, s: 58, b: 45 },
	{ hOff: -50, s: 72, b: 58 },
	{ hOff: -18, s: 80, b: 72 },
	{ hOff: 25, s: 65, b: 82 }
] as const;

function normalizeHue(hue: number): number {
	return ((hue % 360) + 360) % 360;
}

function expectedSwatch(brandHue: number, hOff: number, s: number, b: number): string {
	const hsl = hsbToHsl(normalizeHue(brandHue + hOff), s / 100, b / 100);
	return hslToHex(hsl.h, hsl.s, hsl.l);
}

function expectedBackground(hue: number): string {
	const bgHue = 230 + Math.sin((hue / 360) * Math.PI * 2) * 25;
	const hsl = hsbToHsl(bgHue, 0.5, 0.14);
	return hslToHex(hsl.h, hsl.s, hsl.l);
}

function referenceTextToBrand(text: string): BrandInput {
	const normalized = text.trim().toLowerCase();
	if (!normalized) {
		return { h: 230, s: 65, b: 85 };
	}

	let hash = 0;
	for (let index = 0; index < normalized.length; index++) {
		hash = ((hash << 5) - hash + normalized.charCodeAt(index)) | 0;
	}
	hash = Math.abs(hash);

	return {
		h: hash % 360,
		s: 55 + (hash % 30),
		b: 60 + ((hash >> 8) % 25)
	};
}

describe('generatePalette', () => {
	test('maps the documented hue offsets into deterministic swatches', () => {
		const brand = { h: 230, s: 65, b: 85 };
		const palette = generatePalette(brand);
		const expectedSwatches = SWATCH_SPECS.map((spec) =>
			expectedSwatch(brand.h, spec.hOff, spec.s, spec.b)
		);

		expect(palette.swatches).toEqual(expectedSwatches);
		expect(palette.accent).toBe(expectedSwatches[3]);
		expect(palette.bg).toBe(expectedBackground(brand.h));
	});

	test('wraps hue offsets correctly across the 0 and 360 degree boundaries', () => {
		const brand = { h: 5, s: 72, b: 68 };
		const palette = generatePalette(brand);

		expect(palette.swatches).toEqual([
			expectedSwatch(5, -105, 58, 45),
			expectedSwatch(5, -50, 72, 58),
			expectedSwatch(5, -18, 80, 72),
			expectedSwatch(5, 25, 65, 82)
		]);
		expect(normalizeHue(brand.h - 105)).toBe(260);
		expect(normalizeHue(brand.h + 25)).toBe(30);
	});

	test('keeps the background on the sinusoidal blue-indigo rail', () => {
		const warmPalette = generatePalette({ h: 90, s: 60, b: 70 });
		const coolPalette = generatePalette({ h: 270, s: 60, b: 70 });

		expect(warmPalette.bg).toBe(expectedBackground(90));
		expect(coolPalette.bg).toBe(expectedBackground(270));
		expect(warmPalette.bg).not.toBe(coolPalette.bg);
	});
});

describe('textToBrand', () => {
	test('normalizes whitespace and casing and falls back for blank input', () => {
		expect(textToBrand('   ')).toEqual({ h: 230, s: 65, b: 85 });
		expect(textToBrand('  DryUI  ')).toEqual(textToBrand('dryui'));
		expect(textToBrand('DryUI')).toEqual(referenceTextToBrand('dryui'));
	});

	test('matches the reference hash implementation and keeps channels in range', () => {
		const brand = textToBrand('DryUI MCP');
		const alternate = textToBrand('DryUI CLI');

		expect(brand).toEqual(referenceTextToBrand('DryUI MCP'));
		expect(alternate).toEqual(referenceTextToBrand('DryUI CLI'));
		expect(brand).not.toEqual(alternate);
		expect(brand.h).toBeGreaterThanOrEqual(0);
		expect(brand.h).toBeLessThan(360);
		expect(brand.s).toBeGreaterThanOrEqual(55);
		expect(brand.s).toBeLessThanOrEqual(84);
		expect(brand.b).toBeGreaterThanOrEqual(60);
		expect(brand.b).toBeLessThanOrEqual(84);
	});
});
