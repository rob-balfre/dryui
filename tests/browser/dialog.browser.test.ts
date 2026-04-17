import { describe, expect, it } from 'vitest';
import { flushSync } from 'svelte';
import DialogHarness from './fixtures/dialog-harness.svelte';
import { render } from './_harness';

function getTrigger(): HTMLButtonElement {
	const btn = document.querySelector('[data-testid="dialog-trigger"] button');
	if (!(btn instanceof HTMLButtonElement)) throw new Error('Expected trigger button');
	return btn;
}

function getDialog(): HTMLDialogElement {
	const el = document.querySelector<HTMLDialogElement>('[data-dialog-content]');
	if (!(el instanceof HTMLDialogElement)) throw new Error('Expected <dialog> element');
	return el;
}

function getBoundOpen() {
	return document.querySelector<HTMLElement>('[data-testid="bound-open"]');
}

describe('Dialog', () => {
	it('renders a native <dialog> element with aria-labelledby wired to the header', () => {
		render(DialogHarness);

		const dialog = getDialog();
		const header = document.querySelector<HTMLElement>('[data-testid="dialog-header"]');

		expect(dialog).toBeInstanceOf(HTMLDialogElement);
		expect(header).toBeInstanceOf(HTMLElement);
		expect(dialog.getAttribute('aria-labelledby')).toBe(header?.id);
		expect(header?.id).toBeTruthy();
	});

	it('marks the trigger with aria-haspopup="dialog" and keeps aria-expanded=false when closed', () => {
		render(DialogHarness);

		const trigger = getTrigger();

		expect(trigger.getAttribute('aria-haspopup')).toBe('dialog');
		expect(trigger.getAttribute('aria-expanded')).toBe('false');
	});

	it('starts closed (data-state=closed, dialog.open=false)', () => {
		render(DialogHarness);

		const dialog = getDialog();

		expect(dialog.getAttribute('data-state')).toBe('closed');
		expect(dialog.open).toBe(false);
	});

	it('opens the dialog via showModal() when the trigger is clicked', () => {
		render(DialogHarness);

		const trigger = getTrigger();
		const dialog = getDialog();

		trigger.click();
		flushSync();

		expect(dialog.open).toBe(true);
		expect(dialog.getAttribute('data-state')).toBe('open');
		expect(getBoundOpen()?.textContent).toBe('true');
		expect(trigger.getAttribute('aria-expanded')).toBe('true');
	});

	it('closes the dialog when Close is clicked and syncs bound open state', () => {
		render(DialogHarness, { initialOpen: true });

		const dialog = getDialog();
		expect(dialog.open).toBe(true);

		// Dialog.Close forwards rest props to a Button, which renders a <button>
		// directly — so the testid lands on the button itself.
		const close = document.querySelector<HTMLButtonElement>('button[data-testid="dialog-close"]');
		if (!close) throw new Error('Expected close button');

		close.click();
		flushSync();

		expect(dialog.open).toBe(false);
		expect(dialog.getAttribute('data-state')).toBe('closed');
		expect(getBoundOpen()?.textContent).toBe('false');
	});

	it('closes when the native close event fires (Esc key / native cancel)', async () => {
		render(DialogHarness, { initialOpen: true });

		const dialog = getDialog();
		expect(dialog.open).toBe(true);

		// close() fires a `close` event asynchronously; wait for it to settle.
		dialog.close();
		await new Promise((resolve) => setTimeout(resolve, 0));
		flushSync();

		expect(dialog.open).toBe(false);
		expect(getBoundOpen()?.textContent).toBe('false');
	});
});
