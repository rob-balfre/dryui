/**
 * Shared keyboard navigation for menu-like components (dropdown-menu,
 * context-menu, menubar, select, combobox). Handles ArrowUp/Down/Left/Right,
 * Home/End, and single-character typeahead.
 */

const DEFAULT_MENU_ITEM_SELECTOR = '[role="menuitem"]:not([data-disabled])';

export interface MenuNavigationOptions {
	/** Accessor that returns the menu container element (already in the DOM). */
	container: () => HTMLElement | null;
	/** Override the focusable item selector. Defaults to `[role="menuitem"]:not([data-disabled])`. */
	itemSelector?: string;
	/**
	 * Orientation controls which arrow keys move focus.
	 * - `vertical` (default): ArrowUp/Down
	 * - `horizontal`: ArrowLeft/Right
	 * - `both`: all four arrows
	 */
	orientation?: 'vertical' | 'horizontal' | 'both';
	/** If true, Home/End jump to first/last item. Defaults to true. */
	homeEnd?: boolean;
	/** If true, single-character keys focus the next item starting with that letter. Defaults to true. */
	typeahead?: boolean;
	/** Optional Escape callback (most consumers handle Escape separately via `createDismiss`). */
	onEscape?: () => void;
}

export interface MenuNavigationController {
	/** Returns the currently focusable items inside `container()`. */
	getItems(): HTMLElement[];
	/** Focuses the first item (or falls back to focusing the container). */
	focusFirst(): void;
	/** Focuses the last item (or falls back to focusing the container). */
	focusLast(): void;
	/**
	 * Handles a keyboard event according to the configured orientation. Returns
	 * true if the event was handled. Callers typically attach this directly to
	 * their `onkeydown` attribute.
	 */
	handleKeydown(e: KeyboardEvent): boolean;
}

function focusItem(items: HTMLElement[], index: number): void {
	if (items.length === 0) return;
	const clamped = ((index % items.length) + items.length) % items.length;
	items[clamped]!.focus();
}

export function createMenuNavigation(options: MenuNavigationOptions): MenuNavigationController {
	const itemSelector = options.itemSelector ?? DEFAULT_MENU_ITEM_SELECTOR;
	const orientation = options.orientation ?? 'vertical';
	const homeEnd = options.homeEnd ?? true;
	const typeahead = options.typeahead ?? true;

	function getItems(): HTMLElement[] {
		const container = options.container();
		if (!container) return [];
		return Array.from(container.querySelectorAll<HTMLElement>(itemSelector));
	}

	function focusFirst(): void {
		const container = options.container();
		if (!container) return;
		const items = getItems();
		const first = items[0];
		if (first) {
			first.focus();
		} else {
			container.focus();
		}
	}

	function focusLast(): void {
		const container = options.container();
		if (!container) return;
		const items = getItems();
		const last = items[items.length - 1];
		if (last) {
			last.focus();
		} else {
			container.focus();
		}
	}

	function handleKeydown(e: KeyboardEvent): boolean {
		if (e.key === 'Escape' && options.onEscape) {
			options.onEscape();
			return true;
		}

		const items = getItems();
		const currentIndex = items.indexOf(document.activeElement as HTMLElement);

		const verticalActive = orientation === 'vertical' || orientation === 'both';
		const horizontalActive = orientation === 'horizontal' || orientation === 'both';

		switch (e.key) {
			case 'ArrowDown': {
				if (!verticalActive) break;
				e.preventDefault();
				focusItem(items, currentIndex + 1);
				return true;
			}
			case 'ArrowUp': {
				if (!verticalActive) break;
				e.preventDefault();
				focusItem(items, currentIndex - 1);
				return true;
			}
			case 'ArrowRight': {
				if (!horizontalActive) break;
				e.preventDefault();
				focusItem(items, currentIndex + 1);
				return true;
			}
			case 'ArrowLeft': {
				if (!horizontalActive) break;
				e.preventDefault();
				focusItem(items, currentIndex - 1);
				return true;
			}
			case 'Home': {
				if (!homeEnd) break;
				e.preventDefault();
				focusItem(items, 0);
				return true;
			}
			case 'End': {
				if (!homeEnd) break;
				e.preventDefault();
				focusItem(items, items.length - 1);
				return true;
			}
		}

		if (typeahead && e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
			const char = e.key.toLowerCase();
			const match = items.find((item) => item.textContent?.trim().toLowerCase().startsWith(char));
			if (match) {
				match.focus();
				return true;
			}
		}

		return false;
	}

	return { getItems, focusFirst, focusLast, handleKeydown };
}
