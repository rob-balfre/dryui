import { describe, expect, it } from 'vitest';
import { flushSync } from 'svelte';
import SelectHarness from './fixtures/select-harness.svelte';
import { render } from './_harness';

function getTrigger(): HTMLButtonElement {
	// SelectTrigger forwards `...rest` to the underlying Button, which renders
	// a <button> directly — so the testid lands on the button element itself.
	const btn = document.querySelector('button[data-testid="select-trigger"]');
	if (!(btn instanceof HTMLButtonElement)) throw new Error('Expected trigger button');
	return btn;
}

function getContent(): HTMLDivElement {
	const el = document.querySelector<HTMLDivElement>('[data-testid="select-content"]');
	if (!el) throw new Error('Expected content element');
	return el;
}

function getItem(value: string): HTMLElement {
	const el = document.querySelector<HTMLElement>(`[data-testid="item-${value}"]`);
	if (!el) throw new Error(`Expected item ${value}`);
	return el;
}

describe('Select', () => {
	it('renders a trigger with aria-haspopup=listbox and content with role=listbox', () => {
		render(SelectHarness);

		const trigger = getTrigger();
		const content = getContent();

		expect(trigger.getAttribute('aria-haspopup')).toBe('listbox');
		expect(trigger.getAttribute('aria-expanded')).toBe('false');
		expect(content.getAttribute('role')).toBe('listbox');
		expect(content.getAttribute('aria-labelledby')).toBe(trigger.id);
	});

	it('renders each Item with role=option and sets data-value', () => {
		render(SelectHarness);

		const apple = getItem('apple');
		const banana = getItem('banana');

		expect(apple.getAttribute('role')).toBe('option');
		expect(apple.getAttribute('data-value')).toBe('apple');
		expect(banana.getAttribute('role')).toBe('option');
		expect(banana.getAttribute('data-value')).toBe('banana');
	});

	it('marks disabled items with aria-disabled and data-disabled', () => {
		render(SelectHarness);

		const cherry = getItem('cherry');

		expect(cherry.getAttribute('aria-disabled')).toBe('true');
		expect(cherry.getAttribute('data-disabled')).toBe('true');
	});

	it('opens the popover when the trigger is clicked, updating aria-expanded', async () => {
		render(SelectHarness);

		const trigger = getTrigger();
		const content = getContent();
		const bound = document.querySelector<HTMLElement>('[data-testid="bound-open"]');

		// Click invokes the browser popover API via popovertarget, which fires
		// the toggle event asynchronously. Poll until the popover opens, up to
		// ~200ms, then flush Svelte state.
		trigger.click();

		// Wait for the popover to open AND for the ontoggle handler to
		// propagate via the Svelte reactive cycle.
		for (let i = 0; i < 30; i++) {
			flushSync();
			if (bound?.textContent === 'true' && content.matches(':popover-open')) break;
			await new Promise((resolve) => setTimeout(resolve, 10));
		}

		expect(content.matches(':popover-open')).toBe(true);
		expect(bound?.textContent).toBe('true');
		expect(trigger.getAttribute('aria-expanded')).toBe('true');
	});

	it('applies anchored positioning styles to the content when opened', async () => {
		render(SelectHarness);

		const trigger = getTrigger();
		const content = getContent();

		trigger.click();

		for (let i = 0; i < 30; i++) {
			flushSync();
			if (content.matches(':popover-open')) break;
			await new Promise((resolve) => setTimeout(resolve, 10));
		}

		const inlineStyle = content.getAttribute('style') ?? '';
		expect(inlineStyle).toContain('position-anchor');
		expect(trigger.style.getPropertyValue('anchor-name')).toContain('--dryui-anchor-');
		expect(content.style.position).toBe('fixed');
		expect(content.style.getPropertyValue('position-area')).toBe('block-end span-inline-end');
		expect(content.style.getPropertyValue('position-try-fallbacks')).toContain('flip-block');
		expect(content.style.justifySelf).toBe('start');
	});

	it('selects an item on click and updates bound value + aria-selected', async () => {
		render(SelectHarness);

		const trigger = getTrigger();
		const content = getContent();

		trigger.click();
		for (let i = 0; i < 20; i++) {
			if (content.matches(':popover-open')) break;
			await new Promise((resolve) => setTimeout(resolve, 10));
		}
		flushSync();

		const banana = getItem('banana');
		banana.click();
		await new Promise((resolve) => setTimeout(resolve, 10));
		flushSync();

		const boundValue = document.querySelector<HTMLElement>('[data-testid="bound-value"]');
		expect(boundValue?.textContent).toBe('banana');
		expect(banana.getAttribute('aria-selected')).toBe('true');
		// Apple should NOT be selected
		expect(getItem('apple').getAttribute('aria-selected')).toBe('false');
	});

	it('emits a hidden form input when name is provided', () => {
		render(SelectHarness, { initialValue: 'apple' });

		const hidden = document.querySelector<HTMLInputElement>('input[type="hidden"][name="fruit"]');
		expect(hidden).toBeInstanceOf(HTMLInputElement);
		expect(hidden?.value).toBe('apple');
	});
});
