import { createRawSnippet } from 'svelte';
import { describe, expect, it } from 'vitest';
import DocsCallout from '../../apps/docs/src/lib/components/DocsCallout.svelte';
import ChartDemo from '../../apps/docs/src/lib/demos/ChartDemo.svelte';
import ScrollAreaDemo from '../../apps/docs/src/lib/demos/ScrollAreaDemo.svelte';
import { Alert } from '../../packages/ui/src/alert/index.js';
import { ScrollArea } from '../../packages/ui/src/scroll-area/index.js';
import { render } from './_harness';

function htmlSnippet(html: string) {
	return createRawSnippet(() => ({
		render: () => html
	}));
}

describe('chart, scroll area, and alert accessibility', () => {
	it('adds a text summary and value list alongside the chart SVG', () => {
		render(ChartDemo);

		const svg = document.querySelector<SVGSVGElement>('[data-chart]');
		const summary = document.querySelector<HTMLElement>('[data-chart-summary]');
		const values = Array.from(document.querySelectorAll<HTMLElement>('[data-chart-data-list] li'));

		expect(svg?.getAttribute('aria-hidden')).toBe('true');
		expect(summary?.textContent).toContain('Chart');
		expect(summary?.textContent).toContain('5 data points');
		expect(summary?.textContent).toContain('Highest is Apr at 80');
		expect(summary?.textContent).toContain('Lowest is Jan at 40');
		expect(values.map((item) => item.textContent?.trim())).toEqual([
			'Jan: 40',
			'Feb: 65',
			'Mar: 55',
			'Apr: 80',
			'May: 72'
		]);
		expect(document.querySelector('[data-chart-data-list] button')).toBeNull();
	});

	it('keeps unnamed scroll areas out of the landmark list', () => {
		render(ScrollAreaDemo);

		const scrollArea = document.querySelector<HTMLElement>('[data-scroll-area]');

		expect(scrollArea?.getAttribute('role')).toBeNull();
		expect(scrollArea?.getAttribute('aria-label')).toBeNull();
		expect(scrollArea?.getAttribute('tabindex')).toBe('0');
	});

	it('promotes explicitly named scroll areas to regions', () => {
		render(ScrollArea, {
			'aria-label': 'Activity feed',
			children: htmlSnippet('<div style="height: 16rem;">Deploy finished</div>')
		});

		const scrollArea = document.querySelector<HTMLElement>('[data-scroll-area]');

		expect(scrollArea?.getAttribute('role')).toBe('region');
		expect(scrollArea?.getAttribute('aria-label')).toBe('Activity feed');
	});

	it('renders alert titles as styled text instead of a forced heading', () => {
		render(Alert, {
			title: htmlSnippet('System status'),
			description: htmlSnippet('Everything is operating normally.')
		});

		const title = document.querySelector<HTMLElement>('[data-alert-title]');

		expect(title?.tagName).toBe('DIV');
		expect(title?.textContent).toContain('System status');
		expect(title?.querySelector('h1, h2, h3, h4, h5, h6')).toBeNull();
	});

	it('keeps docs callout titles out of the document heading order', () => {
		render(DocsCallout, {
			title: 'Accessibility',
			description: 'Keyboard support is built in.'
		});

		const title = document.querySelector<HTMLElement>('[data-alert-title]');

		expect(title?.tagName).toBe('DIV');
		expect(title?.textContent).toContain('Accessibility');
		expect(title?.querySelector('h1, h2, h3, h4, h5, h6')).toBeNull();
	});
});
