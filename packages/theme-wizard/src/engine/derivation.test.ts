// packages/theme-wizard/src/engine/derivation.test.ts
import { describe, test, expect } from 'bun:test';
import {
	hsbToHsl,
	hslToHsb,
	hslToRgb,
	hslToHex,
	hexToHsl,
	cssColorToRgb,
	relativeLuminance,
	contrastRatio,
	contrastBetweenCssColors,
	apcaContrast,
	apcaContrastBetweenCssColors,
	apcaSrgbToY,
	meetsApca,
	meetsContrast,
	compareForegroundAcrossSurfaces,
	measureForegroundOnSurface,
	luminanceFromHsl,
	generateTheme,
	generateThemeModel,
	type BrandInput
} from './derivation';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Round a number to N decimal places. */
function round(n: number, places = 3): number {
	return Math.round(n * 10 ** places) / 10 ** places;
}

// ─── HSB ↔ HSL Conversions ────────────────────────────────────────────────────

describe('hsbToHsl', () => {
	test('converts a typical saturated color', () => {
		// HSB(120, 1.0, 1.0) = fully saturated green = HSL(120, 1.0, 0.5)
		const result = hsbToHsl(120, 1.0, 1.0);
		expect(round(result.h)).toBe(120);
		expect(round(result.s)).toBe(1.0);
		expect(round(result.l)).toBe(0.5);
	});

	test('converts pure white (s=0, b=1)', () => {
		const result = hsbToHsl(0, 0, 1);
		expect(result.l).toBe(1);
		expect(result.s).toBe(0);
	});

	test('converts pure black (s=0, b=0)', () => {
		const result = hsbToHsl(0, 0, 0);
		expect(result.l).toBe(0);
		expect(result.s).toBe(0);
	});

	test('converts mid-brightness desaturated (gray)', () => {
		// HSB(0, 0, 0.5) = 50% gray = HSL(0, 0, 0.5)
		const result = hsbToHsl(0, 0, 0.5);
		expect(round(result.l)).toBe(0.5);
		expect(round(result.s)).toBe(0);
	});

	test('converts a realistic brand color HSB(220, 0.8, 0.7)', () => {
		const result = hsbToHsl(220, 0.8, 0.7);
		expect(result.h).toBe(220);
		// b=0.7, s=0.8: l = 0.7*(1-0.4)=0.42
		expect(round(result.l)).toBe(0.42);
		// s_hsl = (0.7 - 0.42) / min(0.42, 0.58) = 0.28/0.42 ≈ 0.667
		expect(round(result.s)).toBeCloseTo(0.667, 2);
	});
});

describe('hslToHsb', () => {
	test('converts a typical saturated color back', () => {
		// HSL(120, 1.0, 0.5) → HSB(120, 1.0, 1.0)
		const result = hslToHsb(120, 1.0, 0.5);
		expect(round(result.h)).toBe(120);
		expect(round(result.s)).toBe(1.0);
		expect(round(result.b)).toBe(1.0);
	});

	test('converts pure white', () => {
		const result = hslToHsb(0, 0, 1);
		expect(result.b).toBe(1);
		expect(result.s).toBe(0);
	});

	test('converts pure black', () => {
		const result = hslToHsb(0, 0, 0);
		expect(result.b).toBe(0);
		expect(result.s).toBe(0);
	});

	test('round-trip: HSB → HSL → HSB', () => {
		const cases: Array<[number, number, number]> = [
			[220, 0.8, 0.7],
			[0, 0.5, 0.5],
			[300, 1.0, 0.6],
			[60, 0.3, 0.9]
		];
		for (const [h, s, b] of cases) {
			const hsl = hsbToHsl(h, s, b);
			const back = hslToHsb(hsl.h, hsl.s, hsl.l);
			expect(round(back.h)).toBeCloseTo(h, 1);
			expect(round(back.s)).toBeCloseTo(s, 2);
			expect(round(back.b)).toBeCloseTo(b, 2);
		}
	});

	test('round-trip: HSL → HSB → HSL', () => {
		const cases: Array<[number, number, number]> = [
			[120, 0.5, 0.5],
			[240, 1.0, 0.25],
			[0, 0, 0.75],
			[180, 0.6, 0.4]
		];
		for (const [h, s, l] of cases) {
			const hsb = hslToHsb(h, s, l);
			const back = hsbToHsl(hsb.h, hsb.s, hsb.b);
			expect(round(back.h)).toBeCloseTo(h, 1);
			expect(round(back.s)).toBeCloseTo(s, 2);
			expect(round(back.l)).toBeCloseTo(l, 2);
		}
	});
});

// ─── hslToRgb ─────────────────────────────────────────────────────────────────

describe('hslToRgb', () => {
	test('pure red (0, 1, 0.5)', () => {
		const [r, g, b] = hslToRgb(0, 1, 0.5);
		expect(r).toBe(255);
		expect(g).toBe(0);
		expect(b).toBe(0);
	});

	test('pure green (120, 1, 0.5)', () => {
		const [r, g, b] = hslToRgb(120, 1, 0.5);
		expect(r).toBe(0);
		expect(g).toBe(255);
		expect(b).toBe(0);
	});

	test('pure blue (240, 1, 0.5)', () => {
		const [r, g, b] = hslToRgb(240, 1, 0.5);
		expect(r).toBe(0);
		expect(g).toBe(0);
		expect(b).toBe(255);
	});

	test('white (0, 0, 1)', () => {
		const [r, g, b] = hslToRgb(0, 0, 1);
		expect(r).toBe(255);
		expect(g).toBe(255);
		expect(b).toBe(255);
	});

	test('black (0, 0, 0)', () => {
		const [r, g, b] = hslToRgb(0, 0, 0);
		expect(r).toBe(0);
		expect(g).toBe(0);
		expect(b).toBe(0);
	});

	test('gray (0, 0, 0.5)', () => {
		const [r, g, b] = hslToRgb(0, 0, 0.5);
		expect(r).toBe(g);
		expect(g).toBe(b);
	});
});

// ─── Hex Conversions ──────────────────────────────────────────────────────────

