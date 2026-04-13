import { describe, expect, it, vi } from 'vitest';
import Hotkey from '../../packages/primitives/src/hotkey/hotkey.svelte';
import { render } from './_harness';

describe('Hotkey', () => {
	it('treats $mod shortcuts as requiring a modifier key', () => {
		const handler = vi.fn();
		render(Hotkey, { keys: '$mod+m', handler });

		window.dispatchEvent(new KeyboardEvent('keydown', { key: 'm' }));
		window.dispatchEvent(new KeyboardEvent('keydown', { key: 'm', metaKey: true }));
		window.dispatchEvent(new KeyboardEvent('keydown', { key: 'm', ctrlKey: true }));

		expect(handler).toHaveBeenCalledTimes(2);
	});

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
