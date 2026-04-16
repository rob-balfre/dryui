import { describe, expect, test } from 'bun:test';

import { resolveBorderRadiusValue } from '../../packages/primitives/src/border-beam/radius.js';

describe('resolveBorderRadiusValue', () => {
	test('uses the host computed radius when a string borderRadius prop is provided', () => {
		expect(
			resolveBorderRadiusValue({
				borderRadius: 'var(--dry-radius-xl)',
				presetRadius: 16,
				hostRadius: '24px'
			})
		).toBe(24);
	});

	test('preserves explicit numeric borderRadius props', () => {
		expect(
			resolveBorderRadiusValue({
				borderRadius: 12,
				presetRadius: 16,
				hostRadius: '24px',
				childRadius: '18px'
			})
		).toBe(12);
	});

	test('falls back to detected child radius when no prop override is provided', () => {
		expect(
			resolveBorderRadiusValue({
				borderRadius: undefined,
				presetRadius: 16,
				childRadius: '20px'
			})
		).toBe(20);
	});
});
