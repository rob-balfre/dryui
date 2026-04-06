import type { Rect } from './types.js';

export const INTERACTIVE_TAGS = new Set([
	'a',
	'article',
	'button',
	'img',
	'input',
	'label',
	'option',
	'section',
	'select',
	'summary',
	'svg',
	'textarea'
]);

export function isElementFixed(el: Element): boolean {
	let current: Element | null = el;
	while (current instanceof HTMLElement) {
		const style = window.getComputedStyle(current);
		if (style.position === 'fixed' || style.position === 'sticky') return true;
		current = current.parentElement;
	}
	return false;
}

export function isSelectableAreaTarget(el: Element): boolean {
	if (!(el instanceof HTMLElement || el instanceof SVGElement)) return false;

	const rect = el.getBoundingClientRect();
	if (rect.width < 4 || rect.height < 4) return false;

	if (el instanceof HTMLElement) {
		const style = window.getComputedStyle(el);
		if (style.display === 'none' || style.visibility === 'hidden') return false;
	}

	const tag = el.tagName.toLowerCase();
	if (INTERACTIVE_TAGS.has(tag)) return true;
	if (el.children.length === 0) return Boolean(el.textContent?.trim());
	return Boolean(el.textContent?.trim()) && el.children.length <= 2;
}

export function rectFromElement(el: Element): Rect {
	const rect = el.getBoundingClientRect();
	return {
		x: rect.x,
		y: rect.y,
		width: rect.width,
		height: rect.height
	};
}
