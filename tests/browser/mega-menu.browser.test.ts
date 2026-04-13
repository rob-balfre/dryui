import { expect, it } from 'vitest';
import { flushSync } from 'svelte';
import MegaMenuHarness from './fixtures/mega-menu-harness.svelte';
import { render } from './_harness';

it('opens the mega menu panel in the popover top layer', async () => {
	const { target } = render(MegaMenuHarness);

	const trigger = target.querySelector<HTMLButtonElement>('[data-mega-menu-trigger]');
	expect(trigger).toBeTruthy();

	trigger?.click();
	await new Promise((resolve) => setTimeout(resolve, 175));
	flushSync();

	const panel = document.querySelector<HTMLDivElement>('[data-mega-menu-panel]');
	expect(panel).toBeTruthy();
	expect(panel?.getAttribute('popover')).toBe('manual');
	expect(panel?.matches(':popover-open')).toBe(true);
	expect(getComputedStyle(panel as HTMLDivElement).position).toBe('fixed');
});

it('renders navigational mega-menu items as links and action items as buttons', async () => {
	const { target } = render(MegaMenuHarness);

	const trigger = target.querySelector<HTMLButtonElement>('[data-mega-menu-trigger]');
	expect(trigger).toBeTruthy();

	trigger?.click();
	await new Promise((resolve) => setTimeout(resolve, 175));
	flushSync();

	const analyticsLink = document.querySelector<HTMLElement>('[data-testid="analytics-link"]');
	const applyPreset = document.querySelector<HTMLElement>('[data-testid="apply-preset"]');

	expect(analyticsLink?.tagName).toBe('A');
	expect(analyticsLink?.getAttribute('href')).toBe('#analytics');
	expect(applyPreset?.tagName).toBe('BUTTON');
	expect(applyPreset?.getAttribute('type')).toBe('button');
});
