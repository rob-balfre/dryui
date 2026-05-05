import { describeElement, type ElementDescriptor } from './position-hints.js';
import type {
	BrowserScreenshotLayoutSnapshot,
	BrowserSubmissionAddedComponent,
	BrowserSubmissionMovedElement,
	BrowserSubmissionRect,
	BrowserSubmissionRemovedElement
} from './submission-capture-payload.js';

export interface LayoutSnapshot {
	left: string;
	top: string;
	width: string;
	height: string;
	transform: string;
	rotation: string | undefined;
}

export interface BrowserCaptureAddedDraft {
	id: string;
	kind: string;
	element: HTMLElement;
	label?: string;
	propsJson?: string;
}

export interface BrowserCaptureRemovedDraft {
	descriptor: ElementDescriptor | null;
	rect: BrowserSubmissionRect;
}

export interface BrowserCaptureMovedDraft {
	original: HTMLElement;
	clone: HTMLElement;
	initial: LayoutSnapshot | undefined;
}

export interface BrowserCaptureLayoutDraft {
	added: readonly BrowserCaptureAddedDraft[];
	removed: readonly BrowserCaptureRemovedDraft[];
	moved: readonly BrowserCaptureMovedDraft[];
}

export function snapshotElementLayout(element: HTMLElement): LayoutSnapshot {
	return {
		left: element.style.left,
		top: element.style.top,
		width: element.style.width,
		height: element.style.height,
		transform: element.style.transform,
		rotation: element.dataset.dryuiLayoutRotation
	};
}

export function applyElementLayoutSnapshot(element: HTMLElement, snap: LayoutSnapshot): void {
	element.style.left = snap.left;
	element.style.top = snap.top;
	element.style.width = snap.width;
	element.style.height = snap.height;
	element.style.transform = snap.transform;
	if (snap.rotation === undefined) delete element.dataset.dryuiLayoutRotation;
	else element.dataset.dryuiLayoutRotation = snap.rotation;
}

export function sameLayoutSnapshot(a: LayoutSnapshot, b: LayoutSnapshot): boolean {
	return (
		a.left === b.left &&
		a.top === b.top &&
		a.width === b.width &&
		a.height === b.height &&
		a.transform === b.transform &&
		a.rotation === b.rotation
	);
}

export function sanitizeLayoutSnapshot(value: unknown): LayoutSnapshot | null {
	if (!isObject(value)) return null;
	return {
		left: typeof value.left === 'string' ? value.left : '',
		top: typeof value.top === 'string' ? value.top : '',
		width: typeof value.width === 'string' ? value.width : '',
		height: typeof value.height === 'string' ? value.height : '',
		transform: typeof value.transform === 'string' ? value.transform : '',
		rotation: typeof value.rotation === 'string' ? value.rotation : undefined
	};
}

export function parsePropsJson(json: string | undefined): Record<string, unknown> {
	if (!json?.trim()) return {};
	try {
		const parsed = JSON.parse(json);
		if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
			return parsed as Record<string, unknown>;
		}
	} catch {
		// fall through to empty props on invalid JSON
	}
	return {};
}

export function snapshotBrowserCaptureLayout(
	draft: BrowserCaptureLayoutDraft
): BrowserScreenshotLayoutSnapshot {
	return {
		components: snapshotAddedComponents(draft.added),
		removed: snapshotRemovedElements(draft.removed),
		moved: snapshotMovedElements(draft.moved)
	};
}

