/** Svelte action that sets `node.style.background` and updates it reactively. */
export function bg(node: HTMLElement, color: string) {
	node.style.background = color;
	return {
		update(color: string) {
			node.style.background = color;
		}
	};
}
