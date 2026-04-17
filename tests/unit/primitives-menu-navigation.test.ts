import { describe, test, expect, beforeAll } from 'bun:test';
import { Window } from 'happy-dom';

let window: InstanceType<typeof Window>;
let document: Document;

beforeAll(() => {
	window = new Window();
	// happy-dom 20.x does not always wire SyntaxError onto the window; patch it
	// so `querySelectorAll` can surface parse errors without throwing an
	// internal "undefined is not a constructor" first.
	(window as any).SyntaxError = SyntaxError;
	document = window.document as unknown as Document;

	// Expose DOM APIs our primitive uses via module-level globals.
	(globalThis as any).document = document;
	(globalThis as any).HTMLElement = window.HTMLElement;
	(globalThis as any).Node = window.Node;
});

async function loadMenuNavigation() {
	// Lazy import so the globals above are in scope.
	return await import('../../packages/primitives/src/utils/menu-navigation.svelte.ts');
}

function createMenu(itemCount: number, disabledIndices: number[] = []): HTMLElement {
	const container = document.createElement('div');
	container.tabIndex = -1;
	for (let i = 0; i < itemCount; i++) {
		const item = document.createElement('button');
		item.setAttribute('role', 'menuitem');
		item.tabIndex = 0;
		item.textContent = `Item ${i}`;
		if (disabledIndices.includes(i)) {
			item.setAttribute('data-disabled', '');
		}
		container.appendChild(item);
	}
	document.body.appendChild(container);
	return container;
}

function keyEvent(key: string): KeyboardEvent {
	return new (window.KeyboardEvent as unknown as typeof KeyboardEvent)('keydown', {
		key,
		bubbles: true,
		cancelable: true
	});
}

describe('createMenuNavigation', () => {
	test('ArrowDown moves focus to the next item and wraps at the end', async () => {
		const { createMenuNavigation } = await loadMenuNavigation();
		const el = createMenu(3);
		const items = Array.from(el.querySelectorAll<HTMLElement>('[role="menuitem"]'));
		const menu = createMenuNavigation({ container: () => el });

		items[0]!.focus();
		expect(document.activeElement).toBe(items[0] as unknown as Element);

		menu.handleKeydown(keyEvent('ArrowDown'));
		expect(document.activeElement).toBe(items[1] as unknown as Element);

		menu.handleKeydown(keyEvent('ArrowDown'));
		expect(document.activeElement).toBe(items[2] as unknown as Element);

		// Wrap to first
		menu.handleKeydown(keyEvent('ArrowDown'));
		expect(document.activeElement).toBe(items[0] as unknown as Element);
	});

	test('ArrowUp moves focus to previous item and wraps at the start', async () => {
		const { createMenuNavigation } = await loadMenuNavigation();
		const el = createMenu(3);
		const items = Array.from(el.querySelectorAll<HTMLElement>('[role="menuitem"]'));
		const menu = createMenuNavigation({ container: () => el });

		items[0]!.focus();
		menu.handleKeydown(keyEvent('ArrowUp'));
		// Wraps to last
		expect(document.activeElement).toBe(items[2] as unknown as Element);

		menu.handleKeydown(keyEvent('ArrowUp'));
		expect(document.activeElement).toBe(items[1] as unknown as Element);
	});

	test('Home and End jump to the first and last items respectively', async () => {
		const { createMenuNavigation } = await loadMenuNavigation();
		const el = createMenu(4);
		const items = Array.from(el.querySelectorAll<HTMLElement>('[role="menuitem"]'));
		const menu = createMenuNavigation({ container: () => el });

		items[1]!.focus();
		menu.handleKeydown(keyEvent('End'));
		expect(document.activeElement).toBe(items[3] as unknown as Element);

		menu.handleKeydown(keyEvent('Home'));
		expect(document.activeElement).toBe(items[0] as unknown as Element);
	});

	test('disabled items are skipped by the query selector', async () => {
		const { createMenuNavigation } = await loadMenuNavigation();
		const el = createMenu(3, [1]);
		const menu = createMenuNavigation({ container: () => el });
		const items = menu.getItems();
		expect(items).toHaveLength(2);
		expect(items[0]!.textContent).toBe('Item 0');
		expect(items[1]!.textContent).toBe('Item 2');
	});

	test('typeahead focuses the first item whose text starts with the key', async () => {
		const { createMenuNavigation } = await loadMenuNavigation();
		const el = document.createElement('div');
		for (const label of ['Apple', 'Banana', 'Cherry']) {
			const item = document.createElement('button');
			item.setAttribute('role', 'menuitem');
			item.tabIndex = 0;
			item.textContent = label;
			el.appendChild(item);
		}
		document.body.appendChild(el);
		const items = Array.from(el.querySelectorAll<HTMLElement>('[role="menuitem"]'));
		const menu = createMenuNavigation({ container: () => el });

		items[0]!.focus();
		menu.handleKeydown(keyEvent('b'));
		expect(document.activeElement).toBe(items[1] as unknown as Element);

		menu.handleKeydown(keyEvent('c'));
		expect(document.activeElement).toBe(items[2] as unknown as Element);
	});

	test('horizontal orientation responds to ArrowLeft/Right but not ArrowUp/Down', async () => {
		const { createMenuNavigation } = await loadMenuNavigation();
		const el = createMenu(3);
		const items = Array.from(el.querySelectorAll<HTMLElement>('[role="menuitem"]'));
		const menu = createMenuNavigation({ container: () => el, orientation: 'horizontal' });

		items[0]!.focus();
		menu.handleKeydown(keyEvent('ArrowDown'));
		// No movement for vertical key
		expect(document.activeElement).toBe(items[0] as unknown as Element);

		menu.handleKeydown(keyEvent('ArrowRight'));
		expect(document.activeElement).toBe(items[1] as unknown as Element);

		menu.handleKeydown(keyEvent('ArrowLeft'));
		expect(document.activeElement).toBe(items[0] as unknown as Element);
	});

	test('onEscape callback fires when Escape key is pressed', async () => {
		const { createMenuNavigation } = await loadMenuNavigation();
		const el = createMenu(2);
		let called = 0;
		const menu = createMenuNavigation({
			container: () => el,
			onEscape: () => {
				called++;
			}
		});
		const handled = menu.handleKeydown(keyEvent('Escape'));
		expect(called).toBe(1);
		expect(handled).toBe(true);
	});

	test('focusFirst focuses the first item when items exist; falls back to container otherwise', async () => {
		const { createMenuNavigation } = await loadMenuNavigation();
		const el = createMenu(2);
		const items = Array.from(el.querySelectorAll<HTMLElement>('[role="menuitem"]'));
		const menu = createMenuNavigation({ container: () => el });
		menu.focusFirst();
		expect(document.activeElement).toBe(items[0] as unknown as Element);

		const emptyEl = document.createElement('div');
		emptyEl.tabIndex = -1;
		document.body.appendChild(emptyEl);
		const emptyMenu = createMenuNavigation({ container: () => emptyEl });
		emptyMenu.focusFirst();
		expect(document.activeElement).toBe(emptyEl as unknown as Element);
	});

	test('returns false for unhandled keys so callers can chain behavior', async () => {
		const { createMenuNavigation } = await loadMenuNavigation();
		const el = createMenu(2);
		const menu = createMenuNavigation({
			container: () => el,
			typeahead: false,
			homeEnd: false
		});
		// Tab, Enter without typeahead/homeEnd match should be unhandled.
		expect(menu.handleKeydown(keyEvent('Tab'))).toBe(false);
		expect(menu.handleKeydown(keyEvent('Enter'))).toBe(false);
	});
});