export function mountBrowserCaptureAnnotations(
	draft: BrowserCaptureLayoutDraft,
	options: { document?: Document; viewportWidth?: number } = {}
): () => void {
	const doc = options.document ?? readDefaultDocument();
	if (!doc) return () => {};

	const nodes: HTMLElement[] = [];
	const accent = 'hsl(25 100% 55%)';
	const danger = 'hsl(0 75% 55%)';
	const info = 'hsl(210 90% 55%)';
	const viewportWidth = options.viewportWidth ?? readDefaultViewportWidth();

	for (const record of draft.removed) {
		const { rect } = record;
		if (rect.width < 1 || rect.height < 1) continue;
		const outline = doc.createElement('div');
		outline.dataset.dryuiCaptureAnnotation = 'removed-outline';
		Object.assign(outline.style, {
			position: 'fixed',
			left: `${rect.x}px`,
			top: `${rect.y}px`,
			width: `${rect.width}px`,
			height: `${rect.height}px`,
			border: `2px dashed ${danger}`,
			borderRadius: '4px',
			background: 'hsl(0 75% 55% / 0.08)',
			pointerEvents: 'none',
			zIndex: '2147483646',
			boxSizing: 'border-box'
		});
		doc.body.appendChild(outline);
		nodes.push(outline);

		const chipText = `removed: ${record.descriptor?.selector || record.descriptor?.tag || 'element'}`;
		const chip = doc.createElement('div');
		chip.dataset.dryuiCaptureAnnotation = 'removed-chip';
		chip.textContent = chipText;
		const fitsAbove = rect.y >= 24;
		Object.assign(chip.style, {
			position: 'fixed',
			left: `${Math.max(4, rect.x)}px`,
			top: fitsAbove ? `${rect.y - 22}px` : `${rect.y + rect.height + 4}px`,
			maxWidth: `${chipMaxWidth(viewportWidth, rect.x, rect.width)}px`,
			padding: '3px 7px',
			borderRadius: '4px',
			background: danger,
			color: 'white',
			fontFamily: 'system-ui, -apple-system, sans-serif',
			fontSize: '11px',
			fontWeight: '700',
			lineHeight: '16px',
			letterSpacing: '0.01em',
			whiteSpace: 'nowrap',
			overflow: 'hidden',
			textOverflow: 'ellipsis',
			pointerEvents: 'none',
			zIndex: '2147483647',
			boxShadow: '0 2px 6px hsl(0 0% 0% / 0.4)'
		});
		doc.body.appendChild(chip);
		nodes.push(chip);
	}

	for (const record of draft.added) {
		const rect = record.element.getBoundingClientRect();
		if (rect.width < 1 || rect.height < 1) continue;

		const outline = doc.createElement('div');
		outline.dataset.dryuiCaptureAnnotation = 'outline';
		Object.assign(outline.style, {
			position: 'fixed',
			left: `${rect.left}px`,
			top: `${rect.top}px`,
			width: `${rect.width}px`,
			height: `${rect.height}px`,
			border: `2px solid ${accent}`,
			borderRadius: '4px',
			pointerEvents: 'none',
			zIndex: '2147483646',
			boxSizing: 'border-box'
		});
		doc.body.appendChild(outline);
		nodes.push(outline);

		const props = parsePropsJson(record.propsJson);
		const labelText = record.label?.trim() || record.kind;
		const propsText = formatPropsForChip(props);
		const chip = doc.createElement('div');
		chip.dataset.dryuiCaptureAnnotation = 'chip';
		chip.textContent = `<${labelText}>${propsText}`;

		const fitsAbove = rect.top >= 24;
		Object.assign(chip.style, {
			position: 'fixed',
			left: `${Math.max(4, rect.left)}px`,
			top: fitsAbove ? `${rect.top - 22}px` : `${rect.bottom + 4}px`,
			maxWidth: `${chipMaxWidth(viewportWidth, rect.left, rect.width)}px`,
			padding: '3px 7px',
			borderRadius: '4px',
			background: accent,
			color: 'black',
			fontFamily: 'system-ui, -apple-system, sans-serif',
			fontSize: '11px',
			fontWeight: '700',
			lineHeight: '16px',
			letterSpacing: '0.01em',
			whiteSpace: 'nowrap',
			overflow: 'hidden',
			textOverflow: 'ellipsis',
			pointerEvents: 'none',
			zIndex: '2147483647',
			boxShadow: '0 2px 6px hsl(0 0% 0% / 0.4)'
		});
		doc.body.appendChild(chip);
		nodes.push(chip);
	}

	for (const record of draft.moved) {
		if (!isChangedMovedDraft(record)) continue;
		const originalRect = record.original.getBoundingClientRect();
		const currentRect = record.clone.getBoundingClientRect();
		if (currentRect.width < 1 || currentRect.height < 1) continue;

		if (originalRect.width >= 1 && originalRect.height >= 1) {
			const ghost = doc.createElement('div');
			ghost.dataset.dryuiCaptureAnnotation = 'moved-ghost';
			Object.assign(ghost.style, {
				position: 'fixed',
				left: `${originalRect.left}px`,
				top: `${originalRect.top}px`,
				width: `${originalRect.width}px`,
				height: `${originalRect.height}px`,
				border: `2px dashed ${info}`,
				borderRadius: '4px',
				background: 'hsl(210 90% 55% / 0.05)',
				pointerEvents: 'none',
				zIndex: '2147483645',
				boxSizing: 'border-box'
			});
			doc.body.appendChild(ghost);
			nodes.push(ghost);
		}

		const outline = doc.createElement('div');
		outline.dataset.dryuiCaptureAnnotation = 'moved-outline';
		Object.assign(outline.style, {
			position: 'fixed',
			left: `${currentRect.left}px`,
			top: `${currentRect.top}px`,
			width: `${currentRect.width}px`,
			height: `${currentRect.height}px`,
			border: `2px solid ${info}`,
			borderRadius: '4px',
			background: 'hsl(210 90% 55% / 0.08)',
			pointerEvents: 'none',
			zIndex: '2147483646',
			boxSizing: 'border-box'
		});
		doc.body.appendChild(outline);
		nodes.push(outline);

		const descriptor = describeElement(record.original);
		const chipLabel = descriptor?.selector || descriptor?.tag || 'element';
		const chip = doc.createElement('div');
		chip.dataset.dryuiCaptureAnnotation = 'moved-chip';
		chip.textContent = `moved: ${chipLabel}`;
		const fitsAbove = currentRect.top >= 24;
		Object.assign(chip.style, {
			position: 'fixed',
			left: `${Math.max(4, currentRect.left)}px`,
			top: fitsAbove
				? `${currentRect.top - 22}px`
				: `${currentRect.top + currentRect.height + 4}px`,
			maxWidth: `${chipMaxWidth(viewportWidth, currentRect.left, currentRect.width)}px`,
			padding: '3px 7px',
			borderRadius: '4px',
			background: info,
			color: 'white',
			fontFamily: 'system-ui, -apple-system, sans-serif',
			fontSize: '11px',
			fontWeight: '700',
			lineHeight: '16px',
			letterSpacing: '0.01em',
			whiteSpace: 'nowrap',
			overflow: 'hidden',
			textOverflow: 'ellipsis',
			pointerEvents: 'none',
			zIndex: '2147483647',
			boxShadow: '0 2px 6px hsl(0 0% 0% / 0.4)'
		});
		doc.body.appendChild(chip);
		nodes.push(chip);
	}

	return () => {
		for (const node of nodes) node.remove();
	};
}

