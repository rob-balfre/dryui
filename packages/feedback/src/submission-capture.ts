// Widget-side Submission capture lifecycle. Owns the full pipeline that turns
// raw widget input (drawings, layout draft, viewport, screenshot capture, status
// callbacks) into a stored-Submission-ready payload that matches the Submission
// contract the server expects. Drawing sanitization, layout-snapshot
// construction, capture-time annotation overlays, and screenshot capture are
// private helpers below — they are not re-exported.

import {
	sameLayoutSnapshot,
	snapshotElementLayout,
	type LayoutSnapshot
} from './layout-snapshot.js';
import {
	describeElement,
	describePosition,
	type DrawingHint,
	type ElementDescriptor
} from './position-hints.js';
import type { Drawing, DrawingSpace, Point, SubmitStatus } from './types.js';

// ---------- Public types ----------

export interface BrowserSubmissionImageInput {
	webp: string;
	png: string;
}

export interface BrowserSubmissionRect {
	x: number;
	y: number;
	width: number;
	height: number;
}

export interface BrowserSubmissionAddedComponent {
	id: string;
	kind: string;
	label?: string;
	rect: BrowserSubmissionRect;
}

export interface BrowserSubmissionRemovedElement extends ElementDescriptor {
	rect: BrowserSubmissionRect;
}

export interface BrowserSubmissionMovedElement extends ElementDescriptor {
	originalRect: BrowserSubmissionRect;
	currentRect: BrowserSubmissionRect;
}

export interface BrowserSubmissionViewport {
	width: number;
	height: number;
}

export interface BrowserSubmissionScroll {
	x: number;
	y: number;
}

export interface BrowserSubmissionViewportOffset {
	left: number;
	top: number;
}

export interface BrowserSubmissionGeometry {
	viewport: BrowserSubmissionViewport;
	scroll: BrowserSubmissionScroll;
	viewportOffset: BrowserSubmissionViewportOffset;
}

export interface BrowserCreateSubmissionPayload {
	url: string;
	image: BrowserSubmissionImageInput;
	drawings: Drawing[];
	hints: DrawingHint[];
	components?: BrowserSubmissionAddedComponent[];
	removed?: BrowserSubmissionRemovedElement[];
	moved?: BrowserSubmissionMovedElement[];
	viewport: BrowserSubmissionViewport;
	scroll: BrowserSubmissionScroll;
	agent?: never;
}

