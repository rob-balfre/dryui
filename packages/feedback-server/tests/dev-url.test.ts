import { describe, expect, test } from 'bun:test';
import { normalizeDevUrl } from '../src/dev-url.js';

describe('normalizeDevUrl', () => {
	test('adds the feedback query flag to a bare dev app url', () => {
		expect(normalizeDevUrl('http://127.0.0.1:5173')).toBe(
			'http://127.0.0.1:5173/?dryui-feedback=1'
		);
	});

	test('preserves existing params while forcing the feedback query flag on', () => {
		expect(normalizeDevUrl('http://127.0.0.1:5173/components/button?foo=bar#demo')).toBe(
			'http://127.0.0.1:5173/components/button?foo=bar&dryui-feedback=1#demo'
		);
	});

	test('returns null for missing values', () => {
		expect(normalizeDevUrl(null)).toBeNull();
		expect(normalizeDevUrl('   ')).toBeNull();
	});
});
