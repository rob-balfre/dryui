import { flushSync } from 'svelte';
import { describe, expect, it } from 'vitest';
import MenubarHarness from './fixtures/menubar-a11y-harness.svelte';
import NotificationCenterA11yHarness from './fixtures/notification-center-a11y-harness.svelte';
import { render } from './_harness';

async function nextFrame() {
	await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
	flushSync();
}

function getMenubarTriggers() {
	return Array.from(document.querySelectorAll<HTMLButtonElement>('[data-menubar-trigger]'));
}

function getOpenMenubarContent() {
	return document.querySelector<HTMLElement>('[data-menubar-content][data-state="open"]');
}

function getNotificationTrigger() {
	const trigger = document.querySelector<HTMLButtonElement>('[data-notification-center-trigger]');
	if (!(trigger instanceof HTMLButtonElement)) {
		throw new Error('Expected notification center trigger');
	}
	return trigger;
}

function getNotificationPanel() {
	const panel = document.querySelector<HTMLElement>('[data-notification-center-panel]');
	if (!(panel instanceof HTMLElement)) {
		throw new Error('Expected notification center panel');
	}
	return panel;
}

describe('menubar and notification center accessibility', () => {
	it('labels the open menu from the rendered trigger id', async () => {
		render(MenubarHarness);

		const [fileTrigger] = getMenubarTriggers();
		if (!(fileTrigger instanceof HTMLButtonElement)) {
			throw new Error('Expected menubar trigger');
		}

		fileTrigger.focus();
		fileTrigger.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowDown' }));
		flushSync();
		await nextFrame();

		const menu = getOpenMenubarContent();
		if (!(menu instanceof HTMLElement)) {
			throw new Error('Expected open menubar content');
		}

		expect(fileTrigger.id).toBeTruthy();
		expect(menu.getAttribute('aria-labelledby')).toBe(fileTrigger.id);
		expect(document.activeElement?.getAttribute('role')).toBe('menuitem');
	});

	it('moves focus across top-level triggers without opening, and switches menus when already open', async () => {
		render(MenubarHarness);

		const [fileTrigger, editTrigger, viewTrigger] = getMenubarTriggers();
		if (!fileTrigger || !editTrigger || !viewTrigger) {
			throw new Error('Expected three menubar triggers');
		}

		fileTrigger.focus();
		fileTrigger.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowRight' }));
		flushSync();
		await nextFrame();

		expect(document.activeElement).toBe(editTrigger);
		expect(getOpenMenubarContent()).toBeNull();

		editTrigger.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowDown' }));
		flushSync();
		await nextFrame();

		const openMenu = getOpenMenubarContent();
		if (!(openMenu instanceof HTMLElement)) {
			throw new Error('Expected open menubar content');
		}

		openMenu.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowRight' }));
		flushSync();
		await nextFrame();

		const nextOpenMenu = getOpenMenubarContent();
		if (!(nextOpenMenu instanceof HTMLElement)) {
			throw new Error('Expected next open menubar content');
		}

		expect(document.activeElement?.getAttribute('role')).toBe('menuitem');
		expect((document.activeElement as HTMLElement | null)?.textContent?.trim()).toBe('Zoom In');
		expect(nextOpenMenu.getAttribute('aria-labelledby')).toBe(viewTrigger.id);
	});

	it('keeps notification center trigger and panel semantics truthful and restores focus on escape', async () => {
		render(NotificationCenterA11yHarness);

		const trigger = getNotificationTrigger();
		const panel = getNotificationPanel();

		expect(trigger.hasAttribute('aria-haspopup')).toBe(false);
		expect(trigger.getAttribute('aria-controls')).toBe(panel.id);
		expect(trigger.getAttribute('aria-expanded')).toBe('true');
		expect(panel.getAttribute('role')).toBe('region');
		expect(panel.getAttribute('aria-label')).toBe('Notifications');

		panel.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Escape' }));
		flushSync();
		await nextFrame();

		expect(trigger.getAttribute('aria-expanded')).toBe('false');
		expect(document.activeElement).toBe(trigger);
	});
});
