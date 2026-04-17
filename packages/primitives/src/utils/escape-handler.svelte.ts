/**
 * Attaches a keydown listener on `document` that fires the provided callback
 * when the user presses Escape. Returns a cleanup function for imperative
 * call sites; inside a reactive context the same cleanup is wired to the
 * parent `$effect()` via the returned function.
 *
 * Designed to be invoked inside a component `$effect()` so that the listener
 * is scoped to the component lifecycle. Example:
 *
 *   $effect(() => {
 *     if (!ctx.open) return;
 *     return createEscapeHandler(() => ctx.close());
 *   });
 *
 * Listens in the capture phase so that the handler fires before individual
 * input elements (textareas, popovers) consume the Escape key.
 */
export function createEscapeHandler(onEscape: () => void): () => void {
	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			onEscape();
		}
	}

	document.addEventListener('keydown', handleKeydown, true);

	return () => {
		document.removeEventListener('keydown', handleKeydown, true);
	};
}
