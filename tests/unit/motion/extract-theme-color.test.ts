import { afterEach, describe, expect, it } from 'bun:test';
import { extractThemeColor } from '../../../packages/ui/src/internal/motion';

const originalDocument = globalThis.document;
const originalWindow = globalThis.window;

function ensureWindow(): Window & typeof globalThis {
	return ((globalThis as typeof globalThis & { window?: Window & typeof globalThis }).window ??=
		globalThis as Window & typeof globalThis);
}

function mockComputedStyle(value: string) {
	const win = ensureWindow();
	(win as typeof win & { getComputedStyle: typeof getComputedStyle }).getComputedStyle = () =>
		({
			getPropertyValue: () => value
		}) as unknown as CSSStyleDeclaration;

	// Ensure document.documentElement exists
	if (!globalThis.document) {
		(globalThis as typeof globalThis & { document: Partial<Document> }).document = {
			documentElement: {} as HTMLElement
		} as Document;
	} else if (!globalThis.document.documentElement) {
		Object.defineProperty(globalThis.document, 'documentElement', {
			value: {} as HTMLElement,
			configurable: true
		});
	}
}

afterEach(() => {
	if (originalWindow) {
		(globalThis as typeof globalThis & { window?: Window & typeof globalThis }).window =
			originalWindow as Window & typeof globalThis;
	}
	if (originalDocument) {
		globalThis.document = originalDocument;
	}
});

describe('extractThemeColor', () => {
	it('parses rgb() format', () => {
		mockComputedStyle('rgb(255, 128, 0)');
		const result = extractThemeColor('--dry-color-primary');
		expect(result[0]).toBeCloseTo(1.0, 2);
		expect(result[1]).toBeCloseTo(0.502, 2);
		expect(result[2]).toBeCloseTo(0.0, 2);
	});

	it('parses rgba() format', () => {
		mockComputedStyle('rgba(51, 102, 204, 0.8)');
		const result = extractThemeColor('--dry-color-primary');
		expect(result[0]).toBeCloseTo(0.2, 2);
		expect(result[1]).toBeCloseTo(0.4, 2);
		expect(result[2]).toBeCloseTo(0.8, 2);
	});

	it('parses 6-digit hex format', () => {
		mockComputedStyle('#3b82f6');
		const result = extractThemeColor('--dry-color-primary');
		expect(result[0]).toBeCloseTo(0.231, 2);
		expect(result[1]).toBeCloseTo(0.51, 2);
		expect(result[2]).toBeCloseTo(0.965, 2);
	});

	it('parses 3-digit hex format', () => {
		mockComputedStyle('#f00');
		const result = extractThemeColor('--dry-color-primary');
		expect(result[0]).toBeCloseTo(1.0, 2);
		expect(result[1]).toBeCloseTo(0.0, 2);
		expect(result[2]).toBeCloseTo(0.0, 2);
	});

	it('returns black for unparsable values', () => {
		mockComputedStyle('hsl(200, 50%, 50%)');
		const result = extractThemeColor('--dry-color-primary');
		expect(result).toEqual([0, 0, 0]);
	});

	it('returns black for empty value', () => {
		mockComputedStyle('');
		const result = extractThemeColor('--dry-color-primary');
		expect(result).toEqual([0, 0, 0]);
	});
});
