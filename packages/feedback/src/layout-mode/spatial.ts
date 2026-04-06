import type { CSSContext, Rect, SpatialContext, ViewportSize } from './types.js';

function round(value: number): number {
	return Math.round(value);
}

export function intersectsRect(a: Rect, b: Rect): boolean {
	return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

export function rectFromPoints(a: { x: number; y: number }, b: { x: number; y: number }): Rect {
	return {
		x: Math.min(a.x, b.x),
		y: Math.min(a.y, b.y),
		width: Math.abs(b.x - a.x),
		height: Math.abs(b.y - a.y)
	};
}

export function hasMeaningfulArea(rect: Rect, threshold = 8): boolean {
	return rect.width >= threshold && rect.height >= threshold;
}

export function toRect(rect: DOMRect | Rect): Rect {
	return {
		x: rect.x,
		y: rect.y,
		width: rect.width,
		height: rect.height
	};
}

export function unionRects(rects: readonly Rect[]): Rect | null {
	if (rects.length === 0) return null;
	const x = Math.min(...rects.map((rect) => rect.x));
	const y = Math.min(...rects.map((rect) => rect.y));
	const right = Math.max(...rects.map((rect) => rect.x + rect.width));
	const bottom = Math.max(...rects.map((rect) => rect.y + rect.height));
	return { x, y, width: right - x, height: bottom - y };
}

export function uniqueLabels(labels: readonly string[]): string[] {
	return Array.from(new Set(labels.filter(Boolean)));
}

export function normalizeText(value: string): string {
	return value.replace(/\s+/g, ' ').trim();
}

export function getPopupPosition(
	rect: Rect,
	viewportWidth: number,
	popupWidth = 340
): { x: number; y: number } {
	const x =
		rect.x + rect.width + 16 > viewportWidth
			? Math.max(16, rect.x - popupWidth - 16)
			: Math.min(rect.x + rect.width + 16, viewportWidth - popupWidth - 16);
	const y = Math.max(16, rect.y);
	return { x, y };
}

export function getSpatialContext(
	rect: Rect,
	viewport: ViewportSize = {
		width: typeof window === 'undefined' ? 0 : window.innerWidth,
		height: typeof window === 'undefined' ? 0 : window.innerHeight
	}
): SpatialContext {
	const centerX = rect.x + rect.width / 2;
	const centerY = rect.y + rect.height / 2;
	return {
		top: rect.y,
		right: viewport.width - (rect.x + rect.width),
		bottom: viewport.height - (rect.y + rect.height),
		left: rect.x,
		centerX,
		centerY,
		rowCount: Math.max(1, Math.round(rect.height / 96)),
		columnCount: Math.max(1, Math.round(rect.width / 160))
	};
}

export function formatSpatialLines(
	context: SpatialContext,
	options?: { includeLeftRight?: boolean }
): string[] {
	const lines = [
		`Top: ${round(context.top ?? 0)}px`,
		`Bottom: ${round(context.bottom ?? 0)}px`,
		`Center: ${round(context.centerX)} x ${round(context.centerY)}`,
		`Approx layout: ${context.rowCount} row${context.rowCount === 1 ? '' : 's'} x ${context.columnCount} column${context.columnCount === 1 ? '' : 's'}`
	];

	if (options?.includeLeftRight) {
		lines.splice(
			1,
			0,
			`Left: ${round(context.left ?? 0)}px`,
			`Right: ${round(context.right ?? 0)}px`
		);
	}

	return lines;
}

export function formatPositionSummary(rect: Rect): string {
	return `${round(rect.width)}x${round(rect.height)} at (${round(rect.x)}, ${round(rect.y)})`;
}

export function analyzeLayoutPatterns(rects: readonly Rect[]): string[] {
	if (rects.length === 0) return [];

	const ordered = [...rects].sort((a, b) => (Math.abs(a.y - b.y) < 20 ? a.x - b.x : a.y - b.y));
	const rows: Rect[][] = [];

	for (const rect of ordered) {
		const row = rows.find((group) => {
			const first = group[0];
			return first ? Math.abs(first.y - rect.y) < 30 : false;
		});
		if (row) {
			row.push(rect);
		} else {
			rows.push([rect]);
		}
	}

	return rows.map((row, index) => {
		if (row.length === 1) {
			return `Row ${index + 1}: single element`;
		}
		return `Row ${index + 1}: ${row.length} items side by side`;
	});
}

export function getPageLayout(viewport: ViewportSize): {
	viewport: ViewportSize;
	contentArea: {
		selector: string;
		width: number;
		left: number;
		right: number;
		centerX: number;
	} | null;
} {
	if (typeof document === 'undefined') {
		return { viewport, contentArea: null };
	}

	const roots = Array.from(document.body.children).filter(
		(el) => el instanceof HTMLElement
	) as HTMLElement[];
	const content = roots
		.map((el) => ({ el, rect: el.getBoundingClientRect() }))
		.filter(
			({ rect }) =>
				rect.width > viewport.width * 0.35 &&
				rect.width < viewport.width * 0.95 &&
				rect.left > 0 &&
				rect.right < viewport.width
		)
		.sort(
			(a, b) =>
				Math.abs(a.rect.width - viewport.width * 0.7) -
				Math.abs(b.rect.width - viewport.width * 0.7)
		)[0];

	if (!content) return { viewport, contentArea: null };

	return {
		viewport,
		contentArea: {
			selector: content.el.tagName.toLowerCase(),
			width: content.rect.width,
			left: content.rect.left,
			right: content.rect.right,
			centerX: content.rect.left + content.rect.width / 2
		}
	};
}

export function getElementCSSContext(selector: string): CSSContext | null {
	if (
		typeof document === 'undefined' ||
		typeof window === 'undefined' ||
		typeof HTMLElement === 'undefined'
	) {
		return null;
	}

	const element = document.querySelector(selector);
	if (!(element instanceof HTMLElement)) return null;

	const parent = element.parentElement;
	if (!(parent instanceof HTMLElement)) return null;

	const style = window.getComputedStyle(parent);
	return {
		parentSelector: parent === document.body ? 'body' : parent.tagName.toLowerCase(),
		parentDisplay: style.display || 'block',
		flexDirection: style.flexDirection || null,
		gridCols: style.gridTemplateColumns || null,
		gap: style.gap || null
	};
}

export function formatCSSPosition(
	rect: Rect,
	layout: { viewport: ViewportSize; contentArea: { left: number; width: number } | null }
): string | null {
	if (!layout.contentArea) {
		if (layout.viewport.width <= 0) return null;
		return `width: ${Math.max(0, Math.round((rect.width / layout.viewport.width) * 100))}%`;
	}

	if (layout.contentArea.width <= 0) return null;
	const x = round(rect.x - layout.contentArea.left);
	const width = Math.max(0, round((rect.width / layout.contentArea.width) * 100));
	return `left: ${x}px; width: ${width}%`;
}
