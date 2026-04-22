import { describe, expect, it } from 'vitest';
import ChipGroupHarness from './fixtures/chip-group-harness.svelte';
import { render } from './_harness';

function getChipGroup(testId: string): HTMLElement {
	const wrapper = document.querySelector<HTMLElement>(`[data-testid="${testId}"]`);
	if (!wrapper) throw new Error(`Expected wrapper ${testId}`);
	const root = wrapper.querySelector<HTMLElement>('[data-chip-group]');
	if (!root) throw new Error(`Expected [data-chip-group] in ${testId}`);
	return root;
}

describe('ChipGroup', () => {
	it('renders root with data-chip-group and role=group', () => {
		render(ChipGroupHarness);

		const root = getChipGroup('default');
		expect(root.hasAttribute('data-chip-group')).toBe(true);
		expect(root.getAttribute('role')).toBe('group');
	});

	it('applies flex + flex-wrap so children flow onto new lines', () => {
		render(ChipGroupHarness);

		const root = getChipGroup('default');
		const styles = getComputedStyle(root);
		expect(styles.display).toBe('flex');
		expect(styles.flexWrap).toBe('wrap');
	});

	it('defaults gap to "md" and justify to "start"', () => {
		render(ChipGroupHarness);

		const root = getChipGroup('default');
		expect(root.getAttribute('data-gap')).toBe('md');
		expect(root.getAttribute('data-justify')).toBe('start');
	});

	it('reflects gap and justify props as data attributes', () => {
		render(ChipGroupHarness);

		const labelled = getChipGroup('with-label');
		expect(labelled.getAttribute('data-gap')).toBe('lg');
		expect(labelled.getAttribute('data-justify')).toBe('center');
	});

	it('renders ChipGroup.Label with data-chip-group-label', () => {
		render(ChipGroupHarness);

		const label = document.querySelector<HTMLElement>('[data-testid="works-with-label"]');
		expect(label).not.toBeNull();
		expect(label?.hasAttribute('data-chip-group-label')).toBe(true);
		expect(label?.textContent?.trim()).toBe('WORKS WITH');
	});

	it('resolves data-justify=between to space-between justify-content', () => {
		render(ChipGroupHarness);

		const root = getChipGroup('justify-between');
		expect(getComputedStyle(root).justifyContent).toBe('space-between');
	});

	it('maps data-gap=sm to a smaller computed gap than data-gap=md default', () => {
		render(ChipGroupHarness);

		const smallGap = parseFloat(getComputedStyle(getChipGroup('gap-sm')).rowGap);
		const mediumGap = parseFloat(getComputedStyle(getChipGroup('default')).rowGap);
		expect(smallGap).toBeGreaterThan(0);
		expect(mediumGap).toBeGreaterThan(smallGap);
	});
});
