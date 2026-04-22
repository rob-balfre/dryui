import { describe, expect, it } from 'vitest';
import HeadingTextHarness from './fixtures/heading-text-harness.svelte';
import { render } from './_harness';

function getElement(testId: string): HTMLElement {
	const wrapper = document.querySelector<HTMLElement>(`[data-testid="${testId}"]`);
	if (!wrapper) throw new Error(`Expected wrapper for ${testId}`);
	const el = wrapper.firstElementChild;
	if (!(el instanceof HTMLElement)) {
		throw new Error(`Expected rendered element for ${testId}`);
	}
	return el;
}

// getComputedStyle resolves ch units into px. Read the font-size off the
// element and convert the expected ch count back to px with a ±10% window
// to absorb browser-engine rounding and advance-width metric variance.
function expectChMaxInlineSize(el: HTMLElement, ch: number): void {
	const computed = getComputedStyle(el);
	const raw = computed.maxInlineSize;
	// The max-inline-size must resolve to a concrete pixel value with ch
	// semantics; if it reads "none" or empty the rule never applied.
	expect(raw).toMatch(/\d+(\.\d+)?px$/);
	const actualPx = parseFloat(raw);
	const fontSize = parseFloat(computed.fontSize);
	// 1ch is roughly the advance width of "0" at the current font size.
	// Chromium-on-system-default fonts sizes it in the 0.45-0.55em range.
	const lowerPx = ch * fontSize * 0.3;
	const upperPx = ch * fontSize * 0.9;
	expect(actualPx).toBeGreaterThan(lowerPx);
	expect(actualPx).toBeLessThan(upperPx);
}

describe('Heading maxMeasure', () => {
	it('narrow maps to data-measure="narrow" and ~22ch max-inline-size', () => {
		render(HeadingTextHarness);
		const heading = getElement('heading-narrow');

		expect(heading.tagName).toBe('H1');
		expect(heading.getAttribute('data-measure')).toBe('narrow');
		expectChMaxInlineSize(heading, 22);
	});

	it('default maps to data-measure="default" and ~45ch max-inline-size', () => {
		render(HeadingTextHarness);
		const heading = getElement('heading-default');

		expect(heading.getAttribute('data-measure')).toBe('default');
		expectChMaxInlineSize(heading, 45);
	});

	it('wide maps to data-measure="wide" and ~65ch max-inline-size', () => {
		render(HeadingTextHarness);
		const heading = getElement('heading-wide');

		expect(heading.getAttribute('data-measure')).toBe('wide');
		expectChMaxInlineSize(heading, 65);
	});

	it('omitted maxMeasure leaves no data-measure attribute', () => {
		render(HeadingTextHarness);
		const heading = getElement('heading-uncapped');

		expect(heading.hasAttribute('data-measure')).toBe(false);
		// Regression guard: no cap means computed max-inline-size resolves to
		// "none" so layout is identical to pre-maxMeasure.
		expect(getComputedStyle(heading).maxInlineSize).toBe('none');
	});

	it('explicit false also leaves no data-measure attribute', () => {
		render(HeadingTextHarness);
		const heading = getElement('heading-explicit-false');

		// Existing consumers (no maxMeasure) render identically to this
		// explicit opt-out.
		expect(heading.hasAttribute('data-measure')).toBe(false);
		expect(getComputedStyle(heading).maxInlineSize).toBe('none');
	});
});

describe('Text maxMeasure', () => {
	it('narrow maps to data-measure="narrow" and ~48ch max-inline-size', () => {
		render(HeadingTextHarness);
		const text = getElement('text-narrow');

		expect(text.tagName).toBe('P');
		expect(text.getAttribute('data-measure')).toBe('narrow');
		// Text.narrow is wider than Heading.narrow (48ch vs 22ch) because
		// body copy reads better on a longer measure.
		expectChMaxInlineSize(text, 48);
	});

	it('default maps to data-measure="default" and ~65ch max-inline-size', () => {
		render(HeadingTextHarness);
		const text = getElement('text-default');

		expect(text.getAttribute('data-measure')).toBe('default');
		expectChMaxInlineSize(text, 65);
	});

	it('wide maps to data-measure="wide" and ~80ch max-inline-size', () => {
		render(HeadingTextHarness);
		const text = getElement('text-wide');

		expect(text.getAttribute('data-measure')).toBe('wide');
		expectChMaxInlineSize(text, 80);
	});

	it('omitted maxMeasure leaves no data-measure attribute', () => {
		render(HeadingTextHarness);
		const text = getElement('text-uncapped');

		expect(text.hasAttribute('data-measure')).toBe(false);
		expect(getComputedStyle(text).maxInlineSize).toBe('none');
	});
});