describe('hslToHex', () => {
	test('pure red', () => {
		expect(hslToHex(0, 1, 0.5)).toBe('#ff0000');
	});

	test('pure green', () => {
		expect(hslToHex(120, 1, 0.5)).toBe('#00ff00');
	});

	test('pure blue', () => {
		expect(hslToHex(240, 1, 0.5)).toBe('#0000ff');
	});

	test('white', () => {
		expect(hslToHex(0, 0, 1)).toBe('#ffffff');
	});

	test('black', () => {
		expect(hslToHex(0, 0, 0)).toBe('#000000');
	});
});

describe('hexToHsl', () => {
	test('pure red #ff0000', () => {
		const result = hexToHsl('#ff0000');
		expect(round(result.h)).toBe(0);
		expect(round(result.s)).toBe(1);
		expect(round(result.l)).toBe(0.5);
	});

	test('pure white #ffffff', () => {
		const result = hexToHsl('#ffffff');
		expect(result.l).toBe(1);
		expect(result.s).toBe(0);
	});

	test('pure black #000000', () => {
		const result = hexToHsl('#000000');
		expect(result.l).toBe(0);
		expect(result.s).toBe(0);
	});

	test('throws on invalid hex', () => {
		expect(() => hexToHsl('#gg0000')).toThrow();
		expect(() => hexToHsl('ff0000')).toThrow();
		expect(() => hexToHsl('#ff00')).toThrow();
	});

	test('round-trip: hex → HSL → hex', () => {
		const hexes = ['#ff5733', '#1a2b3c', '#aabbcc', '#123456'];
		for (const hex of hexes) {
			const hsl = hexToHsl(hex);
			const back = hslToHex(hsl.h, hsl.s, hsl.l);
			expect(back).toBe(hex);
		}
	});

	test('case-insensitive input', () => {
		const lower = hexToHsl('#ff5733');
		const upper = hexToHsl('#FF5733');
		expect(round(lower.h)).toBe(round(upper.h));
		expect(round(lower.s)).toBe(round(upper.s));
		expect(round(lower.l)).toBe(round(upper.l));
	});
});

describe('cssColorToRgb', () => {
	test('parses hex colours', () => {
		expect(cssColorToRgb('#ffffff')).toEqual([255, 255, 255]);
	});

	test('parses hsl and hsla colours', () => {
		expect(cssColorToRgb('hsl(0, 0%, 0%)')).toEqual([0, 0, 0]);
		expect(cssColorToRgb('hsla(0, 0%, 100%, 0.5)')).toEqual([255, 255, 255]);
	});

	test('returns null for unsupported strings', () => {
		expect(cssColorToRgb('rgb(0, 0, 0)')).toBeNull();
	});
});

// ─── WCAG Luminance & Contrast ────────────────────────────────────────────────

describe('relativeLuminance', () => {
	test('white has luminance 1', () => {
		expect(round(relativeLuminance(255, 255, 255))).toBe(1);
	});

	test('black has luminance 0', () => {
		expect(round(relativeLuminance(0, 0, 0))).toBe(0);
	});

	test('luminance is in [0, 1]', () => {
		const lum = relativeLuminance(128, 0, 255);
		expect(lum).toBeGreaterThanOrEqual(0);
		expect(lum).toBeLessThanOrEqual(1);
	});

	test('red has correct relative luminance (~0.2126)', () => {
		// Pure red: 0.2126
		const lum = relativeLuminance(255, 0, 0);
		expect(lum).toBeCloseTo(0.2126, 3);
	});

	test('green has correct relative luminance (~0.7152)', () => {
		const lum = relativeLuminance(0, 255, 0);
		expect(lum).toBeCloseTo(0.7152, 3);
	});
});

describe('contrastRatio', () => {
	test('black vs white = 21', () => {
		expect(round(contrastRatio(0, 1))).toBe(21);
	});

	test('same color = 1', () => {
		expect(round(contrastRatio(0.5, 0.5))).toBe(1);
	});

	test('is symmetric', () => {
		const a = contrastRatio(0.2, 0.7);
		const b = contrastRatio(0.7, 0.2);
		expect(round(a)).toBe(round(b));
	});
});

describe('contrastBetweenCssColors', () => {
	test('supports mixed hex and hsl inputs', () => {
		expect(round(contrastBetweenCssColors('#ffffff', 'hsl(0, 0%, 0%)') ?? 0)).toBe(21);
	});

	test('composites transparent foreground colours against the background', () => {
		const opaque = contrastBetweenCssColors('hsl(230, 65%, 57%)', '#ffffff');
		const transparent = contrastBetweenCssColors('hsla(230, 65%, 57%, 0.1)', '#ffffff');

		expect(opaque).not.toBeNull();
		expect(transparent).not.toBeNull();
		expect(transparent ?? 0).toBeLessThan(opaque ?? 0);
	});

	test('returns null when a colour cannot be parsed', () => {
		expect(contrastBetweenCssColors('rgb(0, 0, 0)', '#ffffff')).toBeNull();
	});
});

describe('APCA contrast', () => {
	test('matches the published #888 on #fff keystone value', () => {
		const contrast = apcaContrastBetweenCssColors('#888888', '#ffffff');
		expect(contrast).not.toBeNull();
		expect(contrast ?? 0).toBeCloseTo(63.056, 2);
	});

	test('matches the published #fff on #888 keystone value', () => {
		const contrast = apcaContrastBetweenCssColors('#ffffff', '#888888');
		expect(contrast).not.toBeNull();
		expect(contrast ?? 0).toBeCloseTo(-68.541, 2);
	});

	test('calculates signed polarity-sensitive Lc values', () => {
		const darkOnLight = apcaContrast(apcaSrgbToY([0, 0, 0]), apcaSrgbToY([255, 255, 255]));
		const lightOnDark = apcaContrast(apcaSrgbToY([255, 255, 255]), apcaSrgbToY([0, 0, 0]));

		expect(darkOnLight).toBeGreaterThan(0);
		expect(lightOnDark).toBeLessThan(0);
	});

	test('returns null when a colour cannot be parsed', () => {
		expect(apcaContrastBetweenCssColors('rgb(0, 0, 0)', '#ffffff')).toBeNull();
	});

	test('supports absolute-value threshold checks', () => {
		expect(meetsApca(-68.541, 60)).toBe(true);
		expect(meetsApca(42, 60)).toBe(false);
	});

	test('composites transparent foreground colours before APCA measurement', () => {
		const opaque = apcaContrastBetweenCssColors('hsl(230, 65%, 57%)', '#ffffff');
		const transparent = apcaContrastBetweenCssColors('hsla(230, 65%, 57%, 0.1)', '#ffffff');

		expect(opaque).not.toBeNull();
		expect(transparent).not.toBeNull();
		expect(Math.abs(transparent ?? 0)).toBeLessThan(Math.abs(opaque ?? 0));
	});
});

