import { describe, test, expect } from 'bun:test';
import { variantAttrs } from '../../packages/primitives/src/utils/variant-attrs.svelte.ts';

describe('variantAttrs', () => {
	test('prefixes unqualified keys with data-', () => {
		expect(variantAttrs({ variant: 'solid', size: 'md', color: 'primary' })).toEqual({
			'data-variant': 'solid',
			'data-size': 'md',
			'data-color': 'primary'
		});
	});

	test('omits keys whose value is undefined', () => {
		expect(variantAttrs({ variant: 'solid', size: undefined, color: 'primary' })).toEqual({
			'data-variant': 'solid',
			'data-color': 'primary'
		});
	});

	test('omits keys whose value is null', () => {
		expect(variantAttrs({ variant: null, size: 'md' })).toEqual({
			'data-size': 'md'
		});
	});

	test('passes keys that already start with data- through verbatim', () => {
		expect(variantAttrs({ 'data-state': 'open', variant: 'solid' })).toEqual({
			'data-state': 'open',
			'data-variant': 'solid'
		});
	});

	test('accepts arbitrary key names beyond variant/size/color', () => {
		expect(
			variantAttrs({
				tone: 'brand',
				emphasis: 'strong',
				orientation: 'horizontal',
				density: 'compact'
			})
		).toEqual({
			'data-tone': 'brand',
			'data-emphasis': 'strong',
			'data-orientation': 'horizontal',
			'data-density': 'compact'
		});
	});

	test('coerces non-string values to strings', () => {
		expect(variantAttrs({ step: 3, active: true })).toEqual({
			'data-step': '3',
			'data-active': 'true'
		});
	});

	test('returns an empty object when every value is undefined', () => {
		expect(variantAttrs({ variant: undefined, size: undefined })).toEqual({});
	});

	test('preserves empty-string values (used as boolean-style markers)', () => {
		expect(variantAttrs({ 'data-dot': '', pulse: '' })).toEqual({
			'data-dot': '',
			'data-pulse': ''
		});
	});
});
