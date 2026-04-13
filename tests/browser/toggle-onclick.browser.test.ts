import { describe, expect, it, vi } from 'vitest';
import { flushSync } from 'svelte';
import Toggle from '../../packages/primitives/src/toggle/toggle.svelte';
import { render } from './_harness';

function renderToggle(props: Record<string, unknown>) {
	const { target } = render(Toggle, props);

	const button = target.querySelector('button');

	if (!(button instanceof HTMLButtonElement)) {
		throw new Error('Expected toggle button');
	}

	return button;
}

describe('primitive Toggle onclick composition', () => {
	it('still updates pressed state when consumers pass onclick', () => {
		const onclick = vi.fn();
		const button = renderToggle({ onclick });

		expect(button.getAttribute('aria-checked')).toBe('false');

		button.click();
		flushSync();

		expect(onclick).toHaveBeenCalledTimes(1);
		expect(button.getAttribute('aria-checked')).toBe('true');
	});

	it('lets consumer onclick cancel the pressed-state change', () => {
		const onclick = vi.fn((event: MouseEvent) => {
			event.preventDefault();
		});

		const button = renderToggle({ onclick });

		button.click();
		flushSync();

		expect(onclick).toHaveBeenCalledTimes(1);
		expect(button.getAttribute('aria-checked')).toBe('false');
	});
});
