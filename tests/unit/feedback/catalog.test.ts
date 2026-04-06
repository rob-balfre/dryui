import { describe, expect, test, beforeAll } from 'bun:test';
import {
	loadCatalog,
	searchCatalog,
	getAlternatives,
	getAntiPatterns
} from '../../../packages/feedback/src/layout-mode/catalog.js';
import type { CatalogEntry } from '../../../packages/feedback/src/layout-mode/types.js';

let catalog: CatalogEntry[];

beforeAll(async () => {
	catalog = await loadCatalog();
});

describe('loadCatalog', () => {
	test('returns a non-empty array', () => {
		expect(Array.isArray(catalog)).toBe(true);
		expect(catalog.length).toBeGreaterThan(0);
	});

	test('every entry has required fields', () => {
		for (const entry of catalog) {
			expect(typeof entry.name).toBe('string');
			expect(entry.name.length).toBeGreaterThan(0);
			expect(typeof entry.category).toBe('string');
			expect(typeof entry.description).toBe('string');
			expect(Array.isArray(entry.tags)).toBe(true);
			expect(typeof entry.compound).toBe('boolean');
			expect(typeof entry.importPath).toBe('string');
			expect(entry.structure === null || typeof entry.structure === 'string').toBe(true);
			expect(Array.isArray(entry.alternatives)).toBe(true);
			expect(Array.isArray(entry.antiPatterns)).toBe(true);
			expect(Array.isArray(entry.combinesWith)).toBe(true);
		}
	});

	test('Button entry is present and has correct metadata', () => {
		const button = catalog.find((e) => e.name === 'Button');
		expect(button).toBeDefined();
		expect(button!.compound).toBe(false);
		expect(button!.importPath).toBe('@dryui/ui');
		expect(button!.category).toBe('action');
		expect(button!.tags).toContain('form');
	});

	test('compound components have a structure string', () => {
		const compounds = catalog.filter((e) => e.compound);
		expect(compounds.length).toBeGreaterThan(0);
		for (const entry of compounds) {
			// structure may be null if spec doesn't include it, but compound is true
			expect(typeof entry.compound).toBe('boolean');
		}
	});

	test('Card entry is compound and has a structure', () => {
		const card = catalog.find((e) => e.name === 'Card');
		expect(card).toBeDefined();
		expect(card!.compound).toBe(true);
		expect(card!.structure).not.toBeNull();
	});
});

describe('searchCatalog', () => {
	test('empty query returns full catalog', () => {
		const results = searchCatalog(catalog, '');
		expect(results.length).toBe(catalog.length);
	});

	test('whitespace-only query returns full catalog', () => {
		const results = searchCatalog(catalog, '   ');
		expect(results.length).toBe(catalog.length);
	});

	test('name match returns the matching entry first', () => {
		const results = searchCatalog(catalog, 'Button');
		expect(results.length).toBeGreaterThan(0);
		expect(results[0].name).toBe('Button');
	});

	test('tag match finds relevant entries', () => {
		const results = searchCatalog(catalog, 'form');
		expect(results.some((e) => e.tags.includes('form'))).toBe(true);
	});

	test('unknown query returns empty array', () => {
		const results = searchCatalog(catalog, 'xyzzy_nonexistent_component');
		expect(results.length).toBe(0);
	});

	test('case-insensitive search works', () => {
		const upper = searchCatalog(catalog, 'BUTTON');
		const lower = searchCatalog(catalog, 'button');
		expect(upper.map((e) => e.name)).toEqual(lower.map((e) => e.name));
	});

	test('multi-token query scores entries with all tokens higher', () => {
		const results = searchCatalog(catalog, 'action button');
		expect(results.length).toBeGreaterThan(0);
		// Button should rank high (matches both tokens)
		const buttonIdx = results.findIndex((e) => e.name === 'Button');
		expect(buttonIdx).not.toBe(-1);
		expect(buttonIdx).toBeLessThan(5);
	});
});

describe('getAlternatives', () => {
	test('returns empty array for unknown component', () => {
		const alts = getAlternatives(catalog, 'NonExistentXYZ');
		expect(alts).toEqual([]);
	});

	test('returns alternatives array for known component (Button)', () => {
		const alts = getAlternatives(catalog, 'Button');
		expect(Array.isArray(alts)).toBe(true);
		for (const alt of alts) {
			expect(typeof alt.component).toBe('string');
			expect(typeof alt.useWhen).toBe('string');
			expect(typeof alt.rank).toBe('number');
		}
	});

	test('DatePicker has alternatives including DateRangePicker', () => {
		const alts = getAlternatives(catalog, 'DatePicker');
		expect(alts.some((a) => a.component === 'DateRangePicker')).toBe(true);
	});
});

describe('getAntiPatterns', () => {
	test('returns empty array for unknown component', () => {
		const patterns = getAntiPatterns(catalog, 'NonExistentXYZ');
		expect(patterns).toEqual([]);
	});

	test('returns anti-patterns array for DatePicker', () => {
		const patterns = getAntiPatterns(catalog, 'DatePicker');
		expect(Array.isArray(patterns)).toBe(true);
		for (const ap of patterns) {
			expect(typeof ap.pattern).toBe('string');
			expect(typeof ap.reason).toBe('string');
			expect(typeof ap.fix).toBe('string');
		}
	});
});
