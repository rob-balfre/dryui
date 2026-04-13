import { describe, expect, it } from 'vitest';
import { flushSync } from 'svelte';
import DocsComponentPageHarness from './fixtures/docs-component-page-harness.svelte';
import { getComponentPageData } from './fixtures/docs-component-page-data';
import { render } from './_harness';

function renderComponentPage(slug: string) {
	return render(DocsComponentPageHarness, {
		data: getComponentPageData(slug)
	}).target;
}

describe('docs component page', () => {
	it('renders a configurator hero for button', () => {
		const target = renderComponentPage('button');

		expect(target.querySelector('h1')?.textContent).toBe('Button');
		expect(target.textContent).toContain('Button Configurator');
		expect(target.textContent).toContain('Variants');
		expect(target.textContent).toContain('Description');
		expect(target.textContent).toContain('Accessibility');
		expect(target.textContent).toContain('Related Components');
		expect(target.textContent).toContain('Show code');
		expect(
			target.querySelector('a[href*="packages/ui/src/button"]')?.getAttribute('href')
		).toContain('packages/ui/src/button');
		expect(target.textContent).not.toContain(
			'No interactive examples are published for this component yet.'
		);
	});

	it('renders styled ui examples for date range picker', () => {
		const target = renderComponentPage('date-range-picker');

		expect(target.querySelector('h1')?.textContent).toBe('DateRangePicker');
		expect(target.textContent).toContain('@dryui/ui');
		expect(target.textContent).not.toContain('Primitive');
		expect(target.textContent).toContain('With Presets');
		expect(target.textContent).not.toContain('No examples available yet.');
	});

	it('uses rootless messaging for typography namespaces', () => {
		const target = renderComponentPage('typography');

		expect(target.querySelector('h1')?.textContent).toBe('Typography');
		expect(target.textContent).toContain('Namespace parts are used directly');
		expect(target.textContent).not.toContain('Compound component. Start with Typography.Root');
		expect(target.textContent).toContain('Typography.Heading');
	});

	it('renders a configurator hero and data attribute details for dialog', () => {
		const target = renderComponentPage('dialog');
		const hooksTab = Array.from(target.querySelectorAll<HTMLElement>('[role="tab"]')).find((node) =>
			node.textContent?.includes('Styling Hooks')
		);

		expect(target.textContent).toContain('Dialog Configurator');
		expect(hooksTab).toBeTruthy();
		hooksTab?.click();
		flushSync();

		expect(target.textContent).toContain('Data Attributes');
		expect(target.textContent).toContain('open');
		expect(target.textContent).toContain('closed');
	});

	it('renders new motion component examples from route data', () => {
		const target = renderComponentPage('reveal');

		expect(target.querySelector('h1')?.textContent).toBe('Reveal');
		expect(target.textContent).toContain('Slide Up');
		expect(target.textContent).not.toContain(
			'No interactive examples are published for this component yet.'
		);
	});

	it('falls back cleanly when a component has no configurator or dedicated examples', () => {
		const target = renderComponentPage('multi-city-search-form');

		expect(target.querySelector('h1')?.textContent).toBe('MultiCitySearchForm');
		expect(target.textContent).not.toContain('Configurator');
		expect(target.textContent).toContain(
			'No interactive examples are published for this component yet.'
		);
	});
});