export interface BrowserCaptureAddedDraft {
	id: string;
	kind: string;
	element: HTMLElement;
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

/**
 * Inputs to a single Submission capture run. The widget hands its raw state to
 * `captureSubmission`, which orchestrates the lifecycle in a fixed order:
 *
 *   1. Snapshot layout state (added/removed/moved) from the layout draft.
 *   2. Mount capture-time annotation chips and outlines onto the page.
 *   3. Hide the toolbar, request display-media, and rasterize the visible tab.
 *   4. Set submit status to `'uploading'` so the widget can switch UI affordances.
 *   5. Sanitize and clone drawings, build position hints, assemble the payload.
 *
 * Failures at any step propagate; cleanup of the media stream, capture
 * annotation overlays, and toolbar visibility always runs.
 */
export interface CaptureSubmissionInput {
	url: string;
	drawings: readonly Drawing[];
	layoutDraft: BrowserCaptureLayoutDraft;
	readGeometry: () => BrowserSubmissionGeometry;
	readCaptureViewport: () => BrowserSubmissionViewport;
	waitForNextPaint: () => Promise<void>;
	setSubmitStatus?: (status: SubmitStatus) => void;
	setToolbarHiddenForCapture?: (hidden: boolean) => void;
	requestDisplayMedia?: () => Promise<MediaStream>;
	createVideo?: () => HTMLVideoElement;
	createCanvas?: () => HTMLCanvasElement;
	document?: Document;
	overlaySelector?: string;
	buildHints?: (drawings: Drawing[], geometry: BrowserSubmissionGeometry) => DrawingHint[];
}

// ---------- Public entry point ----------

export async function captureSubmission(
	input: CaptureSubmissionInput
): Promise<BrowserCreateSubmissionPayload> {
	const layoutSnapshot = snapshotBrowserCaptureLayout(input.layoutDraft);

	const screenshot = await captureBrowserScreenshot({
		readCaptureViewport: input.readCaptureViewport,
		waitForNextPaint: input.waitForNextPaint,
		requestDisplayMedia: input.requestDisplayMedia,
		createVideo: input.createVideo,
		createCanvas: input.createCanvas,
		mountCaptureAnnotations: () =>
			mountBrowserCaptureAnnotations(input.layoutDraft, { document: input.document }),
		setSubmitStatus: input.setSubmitStatus,
		setToolbarHiddenForCapture: input.setToolbarHiddenForCapture
	});

	input.setSubmitStatus?.('uploading');

	const geometry = normalizeGeometry(input.readGeometry());
	const drawingSnapshot = input.drawings.map(cloneDrawing);
	const hints =
		input.buildHints?.(drawingSnapshot, geometry) ??
		buildBrowserDrawingHints(drawingSnapshot, {
			document: input.document,
			viewport: geometry.viewport,
			scroll: geometry.scroll,
			viewportOffset: geometry.viewportOffset,
			overlaySelector: input.overlaySelector
		});

	return assembleSubmissionPayload({
		url: input.url,
		images: screenshot.images,
		drawings: drawingSnapshot,
		hints,
		geometry,
		components: layoutSnapshot.components,
		removed: layoutSnapshot.removed,
		moved: layoutSnapshot.moved
	});
}

// ---------- Private helpers ----------

interface BrowserScreenshotLayoutSnapshot {
	components: BrowserSubmissionAddedComponent[];
	removed: BrowserSubmissionRemovedElement[];
	moved: BrowserSubmissionMovedElement[];
}

interface BrowserScreenshotCapture {
	images: BrowserSubmissionImageInput;
}

interface CaptureBrowserScreenshotOptions {
	readCaptureViewport: () => BrowserSubmissionViewport;
	waitForNextPaint: () => Promise<void>;
	requestDisplayMedia?: () => Promise<MediaStream>;
	createVideo?: () => HTMLVideoElement;
	createCanvas?: () => HTMLCanvasElement;
	mountCaptureAnnotations?: () => () => void;
	setToolbarHiddenForCapture?: (hidden: boolean) => void;
	setSubmitStatus?: (status: Extract<SubmitStatus, 'waiting-for-capture' | 'capturing'>) => void;
}

interface BuildBrowserDrawingHintsOptions {
	document?: Document;
	viewport: BrowserSubmissionViewport;
	scroll: BrowserSubmissionScroll;
	viewportOffset?: Partial<BrowserSubmissionViewportOffset>;
	overlaySelector?: string;
}

interface AssembleSubmissionPayloadInput {
	url: string;
	images: BrowserSubmissionImageInput;
	drawings: Drawing[];
	hints: DrawingHint[];
	geometry: BrowserSubmissionGeometry;
	components: BrowserSubmissionAddedComponent[];
	removed: BrowserSubmissionRemovedElement[];
	moved: BrowserSubmissionMovedElement[];
}

const DEFAULT_OVERLAY_SELECTOR = '[data-dryui-feedback] *';

function stripDataUrlPrefix(dataUrl: string): string {
	const comma = dataUrl.indexOf(',');
	return comma === -1 ? dataUrl : dataUrl.slice(comma + 1);
}

function drawingSpace(drawing: Drawing): DrawingSpace {
	return drawing.space ?? 'scroll';
}

function anchorPointFor(drawing: Drawing): Point | null {
	if (drawing.kind === 'freehand') return drawing.points[0] ?? null;
	if (drawing.kind === 'arrow') return drawing.end;
	return drawing.position;
}

function toViewportPoint(
	point: Point,
	space: DrawingSpace,
	geometry: BrowserSubmissionGeometry
): Point {
	if (space === 'viewport') return point;
	return {
		x: point.x - geometry.scroll.x + geometry.viewportOffset.left,
		y: point.y - geometry.scroll.y + geometry.viewportOffset.top
	};
}

function clonePoint(point: Point): Point {
	return { x: point.x, y: point.y };
}

function cloneDrawing(drawing: Drawing): Drawing {
	if (drawing.kind === 'freehand') {
		return {
			...drawing,
			points: drawing.points.map(clonePoint)
		};
	}

	if (drawing.kind === 'arrow') {
		return {
			...drawing,
			start: clonePoint(drawing.start),
			end: clonePoint(drawing.end)
		};
	}

	return {
		...drawing,
		position: clonePoint(drawing.position)
	};
}

function readDefaultDocument(): Document | undefined {
	return typeof document === 'undefined' ? undefined : document;
}

function readDefaultDisplayMedia(): (() => Promise<MediaStream>) | undefined {
	if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getDisplayMedia) {
		return undefined;
	}
	return () =>
		navigator.mediaDevices.getDisplayMedia({
			video: { displaySurface: 'browser' },
			preferCurrentTab: true
		} as DisplayMediaStreamOptions);
}

