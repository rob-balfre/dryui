export function deepElementFromPoint(x: number, y: number): Element | null {
	let el = document.elementFromPoint(x, y);
	if (!el) return null;

	while (el.shadowRoot) {
		const inner = el.shadowRoot.elementFromPoint(x, y);
		if (!inner || inner === el) break;
		el = inner;
	}

	return el;
}

export function isInShadowDOM(el: Element): boolean {
	const root = el.getRootNode();
	return root instanceof ShadowRoot;
}

export function getShadowHost(el: Element): Element | null {
	const root = el.getRootNode();
	if (root instanceof ShadowRoot) {
		return root.host;
	}
	return null;
}

export function closestCrossingShadow(el: Element, selector: string): Element | null {
	let current: Element | null = el;

	while (current) {
		const match = current.closest(selector);
		if (match) return match;

		const root = current.getRootNode();
		if (root instanceof ShadowRoot) {
			current = root.host;
		} else {
			break;
		}
	}

	return null;
}
