import { describe, expect, it } from 'vitest';
import { flushSync } from 'svelte';
import MegaMenuHarness from './fixtures/mega-menu-harness.svelte';
import { render } from './_harness';

async function waitForOpenDelay() {
	await new Promise((resolve) => setTimeout(resolve, 175));
	flushSync();
}

function getTrigger(target: HTMLElement) {
	const trigger = target.querySelector<HTMLButtonElement>('[data-mega-menu-trigger]');
	if (!(trigger instanceof HTMLButtonElement)) {
		throw new Error('Expected mega-menu trigger');
	}
	return trigger;
}

function getPanel() {
	return document.querySelector<HTMLDivElement>('[data-mega-menu-panel]');
}

describe('mega menu accessibility', () => {
	it('opens the mega menu panel in the popover top layer', async () => {
		const { target } = render(MegaMenuHarness);

		const trigger = getTrigger(target);

		trigger.click();
		await waitForOpenDelay();

		const panel = getPanel();
		expect(panel).toBeTruthy();
		expect(panel?.getAttribute('popover')).toBe('manual');
		expect(panel?.matches(':popover-open')).toBe(true);
		expect(getComputedStyle(panel as HTMLDivElement).position).toBe('fixed');
	});

	it('uses disclosure semantics and returns focus to the trigger on escape', async () => {
		const { target } = render(MegaMenuHarness);

		const trigger = getTrigger(target);
		expect(trigger.hasAttribute('aria-haspopup')).toBe(false);
		expect(trigger.hasAttribute('aria-controls')).toBe(false);
		expect(trigger.getAttribute('aria-expanded')).toBe('false');

		trigger.click();
		await waitForOpenDelay();

		const panel = getPanel();
		if (!(panel instanceof HTMLDivElement)) {
			throw new Error('Expected mega-menu panel');
		}

		expect(trigger.hasAttribute('aria-haspopup')).toBe(false);
		expect(trigger.getAttribute('aria-controls')).toBe(panel.id);
		expect(trigger.getAttribute('aria-expanded')).toBe('true');
		expect(panel.getAttribute('role')).toBe('group');
		expect(panel.getAttribute('aria-labelledby')).toBe(trigger.id);

		const analyticsLink = document.querySelector<HTMLElement>('[data-testid="analytics-link"]');
		if (!(analyticsLink instanceof HTMLElement)) {
			throw new Error('Expected analytics link');
		}

		analyticsLink.focus();
		analyticsLink.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Escape' }));
		flushSync();

		expect(getPanel()).toBeNull();
		expect(trigger.getAttribute('aria-expanded')).toBe('false');
		expect(document.activeElement).toBe(trigger);
	});

	it('renders navigational mega-menu items as links and action items as buttons', async () => {
		const { target } = render(MegaMenuHarness);

		const trigger = getTrigger(target);

		trigger.click();
		await waitForOpenDelay();

		const analyticsLink = document.querySelector<HTMLElement>('[data-testid="analytics-link"]');
		const applyPreset = document.querySelector<HTMLElement>('[data-testid="apply-preset"]');

		expect(analyticsLink?.tagName).toBe('A');
		expect(analyticsLink?.getAttribute('href')).toBe('#analytics');
		expect(applyPreset?.tagName).toBe('BUTTON');
		expect(applyPreset?.getAttribute('type')).toBe('button');
	});
});
