import type { Rect } from '../types.js';

export interface Point {
	x: number;
	y: number;
}

export interface RectLike {
	x: number;
	y: number;
	width: number;
	height: number;
}

const DEFAULT_VIEWPORT_PADDING = 16;

export function normalizeText(text: string): string {
	return text.replace(/\s+/g, ' ').trim();
}

export function toRect(rect: RectLike): Rect {
	return {
		x: rect.x,
		y: rect.y,
		width: rect.width,
		height: rect.height
	};
}

export function rectFromPoints(start: Point, end: Point): Rect {
	const x = Math.min(start.x, end.x);
	const y = Math.min(start.y, end.y);

	return {
		x,
		y,
		width: Math.abs(end.x - start.x),
		height: Math.abs(end.y - start.y)
	};
}

export function unionRects(rects: readonly RectLike[]): Rect | null {
	const [first, ...rest] = rects;
	if (!first) return null;

	let left = first.x;
	let top = first.y;
	let right = first.x + first.width;
	let bottom = first.y + first.height;

	for (const rect of rest) {
		left = Math.min(left, rect.x);
		top = Math.min(top, rect.y);
		right = Math.max(right, rect.x + rect.width);
		bottom = Math.max(bottom, rect.y + rect.height);
	}

	return {
		x: left,
		y: top,
		width: right - left,
		height: bottom - top
	};
}

export function hasMeaningfulArea(rect: Rect, threshold: number): boolean {
	return rect.width >= threshold || rect.height >= threshold;
}

export function intersectsRect(a: Rect, b: RectLike): boolean {
	return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

export function getPopupPosition(
	rect: Rect,
	viewportWidth: number,
	popupWidth: number,
	viewportPadding: number = DEFAULT_VIEWPORT_PADDING
): { x: number; y: number } {
	return {
		x: Math.min(rect.x + rect.width + 8, Math.max(viewportPadding, viewportWidth - popupWidth)),
		y: Math.max(viewportPadding, rect.y)
	};
}

export function uniqueLabels(labels: string[]): string[] {
	return labels.filter((label, index, all) => label.length > 0 && all.indexOf(label) === index);
}
