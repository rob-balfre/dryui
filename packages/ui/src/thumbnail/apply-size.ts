function apply(node: HTMLElement, size: number | string) {
	if (typeof size === 'number') {
		node.style.setProperty('--thumbnail-w', `${size}px`);
		node.style.setProperty('--thumbnail-h', `${Math.round(size / 1.5)}px`);
	} else {
		node.style.removeProperty('--thumbnail-w');
		node.style.removeProperty('--thumbnail-h');
	}
}

export function applySizeVars(node: HTMLElement, size: number | string) {
	apply(node, size);
	return { update: (newSize: number | string) => apply(node, newSize) };
}
