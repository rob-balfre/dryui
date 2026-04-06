import { afterEach, describe, expect, it, vi } from 'vitest';
import { mount, unmount } from 'svelte';
import Hotkey from '../../packages/primitives/src/hotkey/hotkey.svelte';

afterEach(() => {
	document.body.replaceChildren();
});

function renderHotkey(props: Record<string, unknown>) {
	const target = document.createElement('div');
	document.body.append(target);
	return mount(Hotkey, { target, props });
}

describe('Hotkey', () => {
	it('fires for punctuation keys that require shift on common layouts', () => {
		const handler = vi.fn();
		const component = renderHotkey({ keys: '?', handler });

		window.dispatchEvent(new KeyboardEvent('keydown', { key: '?', shiftKey: true }));

		expect(handler).toHaveBeenCalledTimes(1);

		unmount(component);
	});

	it('does not treat shift as optional for letter shortcuts', () => {
		const handler = vi.fn();
		const component = renderHotkey({ keys: 'a', handler });

		window.dispatchEvent(new KeyboardEvent('keydown', { key: 'A', shiftKey: true }));

		expect(handler).not.toHaveBeenCalled();

		unmount(component);
	});
});
