import { describe, expect, it } from 'vitest';
import { flushSync } from 'svelte';
import AccordionHarness from './fixtures/accordion-harness.svelte';
import { render } from './_harness';

function renderAccordionHarness() {
	render(AccordionHarness);
}

function getAccordionParts(value: string) {
	const contentId = `accordion-content-${value}`;
	const trigger = document.querySelector(`button[aria-controls="${contentId}"]`);
	const content = document.getElementById(contentId);

	if (!(trigger instanceof HTMLButtonElement)) {
		throw new Error(`Expected trigger for ${value}`);
	}

	if (!(content instanceof HTMLElement)) {
		throw new Error(`Expected content for ${value}`);
	}

	return { trigger, content };
}

describe('Accordion', () => {
	it('keeps closed content out of layout until its trigger opens it', () => {
		renderAccordionHarness();

		const features = getAccordionParts('features');
		const theming = getAccordionParts('theming');

		expect(features.trigger.getAttribute('aria-expanded')).toBe('false');
		expect(features.content.hidden).toBe(true);
		expect(features.content.getBoundingClientRect().height).toBe(0);
		expect(theming.content.hidden).toBe(true);

		features.trigger.click();
		flushSync();

		expect(features.trigger.getAttribute('aria-expanded')).toBe('true');
		expect(features.content.hidden).toBe(false);
		expect(features.content.getBoundingClientRect().height).toBeGreaterThan(0);
		expect(theming.content.hidden).toBe(true);

		theming.trigger.click();
		flushSync();

		expect(features.trigger.getAttribute('aria-expanded')).toBe('false');
		expect(features.content.hidden).toBe(true);
		expect(theming.trigger.getAttribute('aria-expanded')).toBe('true');
		expect(theming.content.hidden).toBe(false);
	});
});