function createDefaultVideo(): HTMLVideoElement {
	if (typeof document === 'undefined') {
		throw new Error('Browser screen capture is unavailable in this context.');
	}
	return document.createElement('video');
}

function createDefaultCanvas(): HTMLCanvasElement {
	if (typeof document === 'undefined') {
		throw new Error('Browser screen capture is unavailable in this context.');
	}
	return document.createElement('canvas');
}

function stopCaptureStream(stream: MediaStream | null): void {
	if (!stream) return;
	for (const track of stream.getTracks()) {
		try {
			track.stop();
		} catch {
			// Preserve the primary capture error while still attempting every cleanup step.
		}
	}
}

function optionalArray<T>(items: T[]): T[] | undefined {
	return items.length > 0 ? items : undefined;
}

function normalizeGeometry(geometry: BrowserSubmissionGeometry): BrowserSubmissionGeometry {
	return {
		viewport: { width: geometry.viewport.width, height: geometry.viewport.height },
		scroll: { x: geometry.scroll.x, y: geometry.scroll.y },
		viewportOffset: {
			left: geometry.viewportOffset.left,
			top: geometry.viewportOffset.top
		}
	};
}

function buildBrowserDrawingHints(
	drawings: readonly Drawing[],
	options: BuildBrowserDrawingHintsOptions
): DrawingHint[] {
	const documentLike = options.document ?? readDefaultDocument();
	const viewport = {
		width: options.viewport.width,
		height: options.viewport.height
	};
	const geometry = normalizeGeometry({
		viewport,
		scroll: { x: options.scroll.x, y: options.scroll.y },
		viewportOffset: {
			left: options.viewportOffset?.left ?? 0,
			top: options.viewportOffset?.top ?? 0
		}
	});

	const overlayChildren = documentLike
		? Array.from(
				documentLike.querySelectorAll<HTMLElement | SVGElement>(
					options.overlaySelector ?? DEFAULT_OVERLAY_SELECTOR
				)
			)
		: [];
	const previousPointerEvents = overlayChildren.map((el) => el.style.pointerEvents);
	for (const el of overlayChildren) el.style.pointerEvents = 'none';

	try {
		return drawings.map((drawing) => {
			const anchor = anchorPointFor(drawing);
			const space = drawingSpace(drawing);
			const viewportPoint = anchor
				? toViewportPoint(anchor, space, geometry)
				: { x: viewport.width / 2, y: viewport.height / 2 };

			const position = describePosition(
				viewportPoint.x,
				viewportPoint.y,
				viewport.width,
				viewport.height
			);

			let element: DrawingHint['element'];
			if (anchor && documentLike) {
				const hit = documentLike.elementFromPoint(viewportPoint.x, viewportPoint.y);
				const descriptor = describeElement(hit);
				if (descriptor) element = descriptor;
			}

			return {
				...position,
				...(element ? { element } : {})
			};
		});
	} finally {
		overlayChildren.forEach((el, index) => {
			el.style.pointerEvents = previousPointerEvents[index] ?? '';
		});
	}
}