function snapshotAddedComponents(
	records: readonly BrowserCaptureAddedDraft[]
): BrowserSubmissionAddedComponent[] {
	const out: BrowserSubmissionAddedComponent[] = [];
	for (const record of records) {
		const rect = record.element.getBoundingClientRect();
		if (rect.width < 1 || rect.height < 1) continue;
		const props = parsePropsJson(record.propsJson);
		out.push({
			id: record.id,
			kind: record.kind,
			label: record.label?.trim() || undefined,
			props: Object.keys(props).length > 0 ? props : undefined,
			rect: { x: rect.left, y: rect.top, width: rect.width, height: rect.height }
		});
	}
	return out;
}

function snapshotRemovedElements(
	records: readonly BrowserCaptureRemovedDraft[]
): BrowserSubmissionRemovedElement[] {
	const out: BrowserSubmissionRemovedElement[] = [];
	for (const record of records) {
		const descriptor = record.descriptor ?? { tag: 'unknown' };
		out.push({
			tag: descriptor.tag,
			...(descriptor.id ? { id: descriptor.id } : {}),
			...(descriptor.selector ? { selector: descriptor.selector } : {}),
			rect: record.rect
		});
	}
	return out;
}

function snapshotMovedElements(
	records: readonly BrowserCaptureMovedDraft[]
): BrowserSubmissionMovedElement[] {
	const out: BrowserSubmissionMovedElement[] = [];
	for (const record of records) {
		if (!isChangedMovedDraft(record)) continue;
		const originalRect = record.original.getBoundingClientRect();
		const currentRect = record.clone.getBoundingClientRect();
		if (currentRect.width < 1 || currentRect.height < 1) continue;
		const descriptor = describeElement(record.original) ?? { tag: 'unknown' };
		out.push({
			tag: descriptor.tag,
			...(descriptor.id ? { id: descriptor.id } : {}),
			...(descriptor.selector ? { selector: descriptor.selector } : {}),
			originalRect: toSubmissionRect(originalRect),
			currentRect: toSubmissionRect(currentRect)
		});
	}
	return out;
}

function isChangedMovedDraft(record: BrowserCaptureMovedDraft): boolean {
	return (
		!!record.initial && !sameLayoutSnapshot(snapshotElementLayout(record.clone), record.initial)
	);
}

function formatPropsForChip(props: Record<string, unknown>): string {
	const pairs = Object.entries(props)
		.filter(([, value]) => value !== undefined && value !== null && value !== '')
		.map(([key, value]) => {
			if (typeof value === 'string') return `${key}="${value}"`;
			if (typeof value === 'boolean' || typeof value === 'number') return `${key}={${value}}`;
			return `${key}={${JSON.stringify(value)}}`;
		});
	return pairs.length ? ' · ' + pairs.join(' ') : '';
}

function chipMaxWidth(viewportWidth: number, x: number, width: number): number {
	return Math.max(180, Math.min(viewportWidth - x - 8, width + 80));
}

function toSubmissionRect(rect: DOMRect): BrowserSubmissionRect {
	return { x: rect.left, y: rect.top, width: rect.width, height: rect.height };
}

function isObject(value: unknown): value is Record<string, unknown> {
	return value !== null && typeof value === 'object';
}

function readDefaultDocument(): Document | undefined {
	return typeof document === 'undefined' ? undefined : document;
}

function readDefaultViewportWidth(): number {
	return typeof window === 'undefined' ? 0 : window.innerWidth;
}
