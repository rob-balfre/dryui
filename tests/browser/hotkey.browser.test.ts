import { describe, expect, it, vi } from 'vitest';
import Hotkey from '../../packages/primitives/src/hotkey/hotkey.svelte';
import { render } from './_harness';

describe('Hotkey', () => {
	it('fires for punctuation keys that require shift on common layouts', () => {
		const handler = vi.fn();
		render(Hotkey, { keys: '?', handler });

		window.dispatchEvent(new KeyboardEvent('keydown', { key: '?', shiftKey: true }));

		expect(handler).toHaveBeenCalledTimes(1);
	});

	it('does not treat shift as optional for letter shortcuts', () => {
		const handler = vi.fn();
		render(Hotkey, { keys: 'a', handler });

		window.dispatchEvent(new KeyboardEvent('keydown', { key: 'A', shiftKey: true }));

		expect(handler).not.toHaveBeenCalled();
	});
});
