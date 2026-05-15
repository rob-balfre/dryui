import { describe, expect, it } from 'vitest';
import { render } from './_harness';
import GradientMeshHarness from './fixtures/gradient-mesh-harness.svelte';

function byTestId(target: HTMLElement, id: string): HTMLElement {
	const element = target.querySelector<HTMLElement>(`[data-testid="${id}"]`);
	if (!element) throw new Error(`Missing [data-testid="${id}"]`);
	return element;
}

describe('GradientMesh', () => {
	it('renders a complete mesh surface instead of transparent color islands', () => {
		const { target } = render(GradientMeshHarness);

		const mesh = byTestId(target, 'gradient-mesh');
		const preview = byTestId(target, 'gradient-mesh-preview');
		const background = getComputedStyle(mesh).backgroundImage;
		const radialLayers = background.match(/radial-gradient/g) ?? [];

		expect(mesh.getBoundingClientRect().height).toBeCloseTo(
			preview.getBoundingClientRect().height,
			0
		);
		expect(radialLayers).toHaveLength(4);
		expect(background).toContain('linear-gradient');
	});
});