describe('meetsContrast', () => {
	test('black/white meets 21:1', () => {
		expect(meetsContrast(0, 1, 21)).toBe(true);
	});

	test('black/white meets 4.5:1', () => {
		expect(meetsContrast(0, 1, 4.5)).toBe(true);
	});

	test('same luminance does not meet 1.1:1', () => {
		expect(meetsContrast(0.5, 0.5, 1.1)).toBe(false);
	});
});

describe('luminanceFromHsl', () => {
	test('white HSL(0,0,1) = 1', () => {
		expect(round(luminanceFromHsl(0, 0, 1))).toBe(1);
	});

	test('black HSL(0,0,0) = 0', () => {
		expect(round(luminanceFromHsl(0, 0, 0))).toBe(0);
	});

	test('returns same value as relativeLuminance for equivalent color', () => {
		const [r, g, b] = hslToRgb(220, 0.7, 0.5);
		const fromHsl = luminanceFromHsl(220, 0.7, 0.5);
		const fromRgb = relativeLuminance(r, g, b);
		expect(round(fromHsl)).toBe(round(fromRgb));
	});
});

// ─── generateTheme ────────────────────────────────────────────────────────────

// All BrandInput values now use 0-100 scale for s and b.

describe('generateTheme — input normalization', () => {
	test('accepts 0-100 scale for s and b', () => {
		// HSB(220, 80, 70) in 0-100 scale should equal old (220, 0.8, 0.7) in 0-1 scale
		const brand: BrandInput = { h: 220, s: 80, b: 70 };
		expect(() => generateTheme(brand)).not.toThrow();
		const { light } = generateTheme(brand);
		expect(light['--dry-color-brand']).toBeDefined();
	});

	test('throws when h > 360', () => {
		expect(() => generateTheme({ h: 361, s: 50, b: 50 })).toThrow(/brand\.h/);
	});

	test('throws when h < 0', () => {
		expect(() => generateTheme({ h: -1, s: 50, b: 50 })).toThrow(/brand\.h/);
	});

	test('throws when s > 100', () => {
		expect(() => generateTheme({ h: 180, s: 101, b: 50 })).toThrow(/brand\.s/);
	});

	test('throws when s < 0', () => {
		expect(() => generateTheme({ h: 180, s: -1, b: 50 })).toThrow(/brand\.s/);
	});

	test('throws when b > 100', () => {
		expect(() => generateTheme({ h: 180, s: 50, b: 101 })).toThrow(/brand\.b/);
	});

	test('throws when b < 0', () => {
		expect(() => generateTheme({ h: 180, s: 50, b: -1 })).toThrow(/brand\.b/);
	});

	test('h=360 is accepted (boundary)', () => {
		expect(() => generateTheme({ h: 360, s: 70, b: 60 })).not.toThrow();
	});

	test('s=0 and b=0 are accepted (boundary)', () => {
		expect(() => generateTheme({ h: 0, s: 0, b: 0 })).not.toThrow();
	});

	test('s=100 and b=100 are accepted (boundary)', () => {
		expect(() => generateTheme({ h: 0, s: 100, b: 100 })).not.toThrow();
	});
});

describe('generateTheme — structure', () => {
	const brand: BrandInput = { h: 220, s: 80, b: 70 };
	const { light, dark } = generateTheme(brand);
	const model = generateThemeModel(brand);

	test('returns light and dark objects', () => {
		expect(typeof light).toBe('object');
		expect(typeof dark).toBe('object');
	});

	test('has an expanded semantic token surface', () => {
		const totalLight = Object.keys(light).length;
		const totalDark = Object.keys(dark).length;
		expect(totalLight).toBeGreaterThanOrEqual(75);
		expect(totalLight).toBeLessThanOrEqual(95);
		expect(totalDark).toBeGreaterThanOrEqual(75);
		expect(totalDark).toBeLessThanOrEqual(95);
		// Both modes should have same token count
		expect(totalLight).toBe(totalDark);
	});

	test('exposes first-class transparent primitive ladders', () => {
		expect(model.transparentPrimitives.neutral.light.fill).toBe(light['--dry-color-fill']!);
		expect(model.transparentPrimitives.brand.dark.focusRing).toBe(
			model.tokens.dark['--dry-color-focus-ring']!
		);
		expect(model.transparentPrimitives.system.error.light.fill).toBe(
			light['--dry-color-fill-error']!
		);
		expect(model.transparentPrimitives.system.info.dark.on).toBe(dark['--dry-color-on-info']!);
	});

	test('emits the expanded semantic parity tokens in both modes', () => {
		const semanticParityKeys = [
			'--dry-color-text-disabled',
			'--dry-color-text-inverse',
			'--dry-color-text-inverse-weak',
			'--dry-color-text-inverse-disabled',
			'--dry-color-icon-brand',
			'--dry-color-icon-disabled',
			'--dry-color-icon-inverse',
			'--dry-color-icon-inverse-strong',
			'--dry-color-stroke-focus',
			'--dry-color-stroke-selected',
			'--dry-color-stroke-disabled',
			'--dry-color-stroke-inverse',
			'--dry-color-stroke-inverse-weak',
			'--dry-color-fill-strong',
			'--dry-color-fill-weak',
			'--dry-color-fill-weaker',
			'--dry-color-fill-selected',
			'--dry-color-fill-disabled',
			'--dry-color-fill-overlay',
			'--dry-color-fill-inverse',
			'--dry-color-fill-inverse-weak',
			'--dry-color-fill-inverse-hover',
			'--dry-color-fill-inverse-active',
			'--dry-color-fill-inverse-disabled',
			'--dry-color-fill-white',
			'--dry-color-fill-yellow',
			'--dry-color-bg-sunken',
			'--dry-color-bg-alternate',
			'--dry-color-bg-brand',
			'--dry-color-bg-inverse'
		];

		for (const key of semanticParityKeys) {
			expect(light[key]).toBeDefined();
			expect(dark[key]).toBeDefined();
		}
	});
});

