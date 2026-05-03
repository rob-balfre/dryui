import { describe, expect, mock, test } from 'bun:test';

mock.module('$app/paths', () => ({
	base: ''
}));

const { withQueryParam } = await import('./utils.js');

describe('withQueryParam', () => {
	test('adds the requested query param', () => {
		expect(withQueryParam('/getting-started', 'dryui-feedback', '1')).toBe(
			'/getting-started?dryui-feedback=1'
		);
	});

	test('replaces an existing query param value', () => {
		expect(withQueryParam('/getting-started?dryui-feedback=0', 'dryui-feedback', '1')).toBe(
			'/getting-started?dryui-feedback=1'
		);
	});

	test('removes the query param when no value is provided', () => {
		expect(
			withQueryParam('/getting-started?dryui-feedback=1&view=compact', 'dryui-feedback', null)
		).toBe('/getting-started?view=compact');
	});

	test('preserves hash fragments', () => {
		expect(withQueryParam('/getting-started#install', 'dryui-feedback', '1')).toBe(
			'/getting-started?dryui-feedback=1#install'
		);
	});
});
