import {
	describeElement,
	describePosition,
	type DrawingHint,
	type ElementDescriptor
} from './position-hints.js';
import type { Drawing, DrawingSpace, Point, SubmitStatus } from './types.js';

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
	props?: Record<string, unknown>;
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

export interface BrowserScreenshotLayoutSnapshot {
	components: BrowserSubmissionAddedComponent[];
	removed: BrowserSubmissionRemovedElement[];
	moved: BrowserSubmissionMovedElement[];
}

export interface BrowserScreenshotCapture extends BrowserScreenshotLayoutSnapshot {
	images: BrowserSubmissionImageInput;
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

export interface BuildBrowserDrawingHintsOptions {
	document?: Document;
	viewport: BrowserSubmissionViewport;
	scroll: BrowserSubmissionScroll;
	viewportOffset?: Partial<BrowserSubmissionViewportOffset>;
	overlaySelector?: string;
}

export interface CaptureBrowserScreenshotOptions {
	readCaptureViewport: () => BrowserSubmissionViewport;
	snapshotLayout: () => BrowserScreenshotLayoutSnapshot;
	waitForNextPaint: () => Promise<void>;
	requestDisplayMedia?: () => Promise<MediaStream>;
	createVideo?: () => HTMLVideoElement;
	createCanvas?: () => HTMLCanvasElement;
	mountCaptureAnnotations?: () => () => void;
	setToolbarHiddenForCapture?: (hidden: boolean) => void;
	setSubmitStatus?: (status: Extract<SubmitStatus, 'waiting-for-capture' | 'capturing'>) => void;
}

export interface CaptureBrowserSubmissionPayloadOptions {
	url: string;
	drawings: readonly Drawing[];
	captureScreenshot: () => Promise<BrowserScreenshotCapture>;
	readGeometry: () => BrowserSubmissionGeometry;
	buildHints?: (drawings: Drawing[], geometry: BrowserSubmissionGeometry) => DrawingHint[];
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

export function buildBrowserDrawingHints(
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

export async function captureBrowserScreenshot(
	options: CaptureBrowserScreenshotOptions
): Promise<BrowserScreenshotCapture> {
	let stream: MediaStream | null = null;
	let cleanupAnnotations: (() => void) | undefined;
	const layoutSnapshot = options.snapshotLayout();
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

		return {
			images: { webp, png },
			...layoutSnapshot
		};
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

export async function captureBrowserSubmissionPayload(
	options: CaptureBrowserSubmissionPayloadOptions
): Promise<BrowserCreateSubmissionPayload> {
	const capture = await options.captureScreenshot();
	const geometry = normalizeGeometry(options.readGeometry());
	const drawingSnapshot = options.drawings.map(cloneDrawing);
	const hints =
		options.buildHints?.(drawingSnapshot, geometry) ??
		buildBrowserDrawingHints(drawingSnapshot, {
			viewport: geometry.viewport,
			scroll: geometry.scroll,
			viewportOffset: geometry.viewportOffset
		});
	const components = optionalArray(capture.components);
	const removed = optionalArray(capture.removed);
	const moved = optionalArray(capture.moved);

	const payload: BrowserCreateSubmissionPayload = {
		url: options.url,
		image: capture.images,
		drawings: drawingSnapshot,
		hints,
		viewport: geometry.viewport,
		scroll: geometry.scroll,
		...(components ? { components } : {}),
		...(removed ? { removed } : {}),
		...(moved ? { moved } : {})
	};

	return payload;
}
