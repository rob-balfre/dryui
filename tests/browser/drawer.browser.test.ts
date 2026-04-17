import { describe, expect, it } from 'vitest';
import { flushSync } from 'svelte';
import DrawerHarness from './fixtures/drawer-harness.svelte';
import { render } from './_harness';

function getDrawer(): HTMLDialogElement {
	const el = document.querySelector<HTMLDialogElement>('[data-drawer-content]');
	if (!(el instanceof HTMLDialogElement)) throw new Error('Expected <dialog> drawer');
	return el;
}

function getTrigger(): HTMLButtonElement {
	const btn = document.querySelector('[data-testid="drawer-trigger"] button');
	if (!(btn instanceof HTMLButtonElement)) throw new Error('Expected trigger button');
	return btn;
}

function getBoundOpen() {
	return document.querySelector<HTMLElement>('[data-testid="bound-open"]');
}

describe('Drawer', () => {
	it('renders a native <dialog> tagged with data-drawer-content and default side=right', () => {
		render(DrawerHarness);

		const drawer = getDrawer();
		const header = document.querySelector<HTMLElement>('[data-testid="drawer-header"]');

		expect(drawer).toBeInstanceOf(HTMLDialogElement);
		expect(drawer.getAttribute('data-side')).toBe('right');
		expect(drawer.getAttribute('aria-labelledby')).toBe(header?.id);
	});

	it('reflects the side prop on the content element', () => {
		render(DrawerHarness, { side: 'left' });
		expect(getDrawer().getAttribute('data-side')).toBe('left');
	});

	it('wires trigger with aria-haspopup=dialog', () => {
		render(DrawerHarness);
		const trigger = getTrigger();

		expect(trigger.getAttribute('aria-haspopup')).toBe('dialog');
		expect(trigger.getAttribute('aria-expanded')).toBe('false');
	});

	it('opens the drawer via showModal() on trigger click and sets data-state=open', () => {
		render(DrawerHarness);

		const trigger = getTrigger();
		const drawer = getDrawer();

		trigger.click();
		flushSync();

		expect(drawer.open).toBe(true);
		expect(drawer.getAttribute('data-state')).toBe('open');
		expect(getBoundOpen()?.textContent).toBe('true');
	});

	it('closes when the Close button is clicked', () => {
		render(DrawerHarness, { initialOpen: true });

		const drawer = getDrawer();
		expect(drawer.open).toBe(true);

		// Drawer.Close forwards rest props to a Button, which renders a <button>
		// directly — so the testid lands on the button itself.
		const close = document.querySelector<HTMLButtonElement>('button[data-testid="drawer-close"]');
		if (!close) throw new Error('Expected close button');

		close.click();
		flushSync();

		expect(drawer.open).toBe(false);
		expect(drawer.getAttribute('data-state')).toBe('closed');
		expect(getBoundOpen()?.textContent).toBe('false');
	});

	it('closes on native dialog close event (e.g. Esc key)', async () => {
		render(DrawerHarness, { initialOpen: true });

		const drawer = getDrawer();
		drawer.close();
		// close event queues on the microtask queue. Wait for it to settle.
		await new Promise((resolve) => setTimeout(resolve, 0));
		flushSync();

		expect(drawer.open).toBe(false);
		expect(getBoundOpen()?.textContent).toBe('false');
	});
});
