import { describe, expect, mock, test } from 'bun:test';

mock.module('$app/paths', () => ({
	base: ''
}));

const { withQueryParam } = await import('./utils.js');

describe('withQueryParam', () => {
	test('adds the requested query param', () => {
		expect(withQueryParam('/theme-wizard', 'dryui-feedback', '1')).toBe(
			'/theme-wizard?dryui-feedback=1'
		);
	});

	test('replaces an existing query param value', () => {
		expect(withQueryParam('/theme-wizard?dryui-feedback=0', 'dryui-feedback', '1')).toBe(
			'/theme-wizard?dryui-feedback=1'
		);
	});

	test('removes the query param when no value is provided', () => {
		expect(
			withQueryParam('/theme-wizard?dryui-feedback=1&view=compact', 'dryui-feedback', null)
		).toBe('/theme-wizard?view=compact');
	});

	test('preserves hash fragments', () => {
		expect(withQueryParam('/theme-wizard#preview', 'dryui-feedback', '1')).toBe(
			'/theme-wizard?dryui-feedback=1#preview'
		);
	});
});
