import { describe, expect, test } from 'bun:test';
import { matchesEvent, parseKeys } from '../../packages/primitives/src/hotkey/hotkey.js';

function keyEvent(
	key: string,
	modifiers: Partial<Pick<KeyboardEvent, 'ctrlKey' | 'altKey' | 'metaKey' | 'shiftKey'>> = {}
): KeyboardEvent {
	return {
		key,
		ctrlKey: false,
		altKey: false,
		metaKey: false,
		shiftKey: false,
		...modifiers
	} as KeyboardEvent;
}

describe('hotkey', () => {
	test('$mod requires ctrl or meta rather than matching the bare key', () => {
		const parsed = parseKeys('$mod+m');

		expect(matchesEvent(keyEvent('m'), parsed)).toBe(false);
		expect(matchesEvent(keyEvent('m', { metaKey: true }), parsed)).toBe(true);
		expect(matchesEvent(keyEvent('m', { ctrlKey: true }), parsed)).toBe(true);
	});
});
