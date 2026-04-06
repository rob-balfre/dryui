const FOCUSABLE_SELECTOR =
	'a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])';

export function createFocusTrap(containerEl: () => HTMLElement | null): {
	activate: () => void;
	deactivate: () => void;
} {
	let previousFocus: Element | null = null;

	function getFocusableElements(container: HTMLElement): HTMLElement[] {
		return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key !== 'Tab') return;

		const container = containerEl();
		if (!container) return;

		const focusable = getFocusableElements(container);
		if (focusable.length === 0) return;

		const first = focusable[0];
		const last = focusable[focusable.length - 1];
		if (!first || !last) return;

		const active = document.activeElement;
		if (e.shiftKey) {
			if (active === first || !container.contains(active)) {
				e.preventDefault();
				last.focus();
			} else if (active instanceof HTMLElement) {
				e.preventDefault();
				const index = focusable.indexOf(active);
				focusable[index - 1]?.focus();
			}
		} else {
			if (active === last || !container.contains(active)) {
				e.preventDefault();
				first.focus();
			} else if (active instanceof HTMLElement) {
				e.preventDefault();
				const index = focusable.indexOf(active);
				focusable[index + 1]?.focus();
			}
		}
	}

	function activate() {
		const container = containerEl();
		if (!container) return;

		previousFocus = document.activeElement;
		container.addEventListener('keydown', handleKeydown);

		const focusable = getFocusableElements(container);
		if (focusable.length > 0) {
			focusable[0]?.focus();
		}
	}

	function deactivate() {
		const container = containerEl();
		if (container) {
			container.removeEventListener('keydown', handleKeydown);
		}

		if (previousFocus instanceof HTMLElement) {
			previousFocus.focus();
		}
		previousFocus = null;
	}

	return { activate, deactivate };
}