describe('generateTheme — neutrals', () => {
	const brand: BrandInput = { h: 220, s: 80, b: 70 };
	const { light, dark } = generateTheme(brand);

	const neutralKeys = [
		'--dry-color-text-strong',
		'--dry-color-text-weak',
		'--dry-color-icon',
		'--dry-color-stroke-strong',
		'--dry-color-stroke-weak',
		'--dry-color-fill',
		'--dry-color-fill-hover',
		'--dry-color-fill-active'
	];

	test('all 8 neutral tokens exist in light mode', () => {
		for (const key of neutralKeys) {
			expect(light[key]).toBeDefined();
		}
	});

	test('all 8 neutral tokens exist in dark mode', () => {
		for (const key of neutralKeys) {
			expect(dark[key]).toBeDefined();
		}
	});

	test('light neutrals contain brand hue (220)', () => {
		for (const key of neutralKeys) {
			// Should start with hsla(220, ...) — brand hue-tinted
			expect(light[key]).toMatch(/^hsla\(220,/);
		}
	});

	test('dark neutrals are white-based (hue 0)', () => {
		for (const key of neutralKeys) {
			// White-based: hsla(0, 0%, 100%, ...)
			expect(dark[key]).toMatch(/^hsla\(0,/);
		}
	});

	test('neutral-text-strong has highest alpha in light mode', () => {
		// text-strong = 0.90, text-weak = 0.65 — text-strong alpha > text-weak alpha
		const textStrong = light['--dry-color-text-strong']!;
		const textWeak = light['--dry-color-text-weak']!;
		const alphaStrong = parseFloat(textStrong.split(', ').pop()!.replace(')', ''));
		const alphaWeak = parseFloat(textWeak.split(', ').pop()!.replace(')', ''));
		expect(alphaStrong).toBeGreaterThan(alphaWeak);
	});

	test('text-strong uses lightness 15% in light mode', () => {
		// text-strong should use 15% lightness, not 20%
		const textStrong = light['--dry-color-text-strong'];
		expect(textStrong).toMatch(/^hsla\(220, 100%, 15%,/);
	});

	test('other neutrals use lightness 20% in light mode', () => {
		// All non-text-strong neutrals should use 20% lightness
		for (const key of neutralKeys.filter((k) => k !== '--dry-color-text-strong')) {
			expect(light[key]).toMatch(/^hsla\(220, 100%, 20%,/);
		}
	});
});

describe('generateTheme — neutral versus monochromatic greys', () => {
	const brand: BrandInput = { h: 220, s: 80, b: 70 };
	const monochromaticTheme = generateTheme(brand);
	const neutralTheme = generateTheme(brand, { neutralMode: 'neutral' });

	test('monochromatic mode keeps the brand hue in light neutrals', () => {
		expect(monochromaticTheme.light['--dry-color-text-strong']).toMatch(/^hsla\(220, 100%, 15%,/);
		expect(monochromaticTheme.dark['--dry-color-bg-base']).toBe('hsl(220, 30%, 10%)');
	});

	test('neutral mode uses brand-agnostic light neutrals', () => {
		expect(neutralTheme.light['--dry-color-text-strong']).toMatch(/^hsla\(0, 0%, 15%,/);
		expect(neutralTheme.light['--dry-color-fill']).toMatch(/^hsla\(0, 0%, 20%,/);
	});

	test('neutral mode uses neutral dark surfaces', () => {
		expect(neutralTheme.dark['--dry-color-bg-base']).toBe('hsl(0, 0%, 10%)');
		expect(neutralTheme.dark['--dry-color-bg-raised']).toBe('hsl(0, 0%, 15%)');
		expect(neutralTheme.dark['--dry-color-bg-overlay']).toBe('hsl(0, 0%, 20%)');
	});

	test('neutral mode still derives dark text-brand against the actual dark base', () => {
		const textBrand = neutralTheme.dark['--dry-color-text-brand']!;
		const [, saturation, lightness] =
			textBrand.match(/^hsl\(\d+,\s*([\d.]+)%,\s*([\d.]+)%\)$/) ?? [];
		expect(saturation).toBeDefined();
		expect(lightness).toBeDefined();

		const textLum = luminanceFromHsl(220, Number(saturation) / 100, Number(lightness) / 100);
		const baseLum = luminanceFromHsl(0, 0, 0.1);
		expect(contrastRatio(textLum, baseLum)).toBeGreaterThanOrEqual(4.5);
	});
});

describe('generateTheme — brand tokens', () => {
	const brand: BrandInput = { h: 220, s: 80, b: 70 };
	const { light, dark } = generateTheme(brand);

	const brandKeys = [
		'--dry-color-brand',
		'--dry-color-text-brand',
		'--dry-color-fill-brand',
		'--dry-color-fill-brand-hover',
		'--dry-color-fill-brand-active',
		'--dry-color-fill-brand-weak',
		'--dry-color-stroke-brand',
		'--dry-color-on-brand',
		'--dry-color-focus-ring'
	];

	test('all 9 brand tokens present in light', () => {
		for (const key of brandKeys) {
			expect(light[key]).toBeDefined();
		}
	});

	test('all 9 brand tokens present in dark', () => {
		for (const key of brandKeys) {
			expect(dark[key]).toBeDefined();
		}
	});

	test('on-brand picks correct contrast color', () => {
		// For a mid-range blue (HSB 220, 80, 70) the fill is moderate lightness
		// on-brand should be either white or a dark tint
		const onBrand = light['--dry-color-on-brand']!;
		expect(onBrand === '#ffffff' || onBrand.startsWith('hsl(')).toBe(true);
	});

	test('on-brand for a very light brand color should NOT be white', () => {
		// Very light brand color: high brightness, low saturation
		const lightBrand: BrandInput = { h: 60, s: 10, b: 97 };
		const { light: lt } = generateTheme(lightBrand);
		// A very light color should use dark text for readability
		// White on near-white would fail contrast
		expect(lt['--dry-color-on-brand']).not.toBe('#ffffff');
	});

	test('on-brand for a very dark brand color should be white', () => {
		// Very dark brand color: low brightness
		const darkBrand: BrandInput = { h: 220, s: 90, b: 20 };
		const { light: lt } = generateTheme(darkBrand);
		expect(lt['--dry-color-on-brand']).toBe('#ffffff');
	});

	test('fill-brand-hover is darker than fill-brand in light mode', () => {
		// fill-brand-hover = L-8% in light mode
		const fillBrand = light['--dry-color-fill-brand']!;
		const fillBrandHover = light['--dry-color-fill-brand-hover']!;
		// Both are hsl() strings — extract lightness
		const lBrand = parseFloat(fillBrand.match(/,\s*([\d.]+)%\)/)![1]!);
		const lHover = parseFloat(fillBrandHover.match(/,\s*([\d.]+)%\)/)![1]!);
		expect(lHover).toBeLessThan(lBrand);
	});

	test('fill-brand-hover is lighter than fill-brand in dark mode', () => {
		const fillBrand = dark['--dry-color-fill-brand']!;
		const fillBrandHover = dark['--dry-color-fill-brand-hover']!;
		const lBrand = parseFloat(fillBrand.match(/,\s*([\d.]+)%\)/)![1]!);
		const lHover = parseFloat(fillBrandHover.match(/,\s*([\d.]+)%\)/)![1]!);
		expect(lHover).toBeGreaterThan(lBrand);
	});

	test('fill-brand-active is darker than fill-brand in dark mode', () => {
		// fill-brand-active = L-6% in dark mode (pressed always darkens)
		const fillBrand = dark['--dry-color-fill-brand']!;
		const fillBrandActive = dark['--dry-color-fill-brand-active']!;
		const lBrand = parseFloat(fillBrand.match(/,\s*([\d.]+)%\)/)![1]!);
		const lActive = parseFloat(fillBrandActive.match(/,\s*([\d.]+)%\)/)![1]!);
		expect(lActive).toBeLessThan(lBrand);
	});

	test('dark brand fill is brighter and less saturated in HSB terms', () => {
		const fillBrandLight = light['--dry-color-fill-brand']!;
		const fillBrandDark = dark['--dry-color-fill-brand']!;
		const parseHsl = (value: string) => {
			const match = value.match(/hsl\(([\d.]+),\s*([\d.]+)%,\s*([\d.]+)%\)/);
			if (!match?.[1] || !match[2] || !match[3]) {
				throw new Error(`Unexpected HSL color: ${value}`);
			}

			return {
				h: Number.parseFloat(match[1]),
				s: Number.parseFloat(match[2]) / 100,
				l: Number.parseFloat(match[3]) / 100
			};
		};

		const lightHsl = parseHsl(fillBrandLight);
		const darkHsl = parseHsl(fillBrandDark);
		const lightHsb = hslToHsb(lightHsl.h, lightHsl.s, lightHsl.l);
		const darkHsb = hslToHsb(darkHsl.h, darkHsl.s, darkHsl.l);

		expect(darkHsb.b).toBeGreaterThan(lightHsb.b);
		expect(darkHsb.s).toBeLessThan(lightHsb.s);
	});

	test('text-brand achieves 4.5:1 contrast on white background (light mode)', () => {
		const textBrand = light['--dry-color-text-brand']!;
		// Parse hsl() string
		const match = textBrand.match(/hsl\((\d+),\s*([\d.]+)%,\s*([\d.]+)%\)/);
		if (!match) throw new Error(`Unexpected text-brand format: ${textBrand}`);
		const [, h, s, l] = match.map(Number) as [number, number, number, number];
		const lum = luminanceFromHsl(h, s / 100, l / 100);
		const contrast = contrastRatio(lum, 1.0);
		expect(contrast).toBeGreaterThanOrEqual(4.4); // slight tolerance for rounding
	});

	test('dark focus-ring has higher lightness than light focus-ring', () => {
		// Dark mode bumps L by +10%
		const lightRing = light['--dry-color-focus-ring']!;
		const darkRing = dark['--dry-color-focus-ring']!;
		// hsla format: hsla(H, S%, L%, A) — extract the second % value (lightness)
		const extractLightness = (s: string) => {
			const matches = [...s.matchAll(/(\d+(?:\.\d+)?)%/g)];
			return parseFloat(matches[1]![1]!); // index 1 = lightness (after saturation)
		};
		const lLight = extractLightness(lightRing);
		const lDark = extractLightness(darkRing);
		expect(lDark).toBeGreaterThan(lLight);
	});
});

describe('foreground surface comparison helpers', () => {
	const brand: BrandInput = { h: 220, s: 80, b: 70 };
	const theme = generateTheme(brand);

	test('measures contrast and APCA for one surface', () => {
		const assessment = measureForegroundOnSurface(
			theme.light['--dry-color-text-weak']!,
			theme.light['--dry-color-bg-base']!
		);

		expect(assessment.foreground).toBe(theme.light['--dry-color-text-weak']!);
		expect(assessment.surface).toBe(theme.light['--dry-color-bg-base']!);
		expect(assessment.contrast).not.toBeNull();
		expect(assessment.apca).not.toBeNull();
		expect(assessment.apcaMagnitude).toBe(Math.abs(assessment.apca ?? 0));
	});

	test('compares the same foreground token across multiple surfaces', () => {
		const comparison = compareForegroundAcrossSurfaces(theme.light['--dry-color-text-weak']!, [
			theme.light['--dry-color-bg-base']!,
			theme.dark['--dry-color-bg-base']!,
			theme.dark['--dry-color-bg-raised']!
		]);

		expect(comparison.foreground).toBe(theme.light['--dry-color-text-weak']!);
		expect(comparison.assessments).toHaveLength(3);
		expect(comparison.contrastSpread).not.toBeNull();
		expect(comparison.apcaMagnitudeSpread).not.toBeNull();
	});

	test('treats transparent fills differently from opaque fills', () => {
		const solid = measureForegroundOnSurface(
			theme.light['--dry-color-fill-brand']!,
			theme.light['--dry-color-bg-base']!,
			{ contrast: 0, apca: 0 }
		);
		const transparent = measureForegroundOnSurface(
			theme.light['--dry-color-fill-brand-weak']!,
			theme.light['--dry-color-bg-base']!,
			{ contrast: 0, apca: 0 }
		);

		expect(solid.contrast).not.toBeNull();
		expect(transparent.contrast).not.toBeNull();
		expect((transparent.contrast ?? 0) < (solid.contrast ?? 0)).toBe(true);
		expect((transparent.apcaMagnitude ?? 0) < (solid.apcaMagnitude ?? 0)).toBe(true);
	});
});

describe('generateTheme — backgrounds', () => {
	const brand: BrandInput = { h: 30, s: 60, b: 80 };
	const { light, dark } = generateTheme(brand);

	test('light backgrounds are white', () => {
		expect(light['--dry-color-bg-base']).toBe('#ffffff');
		expect(light['--dry-color-bg-raised']).toBe('#ffffff');
		expect(light['--dry-color-bg-overlay']).toBe('#ffffff');
	});

	test('dark backgrounds are dark and hue-tinted', () => {
		// Should be hsl() strings
		expect(dark['--dry-color-bg-base']).toMatch(/^hsl\(/);
		expect(dark['--dry-color-bg-raised']).toMatch(/^hsl\(/);
		expect(dark['--dry-color-bg-overlay']).toMatch(/^hsl\(/);
	});

	test('dark bg-base is darker than bg-raised', () => {
		const base = dark['--dry-color-bg-base']!;
		const raised = dark['--dry-color-bg-raised']!;
		const lBase = parseFloat(base.match(/,\s*([\d.]+)%\)/)![1]!);
		const lRaised = parseFloat(raised.match(/,\s*([\d.]+)%\)/)![1]!);
		expect(lBase).toBeLessThan(lRaised);
	});

	test('custom dark bg overrides are respected', () => {
		const { dark: customDark } = generateTheme(brand, {
			darkBg: { base: '#111111', raised: '#222222', overlay: '#333333' }
		});
		expect(customDark['--dry-color-bg-base']).toBe('#111111');
		expect(customDark['--dry-color-bg-raised']).toBe('#222222');
		expect(customDark['--dry-color-bg-overlay']).toBe('#333333');
	});

	test('semantic surface helpers mirror the solid surface ladder and inverse base', () => {
		expect(light['--dry-color-bg-sunken']).not.toBe(light['--dry-color-bg-base']);
		expect(light['--dry-color-bg-alternate']).toBe(light['--dry-color-bg-sunken']);
		expect(light['--dry-color-bg-brand']).toBe(light['--dry-color-fill-brand']);
		expect(light['--dry-color-bg-inverse']).toBe(dark['--dry-color-bg-base']);
		expect(dark['--dry-color-bg-inverse']).toBe(light['--dry-color-bg-base']);
	});
});

describe('generateTheme — semantic parity helpers', () => {
	const brand: BrandInput = { h: 220, s: 80, b: 70 };
	const { light, dark } = generateTheme(brand);

	test('disabled neutrals resolve to the weak stroke treatment', () => {
		expect(light['--dry-color-text-disabled']).toBe(light['--dry-color-stroke-weak']);
		expect(light['--dry-color-icon-disabled']).toBe(light['--dry-color-stroke-weak']);
		expect(light['--dry-color-fill-disabled']).toBe(light['--dry-color-stroke-weak']);
		expect(dark['--dry-color-text-disabled']).toBe(dark['--dry-color-stroke-weak']);
	});

	test('inverse families reuse the opposite mode semantic neutrals', () => {
		expect(light['--dry-color-text-inverse']).toBe(dark['--dry-color-text-strong']);
		expect(light['--dry-color-stroke-inverse']).toBe(dark['--dry-color-stroke-strong']);
		expect(light['--dry-color-fill-inverse']).toBe(light['--dry-color-text-inverse']);
		expect(dark['--dry-color-text-inverse']).toBe(light['--dry-color-text-strong']);
		expect(dark['--dry-color-stroke-inverse']).toBe(light['--dry-color-stroke-strong']);
		expect(dark['--dry-color-fill-inverse']).toBe(dark['--dry-color-text-inverse']);
	});

	test('utility fills stay explicit', () => {
		expect(light['--dry-color-fill-white']).toBe('#ffffff');
		expect(light['--dry-color-fill-yellow']).toBe('#fec62e');
		expect(dark['--dry-color-fill-yellow']).toBe('#fec62e');
	});
});

describe('generateTheme — status tokens', () => {
	const brand: BrandInput = { h: 220, s: 80, b: 70 };
	const { light, dark } = generateTheme(brand);

	const tones = ['error', 'warning', 'success', 'info'];
	const tokenSuffixes = [
		'--dry-color-text-{tone}',
		'--dry-color-fill-{tone}',
		'--dry-color-fill-{tone}-hover',
		'--dry-color-fill-{tone}-weak',
		'--dry-color-stroke-{tone}',
		'--dry-color-on-{tone}'
	];

	test('all 4 status tones are present', () => {
		for (const tone of tones) {
			expect(light[`--dry-color-fill-${tone}`]).toBeDefined();
			expect(dark[`--dry-color-fill-${tone}`]).toBeDefined();
		}
	});

	test('all 6 token types per tone exist in light mode', () => {
		for (const tone of tones) {
			for (const suffix of tokenSuffixes) {
				const key = suffix.replace('{tone}', tone);
				expect(light[key]).toBeDefined();
			}
		}
	});

	test('all 6 token types per tone exist in dark mode', () => {
		for (const tone of tones) {
			for (const suffix of tokenSuffixes) {
				const key = suffix.replace('{tone}', tone);
				expect(dark[key]).toBeDefined();
			}
		}
	});

	test('32 status tokens total (core tone set plus icon and strong-stroke helpers)', () => {
		let count = 0;
		for (const key of Object.keys(light)) {
			if (tones.some((t) => key.includes(t))) count++;
		}
		expect(count).toBe(32);
	});

	test('error fill has red-ish hue (hue 0)', () => {
		const fillError = light['--dry-color-fill-error'];
		expect(fillError).toMatch(/^hsl\(0,/);
	});

	test('success fill has green-ish hue (hue 145)', () => {
		const fillSuccess = light['--dry-color-fill-success'];
		expect(fillSuccess).toMatch(/^hsl\(145,/);
	});

	test('custom status hues are respected', () => {
		const { light: customLight } = generateTheme(brand, {
			statusHues: { error: 15, warning: 50, success: 130, info: 200 }
		});
		expect(customLight['--dry-color-fill-error']).toMatch(/^hsl\(15,/);
		expect(customLight['--dry-color-fill-warning']).toMatch(/^hsl\(50,/);
		expect(customLight['--dry-color-fill-success']).toMatch(/^hsl\(130,/);
		expect(customLight['--dry-color-fill-info']).toMatch(/^hsl\(200,/);
	});

	test('fill-tone-weak uses alpha', () => {
		for (const tone of tones) {
			expect(light[`--dry-color-fill-${tone}-weak`]).toMatch(/^hsla\(/);
			expect(dark[`--dry-color-fill-${tone}-weak`]).toMatch(/^hsla\(/);
		}
	});
});

describe('generateTheme — shadows', () => {
	const brand: BrandInput = { h: 220, s: 80, b: 70 };
	const { light, dark } = generateTheme(brand);

	test('--dry-shadow-raised and --dry-shadow-overlay exist in both modes', () => {
		expect(light['--dry-shadow-raised']).toBeDefined();
		expect(light['--dry-shadow-overlay']).toBeDefined();
		expect(dark['--dry-shadow-raised']).toBeDefined();
		expect(dark['--dry-shadow-overlay']).toBeDefined();
	});

	test('shadows are full box-shadow shorthand (contain offset and blur values)', () => {
		// Full shorthand starts with offset values like "0 1px 3px ..."
		expect(light['--dry-shadow-raised']).toMatch(/^0 \d+px \d+px hsla\(/);
		expect(light['--dry-shadow-overlay']).toMatch(/^0 \d+px \d+px hsla\(/);
		expect(dark['--dry-shadow-raised']).toMatch(/^0 \d+px \d+px hsla\(/);
		expect(dark['--dry-shadow-overlay']).toMatch(/^0 \d+px \d+px hsla\(/);
	});

	test('shadows contain two layers (comma-separated)', () => {
		expect(light['--dry-shadow-raised']!.split(', 0 ').length).toBe(2);
		expect(light['--dry-shadow-overlay']!.split(', 0 ').length).toBe(2);
		expect(dark['--dry-shadow-raised']!.split(', 0 ').length).toBe(2);
		expect(dark['--dry-shadow-overlay']!.split(', 0 ').length).toBe(2);
	});

	test('dark shadows have higher alpha than light shadows', () => {
		// Extract the last alpha value from the last hsla() in each shadow
		const extractLastAlpha = (s: string): number => {
			const matches = [...s.matchAll(/hsla\([^)]+,\s*([\d.]+)\)/g)];
			return parseFloat(matches[matches.length - 1]![1]!);
		};
		const lightAlpha = extractLastAlpha(light['--dry-shadow-raised']!);
		const darkAlpha = extractLastAlpha(dark['--dry-shadow-raised']!);
		expect(darkAlpha).toBeGreaterThan(lightAlpha);
	});

	test('shadows are brand-hue-tinted', () => {
		// Should contain brand hue (220)
		expect(light['--dry-shadow-raised']).toContain('220');
		expect(dark['--dry-shadow-raised']).toContain('220');
	});

	test('light raised shadow matches expected shorthand', () => {
		expect(light['--dry-shadow-raised']).toBe(
			'0 1px 3px hsla(220, 20%, 20%, 0.08), 0 1px 2px hsla(220, 20%, 20%, 0.06)'
		);
	});

	test('dark raised shadow matches expected shorthand', () => {
		expect(dark['--dry-shadow-raised']).toBe(
			'0 1px 3px hsla(220, 30%, 5%, 0.4), 0 1px 2px hsla(220, 30%, 5%, 0.3)'
		);
	});

	test('light overlay shadow matches expected shorthand', () => {
		expect(light['--dry-shadow-overlay']).toBe(
			'0 8px 24px hsla(220, 20%, 20%, 0.12), 0 2px 8px hsla(220, 20%, 20%, 0.08)'
		);
	});

	test('dark overlay shadow matches expected shorthand', () => {
		expect(dark['--dry-shadow-overlay']).toBe(
			'0 8px 24px hsla(220, 30%, 5%, 0.5), 0 2px 8px hsla(220, 30%, 5%, 0.4)'
		);
	});
});

describe('generateTheme — overlay backdrops', () => {
	const brand: BrandInput = { h: 220, s: 80, b: 70 };
	const { light, dark } = generateTheme(brand);

	test('--dry-color-overlay-backdrop and --dry-color-overlay-backdrop-strong exist in both modes', () => {
		expect(light['--dry-color-overlay-backdrop']).toBeDefined();
		expect(light['--dry-color-overlay-backdrop-strong']).toBeDefined();
		expect(dark['--dry-color-overlay-backdrop']).toBeDefined();
		expect(dark['--dry-color-overlay-backdrop-strong']).toBeDefined();
	});

	test('old backdrop-sm / backdrop-lg keys are gone', () => {
		expect(light['--dry-color-backdrop-sm']).toBeUndefined();
		expect(light['--dry-color-backdrop-lg']).toBeUndefined();
		expect(dark['--dry-color-backdrop-sm']).toBeUndefined();
		expect(dark['--dry-color-backdrop-lg']).toBeUndefined();
	});

	test('dark backdrops are more opaque than light backdrops', () => {
		const lightAlpha = parseFloat(
			light['--dry-color-overlay-backdrop']!.split(', ').pop()!.replace(')', '')
		);
		const darkAlpha = parseFloat(
			dark['--dry-color-overlay-backdrop']!.split(', ').pop()!.replace(')', '')
		);
		expect(darkAlpha).toBeGreaterThan(lightAlpha);
	});

	test('overlay-backdrop-strong is more opaque than overlay-backdrop in each mode', () => {
		const lightBase = parseFloat(
			light['--dry-color-overlay-backdrop']!.split(', ').pop()!.replace(')', '')
		);
		const lightStrong = parseFloat(
			light['--dry-color-overlay-backdrop-strong']!.split(', ').pop()!.replace(')', '')
		);
		expect(lightStrong).toBeGreaterThan(lightBase);

		const darkBase = parseFloat(
			dark['--dry-color-overlay-backdrop']!.split(', ').pop()!.replace(')', '')
		);
		const darkStrong = parseFloat(
			dark['--dry-color-overlay-backdrop-strong']!.split(', ').pop()!.replace(')', '')
		);
		expect(darkStrong).toBeGreaterThan(darkBase);
	});
});

describe('generateTheme — edge cases', () => {
	test('works with pure hue (fully saturated)', () => {
		const brand: BrandInput = { h: 0, s: 100, b: 100 };
		expect(() => generateTheme(brand)).not.toThrow();
		const { light, dark } = generateTheme(brand);
		expect(Object.keys(light).length).toBeGreaterThan(0);
		expect(Object.keys(dark).length).toBeGreaterThan(0);
	});

	test('works with achromatic brand (s=0)', () => {
		const brand: BrandInput = { h: 0, s: 0, b: 50 };
		expect(() => generateTheme(brand)).not.toThrow();
		const { light } = generateTheme(brand);
		expect(light['--dry-color-brand']).toBeDefined();
	});

	test('works with maximum brightness brand', () => {
		const brand: BrandInput = { h: 180, s: 50, b: 100 };
		expect(() => generateTheme(brand)).not.toThrow();
	});

	test('works with minimum brightness brand', () => {
		const brand: BrandInput = { h: 180, s: 50, b: 5 };
		expect(() => generateTheme(brand)).not.toThrow();
	});

	test('hue wrapping: H=360 treated as H=0', () => {
		const { light: l360 } = generateTheme({ h: 360, s: 70, b: 60 });
		const { light: l0 } = generateTheme({ h: 0, s: 70, b: 60 });
		// Should produce identical output since hue modulo 360 = same color
		expect(l360['--dry-color-fill-brand']).toBe(l0['--dry-color-fill-brand']);
	});
});

describe('generateThemeModel', () => {
	test('exposes a first-class primitive, _Theme, and semantic chain', () => {
		const model = generateThemeModel({ h: 230, s: 65, b: 85 });

		expect(model.primitives.light['brand.fill']).toBe(
			model.tokens.light['--dry-color-fill-brand']!
		);
		expect(model.transparentPrimitives.neutral.light.fill).toBe(
			model.tokens.light['--dry-color-fill']!
		);
		expect(model._theme.light['Theme/Brand/Fill']).toEqual({
			source: 'brand.fill',
			value: model.tokens.light['--dry-color-fill-brand']!
		});
		expect(model.semantic.light['--dry-color-fill-brand']).toEqual({
			source: 'Theme/Brand/Fill',
			value: model.tokens.light['--dry-color-fill-brand']!
		});
	});

	test('keeps the semantic output identical to generateTheme', () => {
		const tokens = generateTheme({ h: 230, s: 65, b: 85 }, { neutralMode: 'neutral' });
		const model = generateThemeModel({ h: 230, s: 65, b: 85 }, { neutralMode: 'neutral' });

		expect(model.tokens).toEqual(tokens);
		expect(model.semantic.dark['--dry-color-bg-overlay']).toEqual({
			source: 'Theme/Surface/Overlay',
			value: tokens.dark['--dry-color-bg-overlay']!
		});
	});

	test('keeps Practical UI naming translations explicit in the semantic chain', () => {
		const model = generateThemeModel({ h: 230, s: 65, b: 85 });

		expect(model.semantic.light['--dry-color-text-info']).toEqual({
			source: 'Theme/Info/Text',
			value: model.tokens.light['--dry-color-text-info']!
		});
		expect(model.semantic.light['--dry-color-fill-active']).toEqual({
			source: 'Theme/Neutral/Fill/Active',
			value: model.tokens.light['--dry-color-fill-active']!
		});
		expect(model.semantic.light['--dry-color-bg-base']).toEqual({
			source: 'Theme/Surface/Base',
			value: model.tokens.light['--dry-color-bg-base']!
		});
	});

	test('maps the expanded semantic parity roles through _Theme', () => {
		const model = generateThemeModel({ h: 230, s: 65, b: 85 });

		expect(model._theme.light['Theme/Surface/Sunken']).toEqual({
			source: 'surface.sunken',
			value: model.tokens.light['--dry-color-bg-sunken']!
		});
		expect(model.semantic.light['--dry-color-text-disabled']).toEqual({
			source: 'Theme/Neutral/Text/Disabled',
			value: model.tokens.light['--dry-color-text-disabled']!
		});
		expect(model.semantic.light['--dry-color-fill-inverse-hover']).toEqual({
			source: 'Theme/Neutral/Inverse/Fill/Hover',
			value: model.tokens.light['--dry-color-fill-inverse-hover']!
		});
		expect(model.semantic.light['--dry-color-icon-brand']).toEqual({
			source: 'Theme/Brand/Icon',
			value: model.tokens.light['--dry-color-icon-brand']!
		});
		expect(model.semantic.light['--dry-color-stroke-info-strong']).toEqual({
			source: 'Theme/Info/Stroke/Strong',
			value: model.tokens.light['--dry-color-stroke-info-strong']!
		});
	});

	test('exposes literal transparent ladders, solid palettes, and interaction state recipes', () => {
		const model = generateThemeModel({ h: 230, s: 65, b: 85 });

		expect(model.literalTransparentPrimitives.neutral.light['1000']).toMatch(/^hsla\(/);
		expect(model.literalTransparentPrimitives.brand.dark['800']).toMatch(/^hsla\(/);
		expect(model.literalTransparentPrimitives.system.info.light['50']).toMatch(/^hsla\(/);
		expect(model.solidPrimitives.grey.light.roles.base).toBe('#ffffff');
		expect(model.solidPrimitives.grey.dark.roles.overlay).toBe(
			model.tokens.dark['--dry-color-bg-overlay']!
		);
		expect(model.interactionStates.brand.light.focusRing).toBe(
			model.tokens.light['--dry-color-focus-ring']!
		);
		expect(model.interactionStates.system.warning.dark.disabledFill).toBe(
			model.tokens.dark['--dry-color-fill-warning-weak']!
		);
	});

	test('emits a shared audit result for token contexts', () => {
		const model = generateThemeModel({ h: 230, s: 65, b: 85 });

		expect(model.audit.contextChecks.length).toBeGreaterThan(10);
		expect(model.audit.allPass).toBe(true);
		expect(model.audit.contextChecks.every((check) => check.passes)).toBe(true);
	});

	test('chooses the safest interaction hue from multiple brand candidates', () => {
		const model = generateThemeModel(
			{ h: 0, s: 80, b: 88 },
			{
				brandCandidates: [
					{ h: 230, s: 65, b: 85 },
					{ h: 160, s: 70, b: 80 }
				]
			}
		);

		expect(model.brandPolicy.multipleBrand).toBe(true);
		expect(model.brandPolicy.interactive.id).toBe('accent-1');
		expect(model.brandPolicy.fallbackTriggered).toBe(true);
	});
});
