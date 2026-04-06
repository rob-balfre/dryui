// apps/docs/src/lib/theme-wizard/url-codec.test.ts
import { describe, test, expect } from 'bun:test';
import { encodeTheme, decodeTheme } from './url-codec.js';
import type { BrandInput, ThemeOptions } from './derivation.js';

// ─── Round-trip helpers ────────────────────────────────────────────────────────

function roundTrip(brand: BrandInput, options?: ThemeOptions) {
	const input = options !== undefined ? { brand, options } : { brand };
	const encoded = encodeTheme(input);
	return { encoded, decoded: decodeTheme(encoded) };
}

// ─── Encoding ─────────────────────────────────────────────────────────────────

describe('encodeTheme', () => {
	test('encodes default brand to h230s65b85', () => {
		const encoded = encodeTheme({ brand: { h: 230, s: 65, b: 85 } });
		expect(encoded).toBe('h230s65b85');
	});

	test('encodes ocean brand to h200s80b70', () => {
		const encoded = encodeTheme({ brand: { h: 200, s: 80, b: 70 } });
		expect(encoded).toBe('h200s80b70');
	});

	test('encodes brand without options — no dash suffix', () => {
		const encoded = encodeTheme({ brand: { h: 145, s: 60, b: 55 } });
		expect(encoded).not.toContain('-');
	});

	test('encodes brand + error hue override with dash separator', () => {
		const encoded = encodeTheme({
			brand: { h: 230, s: 65, b: 85 },
			options: { statusHues: { error: 350 } }
		});
		expect(encoded).toBe('h230s65b85-e350');
	});

	test('encodes brand + multiple status hue overrides', () => {
		const encoded = encodeTheme({
			brand: { h: 230, s: 65, b: 85 },
			options: { statusHues: { error: 350, warning: 45 } }
		});
		expect(encoded).toBe('h230s65b85-e350w45');
	});

	test('encodes all four status hues', () => {
		const encoded = encodeTheme({
			brand: { h: 230, s: 65, b: 85 },
			options: { statusHues: { error: 0, warning: 40, success: 145, info: 210 } }
		});
		expect(encoded).toBe('h230s65b85-e0w40s145i210');
	});

	test('empty statusHues object produces no suffix', () => {
		const encoded = encodeTheme({ brand: { h: 230, s: 65, b: 85 }, options: { statusHues: {} } });
		expect(encoded).toBe('h230s65b85');
	});

	test('rounds fractional hue values', () => {
		const encoded = encodeTheme({ brand: { h: 230.7, s: 65.4, b: 85.2 } });
		expect(encoded).toBe('h231s65b85');
	});
});

// ─── Decoding ─────────────────────────────────────────────────────────────────

describe('decodeTheme', () => {
	test('decodes h230s65b85 to default brand', () => {
		const { brand } = decodeTheme('h230s65b85');
		expect(brand).toEqual({ h: 230, s: 65, b: 85 });
	});

	test('decodes brand-only string — options is undefined', () => {
		const result = decodeTheme('h200s80b70');
		expect(result.options).toBeUndefined();
	});

	test('decodes string with single status hue override', () => {
		const result = decodeTheme('h230s65b85-e350');
		expect(result.brand).toEqual({ h: 230, s: 65, b: 85 });
		expect(result.options?.statusHues?.error).toBe(350);
	});

	test('decodes string with multiple status hue overrides', () => {
		const result = decodeTheme('h230s65b85-e350w45');
		expect(result.options?.statusHues?.error).toBe(350);
		expect(result.options?.statusHues?.warning).toBe(45);
	});

	test('decodes all four status hues', () => {
		const result = decodeTheme('h230s65b85-e0w40s145i210');
		expect(result.options?.statusHues).toEqual({
			error: 0,
			warning: 40,
			success: 145,
			info: 210
		});
	});

	test('throws on empty string', () => {
		expect(() => decodeTheme('')).toThrow();
	});

	test('throws on invalid brand segment', () => {
		expect(() => decodeTheme('invalid')).toThrow();
	});
});

// ─── Round-trip ───────────────────────────────────────────────────────────────

describe('round-trip', () => {
	test('default brand round-trips', () => {
		const brand: BrandInput = { h: 230, s: 65, b: 85 };
		const { decoded } = roundTrip(brand);
		expect(decoded.brand).toEqual(brand);
	});

	test('ocean brand round-trips', () => {
		const brand: BrandInput = { h: 200, s: 80, b: 70 };
		const { decoded } = roundTrip(brand);
		expect(decoded.brand).toEqual(brand);
	});

	test('forest brand round-trips', () => {
		const brand: BrandInput = { h: 145, s: 60, b: 55 };
		const { decoded } = roundTrip(brand);
		expect(decoded.brand).toEqual(brand);
	});

	test('sunset brand round-trips', () => {
		const brand: BrandInput = { h: 25, s: 80, b: 90 };
		const { decoded } = roundTrip(brand);
		expect(decoded.brand).toEqual(brand);
	});

	test('brand + error hue override round-trips', () => {
		const brand: BrandInput = { h: 230, s: 65, b: 85 };
		const options: ThemeOptions = { statusHues: { error: 350 } };
		const { decoded } = roundTrip(brand, options);
		expect(decoded.brand).toEqual(brand);
		expect(decoded.options?.statusHues?.error).toBe(350);
	});

	test('brand + all status hues round-trips', () => {
		const brand: BrandInput = { h: 230, s: 65, b: 85 };
		const options: ThemeOptions = {
			statusHues: { error: 5, warning: 38, success: 150, info: 205 }
		};
		const { decoded } = roundTrip(brand, options);
		expect(decoded.brand).toEqual(brand);
		expect(decoded.options?.statusHues).toEqual({ error: 5, warning: 38, success: 150, info: 205 });
	});

	test('compact string format — no redundant characters', () => {
		const { encoded } = roundTrip({ h: 230, s: 65, b: 85 });
		// Should be short: h230s65b85 = 10 chars
		expect(encoded.length).toBeLessThanOrEqual(15);
	});

	test('encoded string only uses URL-safe characters', () => {
		const { encoded } = roundTrip(
			{ h: 230, s: 65, b: 85 },
			{ statusHues: { error: 0, warning: 40, success: 145, info: 210 } }
		);
		expect(encoded).toMatch(/^[a-zA-Z0-9-]+$/);
	});
});
