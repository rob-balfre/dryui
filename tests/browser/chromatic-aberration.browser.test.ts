import { describe, expect, it } from 'vitest';
import ChromaticAberrationHarness from './fixtures/chromatic-aberration-harness.svelte';
import { render } from './_harness';

describe('ChromaticAberration', () => {
	it('adds alpha-derived color fringes before preserving the original content', () => {
		const { target } = render(ChromaticAberrationHarness);

		const root = target.querySelector('[data-chromatic-aberration]');
		const filter = target.querySelector('filter');
		if (!(root instanceof HTMLDivElement) || !(filter instanceof SVGFilterElement)) {
			throw new Error('Expected chromatic aberration root and filter');
		}

		expect(root.getAttribute('style')).toContain('filter: url(');
		expect(filter.getAttribute('x')).toBe('-20%');
		expect(filter.getAttribute('y')).toBe('-20%');
		expect(filter.getAttribute('width')).toBe('140%');
		expect(filter.getAttribute('height')).toBe('140%');

		const alphaOffsets = Array.from(filter.querySelectorAll('feOffset[in="SourceAlpha"]'));
		expect(alphaOffsets.map((node) => node.getAttribute('result'))).toEqual([
			'redAlpha',
			'blueAlpha'
		]);

		const floodColors = Array.from(filter.querySelectorAll('feFlood')).map((node) =>
			node.getAttribute('flood-color')
		);
		expect(floodColors).toEqual(['rgb(255, 24, 86)', 'rgb(0, 132, 255)']);

		const mergeNodes = Array.from(filter.querySelectorAll('feMergeNode')).map((node) =>
			node.getAttribute('in')
		);
		expect(mergeNodes).toEqual(['redOnly', 'blueOnly', 'SourceGraphic']);
	});
});
