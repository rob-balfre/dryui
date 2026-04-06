/**
 * Shared keyboard navigation for menu-like components (dropdown-menu, context-menu, select, menubar).
 * Handles ArrowUp/Down, Home/End, and typeahead character matching.
 */

const MENU_ITEM_SELECTOR = '[role="menuitem"]:not([data-disabled])';
const OPTION_SELECTOR = '[role="option"]:not([data-disabled])';

export function getMenuItems(
	container: HTMLElement,
	selector: string = MENU_ITEM_SELECTOR
): HTMLElement[] {
	return Array.from(container.querySelectorAll<HTMLElement>(selector));
}

export function getOptionItems(container: HTMLElement): HTMLElement[] {
	return getMenuItems(container, OPTION_SELECTOR);
}

export function focusItem(items: HTMLElement[], index: number): void {
	if (items.length === 0) return;
	const clamped = ((index % items.length) + items.length) % items.length;
	items[clamped]!.focus();
}

export function focusFirstItem(container: HTMLElement, items: HTMLElement[]): void {
	const first = items[0];
	if (first) {
		first.focus();
	} else {
		container.focus();
	}
}

/**
 * Handles the common subset of menu keyboard navigation:
 * ArrowDown, ArrowUp, Home, End, and single-character typeahead.
 *
 * Returns true if the event was handled (caller should not process further).
 */
export function handleMenuKeydown(e: KeyboardEvent, items: HTMLElement[]): boolean {
	const currentIndex = items.indexOf(document.activeElement as HTMLElement);

	switch (e.key) {
		case 'ArrowDown': {
			e.preventDefault();
			focusItem(items, currentIndex + 1);
			return true;
		}
		case 'ArrowUp': {
			e.preventDefault();
			focusItem(items, currentIndex - 1);
			return true;
		}
		case 'Home': {
			e.preventDefault();
			focusItem(items, 0);
			return true;
		}
		case 'End': {
			e.preventDefault();
			focusItem(items, items.length - 1);
			return true;
		}
		default: {
			if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
				const char = e.key.toLowerCase();
				const match = items.find((item) => item.textContent?.trim().toLowerCase().startsWith(char));
				if (match) match.focus();
				return true;
			}
			return false;
		}
	}
}
