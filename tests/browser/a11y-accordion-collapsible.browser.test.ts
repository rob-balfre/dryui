import { describe, expect, it } from 'vitest';
import { flushSync } from 'svelte';
import AccordionCollapsibleHarness from './fixtures/a11y-accordion-collapsible-harness.svelte';
import { render } from './_harness';

function getElement(testId: string) {
	const element = document.querySelector<HTMLElement>(`[data-testid="${testId}"]`);

	if (!element) {
		throw new Error(`Expected element for ${testId}`);
	}

	return element;
}

function getButton(testId: string) {
	const button = document.querySelector<HTMLButtonElement>(`[data-testid="${testId}"]`);

	if (!button) {
		throw new Error(`Expected button for ${testId}`);
	}

	return button;
}

describe('accordion and collapsible accessibility', () => {
	it('does not expose accordion panels as unnamed regions', () => {
		render(AccordionCollapsibleHarness);

		const uiTrigger = getButton('ui-accordion-trigger');
		const uiContent = getElement('ui-accordion-content');
		const primitiveTrigger = getButton('primitive-accordion-trigger');
		const primitiveContent = getElement('primitive-accordion-content');

		expect(uiContent.getAttribute('role')).toBeNull();
		expect(uiContent.hidden).toBe(true);
		expect(uiContent.getAttribute('aria-hidden')).toBe('true');
		expect(uiTrigger.getAttribute('aria-controls')).toBe(uiContent.id);
		expect(uiTrigger.getAttribute('aria-expanded')).toBe('false');

		expect(primitiveContent.getAttribute('role')).toBeNull();
		expect(primitiveContent.getAttribute('aria-hidden')).toBe('true');
		expect(primitiveContent.hasAttribute('inert')).toBe(true);
		expect(primitiveTrigger.getAttribute('aria-controls')).toBe(primitiveContent.id);
		expect(primitiveTrigger.getAttribute('aria-expanded')).toBe('false');

		uiTrigger.click();
		primitiveTrigger.click();
		flushSync();

		expect(uiContent.hidden).toBe(false);
		expect(uiContent.getAttribute('aria-hidden')).toBe('false');
		expect(uiTrigger.getAttribute('aria-expanded')).toBe('true');

		expect(primitiveContent.getAttribute('aria-hidden')).toBe('false');
		expect(primitiveContent.hasAttribute('inert')).toBe(false);
		expect(primitiveTrigger.getAttribute('aria-expanded')).toBe('true');
	});

	it('keeps collapsible panels out of landmark navigation and hides closed animated content', () => {
		render(AccordionCollapsibleHarness);

		const uiTrigger = getButton('ui-collapsible-trigger');
		const uiContent = getElement('ui-collapsible-content');
		const primitiveTrigger = getButton('primitive-collapsible-trigger');
		const primitiveContent = getElement('primitive-collapsible-content');

		expect(uiContent.getAttribute('role')).toBeNull();
		expect(uiContent.getAttribute('aria-hidden')).toBe('true');
		expect(uiContent.hasAttribute('inert')).toBe(true);
		expect(uiTrigger.getAttribute('aria-controls')).toBe(uiContent.id);
		expect(uiTrigger.getAttribute('aria-expanded')).toBe('false');

		expect(primitiveContent.getAttribute('role')).toBeNull();
		expect(primitiveContent.getAttribute('aria-hidden')).toBe('true');
		expect(primitiveContent.hasAttribute('inert')).toBe(true);
		expect(primitiveTrigger.getAttribute('aria-controls')).toBe(primitiveContent.id);
		expect(primitiveTrigger.getAttribute('aria-expanded')).toBe('false');

		uiTrigger.click();
		primitiveTrigger.click();
		flushSync();

		expect(uiContent.getAttribute('aria-hidden')).toBe('false');
		expect(uiContent.hasAttribute('inert')).toBe(false);
		expect(uiTrigger.getAttribute('aria-expanded')).toBe('true');

		expect(primitiveContent.getAttribute('aria-hidden')).toBe('false');
		expect(primitiveContent.hasAttribute('inert')).toBe(false);
		expect(primitiveTrigger.getAttribute('aria-expanded')).toBe('true');
	});
});
