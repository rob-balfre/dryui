import { describe, expect, it } from 'vitest';
import { flushSync } from 'svelte';
import TabsHarness from './fixtures/tabs-harness.svelte';
import { render } from './_harness';

function getTrigger(value: string): HTMLButtonElement {
	const btn = document.querySelector(`button[data-testid="trigger-${value}"]`);
	if (!(btn instanceof HTMLButtonElement)) throw new Error(`Expected trigger ${value}`);
	return btn;
}

function getPanel(value: string): HTMLElement {
	const el = document.querySelector<HTMLElement>(`[data-testid="panel-${value}"]`);
	if (!el) throw new Error(`Expected panel ${value}`);
	return el;
}

describe('Tabs', () => {
	it('renders a tablist with role=tablist and the default horizontal orientation', () => {
		render(TabsHarness);

		const list = document.querySelector<HTMLElement>('[data-testid="tabs-list"]');
		expect(list?.getAttribute('role')).toBe('tablist');
		expect(list?.getAttribute('aria-orientation')).toBe('horizontal');
	});

	it('marks the initially-selected tab with aria-selected=true and shows its panel', () => {
		render(TabsHarness);

		const overview = getTrigger('overview');
		const analytics = getTrigger('analytics');

		expect(overview.getAttribute('role')).toBe('tab');
		expect(overview.getAttribute('aria-selected')).toBe('true');
		expect(analytics.getAttribute('aria-selected')).toBe('false');

		expect(getPanel('overview').hidden).toBe(false);
		expect(getPanel('analytics').hidden).toBe(true);
	});

	it('wires aria-controls/labelledby between triggers and panels', () => {
		render(TabsHarness);

		const overviewTab = getTrigger('overview');
		const overviewPanel = getPanel('overview');

		expect(overviewTab.getAttribute('aria-controls')).toBe(overviewPanel.id);
		expect(overviewPanel.getAttribute('role')).toBe('tabpanel');
		expect(overviewPanel.getAttribute('aria-labelledby')).toBe(overviewTab.id);
	});

	it('switches selection when another trigger is clicked', () => {
		render(TabsHarness);

		const analytics = getTrigger('analytics');
		analytics.click();
		flushSync();

		expect(analytics.getAttribute('aria-selected')).toBe('true');
		expect(getTrigger('overview').getAttribute('aria-selected')).toBe('false');
		expect(getPanel('analytics').hidden).toBe(false);
		expect(getPanel('overview').hidden).toBe(true);
		expect(document.querySelector('[data-testid="bound-value"]')?.textContent).toBe('analytics');
	});

	it('uses roving tabindex: selected tab is tabindex=0, others are -1', () => {
		render(TabsHarness);

		expect(getTrigger('overview').tabIndex).toBe(0);
		expect(getTrigger('analytics').tabIndex).toBe(-1);
	});

	it('disables triggers via the disabled prop', () => {
		render(TabsHarness);

		const settings = getTrigger('settings');
		expect(settings.disabled).toBe(true);

		settings.click();
		flushSync();

		// Disabled trigger should not change selection
		expect(document.querySelector('[data-testid="bound-value"]')?.textContent).toBe('overview');
	});

	it('supports vertical orientation via the orientation prop', () => {
		render(TabsHarness, { orientation: 'vertical' });

		const list = document.querySelector<HTMLElement>('[data-testid="tabs-list"]');
		expect(list?.getAttribute('aria-orientation')).toBe('vertical');
		expect(list?.getAttribute('data-orientation')).toBe('vertical');
	});
});
