export type Corner = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';

export interface ElementDescriptor {
	tag: string;
	id?: string;
	selector?: string;
}

export interface DrawingHint {
	/** Coarse quadrant the anchor falls into (or 'center' for the middle band). */
	corner: Corner;
	/** Anchor position as a percent of viewport width, clamped to 0-100. */
	percentX: number;
	/** Anchor position as a percent of viewport height, clamped to 0-100. */
	percentY: number;
	/** Element hit via document.elementFromPoint in viewport space, if any. */
	element?: ElementDescriptor;
}

const CENTER_BAND = 0.2;

function clampPercent(value: number): number {
	if (!Number.isFinite(value)) return 0;
	if (value < 0) return 0;
	if (value > 100) return 100;
	return Number(value.toFixed(2));
}

/**
 * Classify a viewport-space point into a coarse corner. Any point that lands in
 * the middle 20% band on both axes resolves to 'center'. Everything else snaps
 * to the nearest corner.
 */
export function cornerFor(
	x: number,
	y: number,
	viewportWidth: number,
	viewportHeight: number
): Corner {
	if (viewportWidth <= 0 || viewportHeight <= 0) return 'center';

	const fx = x / viewportWidth;
	const fy = y / viewportHeight;

	const inCenterX = fx >= 0.5 - CENTER_BAND / 2 && fx <= 0.5 + CENTER_BAND / 2;
	const inCenterY = fy >= 0.5 - CENTER_BAND / 2 && fy <= 0.5 + CENTER_BAND / 2;
	if (inCenterX && inCenterY) return 'center';

	const left = fx < 0.5;
	const top = fy < 0.5;
	if (top && left) return 'top-left';
	if (top && !left) return 'top-right';
	if (!top && left) return 'bottom-left';
	return 'bottom-right';
}

/**
 * Compute the percent-based position descriptor for an anchor point given
 * viewport dimensions. Coordinates must already be in viewport space (pre
 * scroll-offset translation).
 */
export function percentFor(
	x: number,
	y: number,
	viewportWidth: number,
	viewportHeight: number
): { percentX: number; percentY: number } {
	if (viewportWidth <= 0 || viewportHeight <= 0) {
		return { percentX: 0, percentY: 0 };
	}
	return {
		percentX: clampPercent((x / viewportWidth) * 100),
		percentY: clampPercent((y / viewportHeight) * 100)
	};
}

export function describePosition(
	x: number,
	y: number,
	viewportWidth: number,
	viewportHeight: number
): Pick<DrawingHint, 'corner' | 'percentX' | 'percentY'> {
	return {
		corner: cornerFor(x, y, viewportWidth, viewportHeight),
		...percentFor(x, y, viewportWidth, viewportHeight)
	};
}

function safeId(el: Element): string | undefined {
	const id = el.getAttribute('id');
	return id && id.trim() ? id.trim() : undefined;
}

function safeClassList(el: Element): string[] {
	const raw = el.getAttribute('class');
	if (!raw) return [];
	return raw
		.split(/\s+/)
		.map((part) => part.trim())
		.filter(Boolean);
}

function truncate(value: string, max: number): string {
	if (value.length <= max) return value;
	return value.slice(0, max - 1) + '…';
}

/**
 * Build a short single-line selector for the element. Prefer id, otherwise tag
 * plus up to two class names. Falls back to the bare tag name.
 */
export function describeElement(el: Element | null | undefined): ElementDescriptor | undefined {
	if (!el) return undefined;
	const tag = el.tagName.toLowerCase();
	const id = safeId(el);
	const classes = safeClassList(el).slice(0, 2);

	const parts: string[] = [tag];
	if (id) parts.push(`#${id}`);
	for (const cls of classes) parts.push(`.${cls}`);
	const selector = truncate(parts.join(''), 80);

	return {
		tag,
		...(id ? { id } : {}),
		...(selector && selector !== tag ? { selector } : {})
	};
}
