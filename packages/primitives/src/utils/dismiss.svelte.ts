export interface DismissOptions {
	/** Called when the user requests dismissal (Escape, click outside, etc.). */
	onDismiss: () => void;
	/** Enable Escape-key dismissal. Defaults to true. */
	escapeKey?: boolean;
	/** Enable pointerdown-outside dismissal. Defaults to true. */
	clickOutside?: boolean;
	/**
	 * Single-element container fallback. If provided, pointerdown inside
	 * `containerEl()` does NOT dismiss. Kept for backwards compatibility
	 * with the original two-arg shape — prefer `contentEl` + `triggerEl`
	 * when you have both a trigger and a content element.
	 */
	containerEl?: () => HTMLElement | null;
	/** Popover/panel element. pointerdown inside this element does NOT dismiss. */
	contentEl?: () => HTMLElement | null;
	/** Trigger element. pointerdown inside this element does NOT dismiss. */
	triggerEl?: () => HTMLElement | null;
	/**
	 * Reactive gate: when `enabled()` returns false, the internal listeners are
	 * detached and no dismissals fire. Useful for popover-class components that
	 * should only listen while open. Defaults to `() => true` (always active).
	 */
	enabled?: () => boolean;
	/**
	 * If true and Escape is pressed, `event.preventDefault()` is called before
	 * `onDismiss` fires. Needed when the popover would otherwise close via the
	 * browser's Popover API and swallow the trigger-focus-restore logic.
	 */
	preventDefaultOnEscape?: boolean | (() => boolean);
	/** After Escape dismisses, focus is returned to this element if provided. */
	returnFocusTo?: () => HTMLElement | null;
}

/**
 * Pure helper: decides whether a given event target is considered "inside"
 * the dismissible region — meaning dismissal should NOT fire. Exposed for
 * test coverage and for consumers that want custom dismiss routing.
 */
export function isInsideDismissRegion(
	target: EventTarget | null,
	regions: {
		contentEl?: HTMLElement | null | undefined;
		triggerEl?: HTMLElement | null | undefined;
		containerEl?: HTMLElement | null | undefined;
	}
): boolean {
	if (!(target instanceof Node)) return false;
	if (regions.contentEl?.contains(target)) return true;
	if (regions.triggerEl?.contains(target)) return true;
	if (regions.containerEl?.contains(target)) return true;
	const ElementCtor = globalThis.Element;
	if (typeof ElementCtor !== 'undefined' && target instanceof ElementCtor) {
		if (target.closest('[data-dismiss-ignore]')) return true;
	}
	return false;
}

/**
 * Unified dismiss behavior for overlay-class components (popover, menu,
 * context-menu, hover-card, link-preview). Attaches capture-phase `keydown`
 * and bubble-phase `pointerdown` listeners on `document` and calls
 * `onDismiss` when either fires outside the `contentEl` / `triggerEl` /
 * `containerEl` bounds.
 *
 * Must be called from inside a component context (uses `$effect`). The
 * listeners are automatically cleaned up when the owning effect tears down
 * or when `enabled()` flips to false.
 */
export function createDismiss(options: DismissOptions): void {
	const escapeKey = options.escapeKey ?? true;
	const clickOutside = options.clickOutside ?? true;
	const isEnabled = options.enabled ?? (() => true);
	const preventDefaultOnEscape =
		typeof options.preventDefaultOnEscape === 'function'
			? options.preventDefaultOnEscape
			: () => options.preventDefaultOnEscape ?? false;

	$effect(() => {
		if (!escapeKey) return;
		if (!isEnabled()) return;

		function handleKeydown(e: KeyboardEvent) {
			if (e.key !== 'Escape') return;
			if (preventDefaultOnEscape()) {
				e.preventDefault();
			}
			options.onDismiss();
			const focusTarget = options.returnFocusTo?.();
			if (focusTarget instanceof HTMLElement) {
				focusTarget.focus();
			}
		}

		document.addEventListener('keydown', handleKeydown, true);

		return () => {
			document.removeEventListener('keydown', handleKeydown, true);
		};
	});

	$effect(() => {
		if (!clickOutside) return;
		if (!isEnabled()) return;

		function handlePointerdown(e: PointerEvent) {
			const inside = isInsideDismissRegion(e.target, {
				contentEl: options.contentEl?.(),
				triggerEl: options.triggerEl?.(),
				containerEl: options.containerEl?.()
			});
			if (inside) return;
			options.onDismiss();
		}

		document.addEventListener('pointerdown', handlePointerdown);

		return () => {
			document.removeEventListener('pointerdown', handlePointerdown);
		};
	});
}