async function captureBrowserScreenshot(
	options: CaptureBrowserScreenshotOptions
): Promise<BrowserScreenshotCapture> {
	let stream: MediaStream | null = null;
	let cleanupAnnotations: (() => void) | undefined;
	const viewport = options.readCaptureViewport();
	const video = options.createVideo?.() ?? createDefaultVideo();
	const requestDisplayMedia = options.requestDisplayMedia ?? readDefaultDisplayMedia();

	try {
		if (!requestDisplayMedia) {
			throw new Error('Browser screen capture is unavailable in this context.');
		}

		options.setSubmitStatus?.('waiting-for-capture');
		options.setToolbarHiddenForCapture?.(true);
		cleanupAnnotations = options.mountCaptureAnnotations?.();
		await options.waitForNextPaint();
		await options.waitForNextPaint();

		stream = await requestDisplayMedia();

		options.setSubmitStatus?.('capturing');

		video.srcObject = stream;
		video.muted = true;
		await video.play();

		await options.waitForNextPaint();

		const canvas = options.createCanvas?.() ?? createDefaultCanvas();
		canvas.width = viewport.width;
		canvas.height = viewport.height;
		const ctx = canvas.getContext('2d');
		if (!ctx) throw new Error('Could not prepare screenshot capture.');

		ctx.drawImage(video, 0, 0, viewport.width, viewport.height);

		const webp = stripDataUrlPrefix(canvas.toDataURL('image/webp', 0.8));
		const png = stripDataUrlPrefix(canvas.toDataURL('image/png'));
		canvas.width = 0;
		canvas.height = 0;

		return { images: { webp, png } };
	} finally {
		stopCaptureStream(stream);
		video.srcObject = null;
		try {
			cleanupAnnotations?.();
		} finally {
			options.setToolbarHiddenForCapture?.(false);
		}
	}
}

function snapshotBrowserCaptureLayout(
	draft: BrowserCaptureLayoutDraft
): BrowserScreenshotLayoutSnapshot {
	return {
		components: snapshotAddedComponents(draft.added),
		removed: snapshotRemovedElements(draft.removed),
		moved: snapshotMovedElements(draft.moved)
	};
}

function snapshotAddedComponents(
	records: readonly BrowserCaptureAddedDraft[]
): BrowserSubmissionAddedComponent[] {
	const out: BrowserSubmissionAddedComponent[] = [];
	for (const record of records) {
		const rect = record.element.getBoundingClientRect();
		if (rect.width < 1 || rect.height < 1) continue;
		out.push({
			id: record.id,
			kind: record.kind,
			label: record.kind,
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

function mountBrowserCaptureAnnotations(
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

		const chip = doc.createElement('div');
		chip.dataset.dryuiCaptureAnnotation = 'chip';
		chip.textContent = `<${record.kind}>`;

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

function assembleSubmissionPayload(
	input: AssembleSubmissionPayloadInput
): BrowserCreateSubmissionPayload {
	const components = optionalArray(input.components);
	const removed = optionalArray(input.removed);
	const moved = optionalArray(input.moved);

	return {
		url: input.url,
		image: input.images,
		drawings: input.drawings,
		hints: input.hints,
		viewport: input.geometry.viewport,
		scroll: input.geometry.scroll,
		...(components ? { components } : {}),
		...(removed ? { removed } : {}),
		...(moved ? { moved } : {})
	};
}

function chipMaxWidth(viewportWidth: number, x: number, width: number): number {
	return Math.max(180, Math.min(viewportWidth - x - 8, width + 80));
}

function toSubmissionRect(rect: DOMRect): BrowserSubmissionRect {
	return { x: rect.left, y: rect.top, width: rect.width, height: rect.height };
}

function readDefaultViewportWidth(): number {
	return typeof window === 'undefined' ? 0 : window.innerWidth;
}
