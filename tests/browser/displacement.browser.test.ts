import { describe, expect, it } from 'vitest';
import { render } from './_harness';
import DisplacementHarness from './fixtures/displacement-harness.svelte';

function byTestId(target: HTMLElement, id: string): HTMLElement {
	const element = target.querySelector<HTMLElement>(`[data-testid="${id}"]`);
	if (!element) throw new Error(`Missing [data-testid="${id}"]`);
	return element;
}

describe('Displacement', () => {
	it('fills a framed parent so visual children remain visible', () => {
		const { target } = render(DisplacementHarness);

		const frame = byTestId(target, 'frame');
		const displacement = byTestId(target, 'displacement');
		const artwork = byTestId(target, 'artwork');

		const frameHeight = frame.getBoundingClientRect().height;
		const displacementHeight = displacement.getBoundingClientRect().height;
		const artworkHeight = artwork.getBoundingClientRect().height;

		expect(displacement.getAttribute('style')).toContain('filter: url(');
		expect(frameHeight).toBeGreaterThan(0);
		expect(displacementHeight).toBeCloseTo(frameHeight, 0);
		expect(artworkHeight).toBeCloseTo(frameHeight, 0);
	});
});
