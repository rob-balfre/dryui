import { describe, expect, it, vi } from 'vitest';
import { flushSync } from 'svelte';
import ButtonHarness from './fixtures/button-harness.svelte';
import { render } from './_harness';

function getButton(testId: string): HTMLButtonElement {
	const wrapper = document.querySelector<HTMLElement>(`[data-testid="${testId}"]`);
	if (!wrapper) throw new Error(`Expected wrapper for ${testId}`);
	const btn = wrapper.querySelector('button');
	if (!(btn instanceof HTMLButtonElement)) {
		throw new Error(`Expected button for ${testId}`);
	}
	return btn;
}

function getAnchor(testId: string): HTMLAnchorElement {
	const wrapper = document.querySelector<HTMLElement>(`[data-testid="${testId}"]`);
	if (!wrapper) throw new Error(`Expected wrapper for ${testId}`);
	const anchor = wrapper.querySelector('a');
	if (!(anchor instanceof HTMLAnchorElement)) {
		throw new Error(`Expected anchor for ${testId}`);
	}
	return anchor;
}

describe('Button', () => {
	it('renders a <button type="button"> with default variant/size/color data-attrs', () => {
		render(ButtonHarness);
		const btn = getButton('default');

		expect(btn.type).toBe('button');
		expect(btn.getAttribute('data-variant')).toBe('solid');
		expect(btn.getAttribute('data-size')).toBe('md');
		expect(btn.getAttribute('data-color')).toBe('primary');
		expect(btn.textContent?.trim()).toBe('Click me');
	});

	it('propagates variant/size/color props as data attributes', () => {
		render(ButtonHarness);
		const btn = getButton('ghost-lg-danger');

		expect(btn.getAttribute('data-variant')).toBe('ghost');
		expect(btn.getAttribute('data-size')).toBe('lg');
		expect(btn.getAttribute('data-color')).toBe('danger');
	});

	it('sets disabled attribute + data-disabled and blocks click events', () => {
		const onDisabledClick = vi.fn();
		render(ButtonHarness, { onDisabledClick });
		const btn = getButton('disabled');

		expect(btn.disabled).toBe(true);
		expect(btn.getAttribute('data-disabled')).toBe('true');

		btn.click();
		flushSync();
		// Native <button disabled> suppresses click events.
		expect(onDisabledClick).not.toHaveBeenCalled();
	});

	it('invokes onclick when enabled', () => {
		const onDefaultClick = vi.fn();
		render(ButtonHarness, { onDefaultClick });
		const btn = getButton('default');

		btn.click();
		flushSync();

		expect(onDefaultClick).toHaveBeenCalledTimes(1);
	});

	it('renders as <a> when href is provided and blocks navigation when disabled', () => {
		render(ButtonHarness);

		const link = getAnchor('link');
		expect(link.getAttribute('href')).toBe('https://example.com');
		expect(link.getAttribute('data-variant')).toBe('solid');

		const disabledLink = getAnchor('disabled-link');
		expect(disabledLink.getAttribute('aria-disabled')).toBe('true');
		expect(disabledLink.getAttribute('href')).toBeNull();
		expect(disabledLink.getAttribute('tabindex')).toBe('-1');
	});

	it('accepts an explicit aria-label for icon-only variants', () => {
		render(ButtonHarness);
		const btn = getButton('icon-aria');

		expect(btn.getAttribute('data-size')).toBe('icon');
		expect(btn.getAttribute('aria-label')).toBe('Close panel');
	});

	it('supports text-only labelling for icon-sized buttons', () => {
		render(ButtonHarness);
		const btn = getButton('icon-sm-text');

		expect(btn.getAttribute('data-size')).toBe('icon-sm');
		expect(btn.getAttribute('aria-label')).toBeNull();
		expect(btn.textContent?.trim()).toBe('Save');
	});

	it('forwards aria-pressed through rest props for toggle-style buttons', () => {
		render(ButtonHarness);
		const btn = getButton('toggle-pressed');

		expect(btn.getAttribute('data-variant')).toBe('toggle');
		expect(btn.getAttribute('aria-pressed')).toBe('true');
	});
});
