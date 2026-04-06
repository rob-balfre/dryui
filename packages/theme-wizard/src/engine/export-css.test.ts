// apps/docs/src/lib/theme-wizard/export-css.test.ts
import { describe, test, expect } from 'bun:test';
import { generateCss, exportJson } from './export-css.js';
import { generateTheme } from './derivation.js';

const defaultBrand = generateTheme({ h: 230, s: 65, b: 85 });

describe('generateCss', () => {
	test('defaultCss contains a :root block', () => {
		const { defaultCss } = generateCss(defaultBrand);
		expect(defaultCss).toContain(':root {');
	});

	test('defaultCss contains all light tokens', () => {
		const { defaultCss } = generateCss(defaultBrand);
		for (const [token] of Object.entries(defaultBrand.light)) {
			expect(defaultCss).toContain(token);
		}
	});

	test('defaultCss light token values are present', () => {
		const { defaultCss } = generateCss(defaultBrand);
		for (const [token, value] of Object.entries(defaultBrand.light)) {
			expect(defaultCss).toContain(`${token}: ${value}`);
		}
	});

	test('darkCss contains [data-theme="dark"] block', () => {
		const { darkCss } = generateCss(defaultBrand);
		expect(darkCss).toContain('[data-theme="dark"] {');
	});

	test('darkCss contains all dark tokens', () => {
		const { darkCss } = generateCss(defaultBrand);
		for (const [token] of Object.entries(defaultBrand.dark)) {
			expect(darkCss).toContain(token);
		}
	});

	test('darkCss contains .theme-auto media query', () => {
		const { darkCss } = generateCss(defaultBrand);
		expect(darkCss).toContain('.theme-auto {');
		expect(darkCss).toContain('@media (prefers-color-scheme: dark)');
	});

	test('darkCss .theme-auto block uses & selector', () => {
		const { darkCss } = generateCss(defaultBrand);
		expect(darkCss).toContain('& {');
	});

	test('darkCss includes dark token values inside .theme-auto', () => {
		const { darkCss } = generateCss(defaultBrand);
		// Pick an arbitrary dark token and verify it appears twice (in both blocks)
		const firstToken = Object.keys(defaultBrand.dark)[0] ?? '--dry-color-text-strong';
		const occurrences = darkCss.split(firstToken).length - 1;
		expect(occurrences).toBeGreaterThanOrEqual(2);
	});

	test('different brand colors produce different CSS', () => {
		const oceanTheme = generateTheme({ h: 200, s: 80, b: 70 });
		const { defaultCss: defaultDefault } = generateCss(defaultBrand);
		const { defaultCss: defaultOcean } = generateCss(oceanTheme);
		expect(defaultDefault).not.toBe(defaultOcean);
	});
});

describe('exportJson', () => {
	test('returns valid JSON', () => {
		const json = exportJson(defaultBrand);
		expect(() => JSON.parse(json)).not.toThrow();
	});

	test('JSON contains light and dark keys', () => {
		const parsed = JSON.parse(exportJson(defaultBrand));
		expect(parsed).toHaveProperty('light');
		expect(parsed).toHaveProperty('dark');
	});

	test('JSON light tokens match theme', () => {
		const parsed = JSON.parse(exportJson(defaultBrand));
		for (const [token, value] of Object.entries(defaultBrand.light)) {
			expect(parsed.light[token]).toBe(value);
		}
	});

	test('JSON dark tokens match theme', () => {
		const parsed = JSON.parse(exportJson(defaultBrand));
		for (const [token, value] of Object.entries(defaultBrand.dark)) {
			expect(parsed.dark[token]).toBe(value);
		}
	});
});
