import { flushSync } from 'svelte';
import { describe, expect, it } from 'vitest';
import HoverCardA11yHarness from './fixtures/hover-card-a11y-harness.svelte';
import { render } from './_harness';

async function nextFrame() {
	await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
	flushSync();
}

function getTrigger() {
	const trigger = document.querySelector<HTMLElement>('[data-hover-card-trigger]');

	if (!(trigger instanceof HTMLElement)) {
		throw new Error('Expected hover card trigger');
	}

	return trigger;
}

function getContent() {
	const content = document.querySelector<HTMLElement>('[data-hover-card-content]');

	if (!(content instanceof HTMLElement)) {
		throw new Error('Expected hover card content');
	}

	return content;
}

function getAction() {
	const action = document.querySelector<HTMLButtonElement>('[data-hover-card-action]');

	if (!(action instanceof HTMLButtonElement)) {
		throw new Error('Expected hover card action');
	}

	return action;
}

describe('hover card accessibility', () => {
	it('uses a keyboard-focusable trigger with dialog popup semantics', async () => {
		render(HoverCardA11yHarness);

		const trigger = getTrigger();
		trigger.focus();
		flushSync();
		await nextFrame();

		const content = getContent();

		expect(trigger.tagName).toBe('BUTTON');
		expect(document.activeElement).toBe(trigger);
		expect(trigger.getAttribute('aria-haspopup')).toBe('dialog');
		expect(trigger.getAttribute('aria-controls')).toBe(content.id);
		expect(trigger.getAttribute('aria-expanded')).toBe('true');
		expect(content.getAttribute('role')).toBe('dialog');
		expect(content.getAttribute('aria-labelledby')).toBe(trigger.id);
	});

	it('keeps the popup open while focus moves into the card and restores focus on escape', async () => {
		render(HoverCardA11yHarness);

		const trigger = getTrigger();
		trigger.focus();
		flushSync();
		await nextFrame();

		const action = getAction();
		action.focus();
		flushSync();
		await nextFrame();

		const content = getContent();

		expect(document.activeElement).toBe(action);
		expect(trigger.getAttribute('aria-expanded')).toBe('true');
		expect(content.getAttribute('data-state')).toBe('open');

		action.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Escape' }));
		flushSync();
		await nextFrame();

		expect(trigger.getAttribute('aria-expanded')).toBe('false');
		expect(content.getAttribute('data-state')).toBe('closed');
		expect(document.activeElement).toBe(trigger);
	});
});
