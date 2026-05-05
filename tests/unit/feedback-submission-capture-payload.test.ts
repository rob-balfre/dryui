import { describe, expect, test } from 'bun:test';
import {
	buildBrowserDrawingHints,
	captureBrowserScreenshot,
	captureBrowserSubmissionPayload
} from '../../packages/feedback/src/submission-capture-payload.ts';
import {
	snapshotBrowserCaptureLayout,
	type LayoutSnapshot
} from '../../packages/feedback/src/submission-capture-layout.ts';
import {
	canonicalFeedbackPageUrl,
	normalizeFeedbackServerUrl,
	resolveFeedbackServerUrl
} from '../../packages/feedback/src/submission-client.ts';
import {
	hasPersistableWidgetState,
	sanitizeStoredWidgetState,
	writeStoredWidgetState,
	readStoredWidgetState
} from '../../packages/feedback/src/submission-draft.ts';
import type { Drawing } from '../../packages/feedback/src/types.ts';

function fakeElement(tagName: string, attrs: Record<string, string | null> = {}): Element {
	return {
		tagName,
		getAttribute(name: string): string | null {
			return attrs[name] ?? null;
		}
	} as Element;
}

function fakeLayoutElement(options: {
	tagName?: string;
	attrs?: Record<string, string | null>;
	rect: { left: number; top: number; width: number; height: number };
	style?: Partial<CSSStyleDeclaration>;
	dataset?: Record<string, string | undefined>;
}): HTMLElement {
	const element = fakeElement(options.tagName ?? 'DIV', options.attrs) as HTMLElement;
	Object.assign(element, {
		style: {
			left: options.style?.left ?? '',
			top: options.style?.top ?? '',
			width: options.style?.width ?? '',
			height: options.style?.height ?? '',
			transform: options.style?.transform ?? ''
		},
		dataset: options.dataset ?? {},
		getBoundingClientRect: () => ({
			left: options.rect.left,
			top: options.rect.top,
			right: options.rect.left + options.rect.width,
			bottom: options.rect.top + options.rect.height,
			x: options.rect.left,
			y: options.rect.top,
			width: options.rect.width,
			height: options.rect.height
		})
	});
	return element;
}

class MemoryStorage implements Storage {
	readonly #items = new Map<string, string>();

	get length(): number {
		return this.#items.size;
	}

	clear(): void {
		this.#items.clear();
	}

	getItem(key: string): string | null {
		return this.#items.get(key) ?? null;
	}

	key(index: number): string | null {
		return Array.from(this.#items.keys())[index] ?? null;
	}

	removeItem(key: string): void {
		this.#items.delete(key);
	}

	setItem(key: string, value: string): void {
		this.#items.set(key, value);
	}
}

describe('buildBrowserDrawingHints', () => {
	test('pairs hints with drawings in order and restores overlay pointer events', () => {
		const overlayChild = { style: { pointerEvents: 'auto' } } as HTMLElement;
		const hits: Array<{ x: number; y: number; pointerEvents: string }> = [];
		const documentLike = {
			querySelectorAll(selector: string) {
				expect(selector).toBe('[data-dryui-feedback] *');
				return [overlayChild];
			},
			elementFromPoint(x: number, y: number) {
				hits.push({ x, y, pointerEvents: overlayChild.style.pointerEvents });
				return fakeElement('BUTTON', { id: 'send', class: 'primary action' });
			}
		} as unknown as Document;

		const drawings: Drawing[] = [
			{
				id: 'stroke',
				kind: 'freehand',
				color: 'red',
				width: 2,
				points: [
					{ x: 30, y: 40 },
					{ x: 36, y: 42 }
				]
			},
			{
				id: 'arrow',
				kind: 'arrow',
				color: 'blue',
				width: 3,
				space: 'viewport',
				start: { x: 10, y: 10 },
				end: { x: 180, y: 20 }
			}
		];

		const hints = buildBrowserDrawingHints(drawings, {
			document: documentLike,
			viewport: { width: 200, height: 100 },
			scroll: { x: 10, y: 20 },
			viewportOffset: { left: 5, top: 7 }
		});

		expect(hints).toEqual([
			{
				corner: 'top-left',
				percentX: 12.5,
				percentY: 27,
				element: { tag: 'button', id: 'send', selector: 'button#send.primary.action' }
			},
			{
				corner: 'top-right',
				percentX: 90,
				percentY: 20,
				element: { tag: 'button', id: 'send', selector: 'button#send.primary.action' }
			}
		]);
		expect(hits).toEqual([
			{ x: 25, y: 27, pointerEvents: 'none' },
			{ x: 180, y: 20, pointerEvents: 'none' }
		]);
		expect(overlayChild.style.pointerEvents).toBe('auto');
	});
});

describe('captureBrowserSubmissionPayload', () => {
	test('builds the exact create-submission payload without empty optional fields or agent', async () => {
		const drawings: Drawing[] = [
			{
				id: 'text',
				kind: 'text',
				color: 'orange',
				position: { x: 100, y: 50 },
				text: 'Fix this',
				fontSize: 16
			}
		];

		const payload = await captureBrowserSubmissionPayload({
			url: 'https://example.test/page',
			drawings,
			captureScreenshot: async () => ({
				images: { webp: 'webp-data', png: 'png-data' },
				components: [],
				removed: [],
				moved: []
			}),
			readGeometry: () => ({
				viewport: { width: 1000, height: 800 },
				scroll: { x: 4, y: 8 },
				viewportOffset: { left: 0, top: 0 }
			}),
			buildHints: (items) =>
				items.map((drawing) => ({
					corner: drawing.id === 'text' ? 'top-left' : 'center',
					percentX: 10,
					percentY: 6.25
				}))
		});

		expect(Object.keys(payload).sort()).toEqual([
			'drawings',
			'hints',
			'image',
			'scroll',
			'url',
			'viewport'
		]);
		expect(payload).toEqual({
			url: 'https://example.test/page',
			image: { webp: 'webp-data', png: 'png-data' },
			drawings,
			hints: [{ corner: 'top-left', percentX: 10, percentY: 6.25 }],
			viewport: { width: 1000, height: 800 },
			scroll: { x: 4, y: 8 }
		});
		expect('agent' in payload).toBe(false);
	});

	test('includes non-empty layout fields and samples one geometry for payload and hints', async () => {
		let geometryReads = 0;
		const drawings: Drawing[] = [
			{
				id: 'arrow',
				kind: 'arrow',
				color: 'orange',
				width: 3,
				start: { x: 20, y: 20 },
				end: { x: 80, y: 70 }
			}
		];

		const payload = await captureBrowserSubmissionPayload({
			url: 'https://example.test/layout',
			drawings,
			captureScreenshot: async () => ({
				images: { webp: 'webp-data', png: 'png-data' },
				components: [
					{
						id: 'component-1',
						kind: 'Button',
						rect: { x: 10, y: 20, width: 120, height: 40 }
					}
				],
				removed: [{ tag: 'nav', rect: { x: 0, y: 0, width: 80, height: 30 } }],
				moved: [
					{
						tag: 'section',
						originalRect: { x: 0, y: 0, width: 100, height: 100 },
						currentRect: { x: 20, y: 30, width: 100, height: 100 }
					}
				]
			}),
			readGeometry: () => {
				geometryReads++;
				return {
					viewport: { width: 320, height: 240 },
					scroll: { x: 12, y: 18 },
					viewportOffset: { left: 2, top: 4 }
				};
			},
			buildHints: (items, geometry) => [
				{
					corner: items[0]?.id === 'arrow' ? 'bottom-right' : 'center',
					percentX: geometry.viewport.width,
					percentY: geometry.scroll.y
				}
			]
		});

		expect(geometryReads).toBe(1);
		expect(payload.viewport).toEqual({ width: 320, height: 240 });
		expect(payload.scroll).toEqual({ x: 12, y: 18 });
		expect(payload.hints).toEqual([{ corner: 'bottom-right', percentX: 320, percentY: 18 }]);
		expect(payload.components).toEqual([
			{
				id: 'component-1',
				kind: 'Button',
				rect: { x: 10, y: 20, width: 120, height: 40 }
			}
		]);
		expect(payload.removed).toEqual([{ tag: 'nav', rect: { x: 0, y: 0, width: 80, height: 30 } }]);
		expect(payload.moved).toEqual([
			{
				tag: 'section',
				originalRect: { x: 0, y: 0, width: 100, height: 100 },
				currentRect: { x: 20, y: 30, width: 100, height: 100 }
			}
		]);
	});
});

describe('snapshotBrowserCaptureLayout', () => {
	test('turns added, removed, and changed moved drafts into submission layout fields', () => {
		const initial: LayoutSnapshot = {
			left: '0px',
			top: '0px',
			width: '100px',
			height: '60px',
			transform: '',
			rotation: undefined
		};
		const added = fakeLayoutElement({
			rect: { left: 10, top: 20, width: 120, height: 40 }
		});
		const original = fakeLayoutElement({
			tagName: 'SECTION',
			attrs: { id: 'hero', class: 'target panel' },
			rect: { left: 0, top: 0, width: 100, height: 60 }
		});
		const movedClone = fakeLayoutElement({
			rect: { left: 30, top: 44, width: 100, height: 60 },
			style: { ...initial, left: '30px', top: '44px' }
		});
		const unchangedClone = fakeLayoutElement({
			rect: { left: 0, top: 0, width: 100, height: 60 },
			style: initial
		});

		const layout = snapshotBrowserCaptureLayout({
			added: [
				{
					id: 'added-1',
					kind: 'Button',
					element: added,
					label: 'Save',
					propsJson: '{"disabled":true,"count":2}'
				}
			],
			removed: [
				{
					descriptor: { tag: 'nav', selector: 'nav.primary' },
					rect: { x: 1, y: 2, width: 3, height: 4 }
				}
			],
			moved: [
				{ original, clone: movedClone, initial },
				{ original, clone: unchangedClone, initial }
			]
		});

		expect(layout.components).toEqual([
			{
				id: 'added-1',
				kind: 'Button',
				label: 'Save',
				props: { disabled: true, count: 2 },
				rect: { x: 10, y: 20, width: 120, height: 40 }
			}
		]);
		expect(layout.removed).toEqual([
			{ tag: 'nav', selector: 'nav.primary', rect: { x: 1, y: 2, width: 3, height: 4 } }
		]);
		expect(layout.moved).toEqual([
			{
				tag: 'section',
				id: 'hero',
				selector: 'section#hero.target.panel',
				originalRect: { x: 0, y: 0, width: 100, height: 60 },
				currentRect: { x: 30, y: 44, width: 100, height: 60 }
			}
		]);
	});
});

describe('stored widget draft capture', () => {
	test('sanitizes persisted draft shape and filters non-persistable entries', () => {
		const state = sanitizeStoredWidgetState(
			{
				active: false,
				tool: 'arrow',
				mode: 'components',
				placingComponent: 'Button',
				drawings: [
					{
						id: 'note',
						kind: 'text',
						position: { x: 1, y: 2 },
						text: 'Fix',
						color: 'old',
						fontSize: 16
					}
				],
				added: [
					{
						id: 'component',
						kind: 'Button',
						snap: { left: '1px', top: '2px', width: '', height: '', transform: '' }
					},
					{ id: 'broken' }
				],
				moved: [{ descriptor: { tag: 'main' }, snap: { left: '3px', top: '4px' } }],
				removed: [{ descriptor: { tag: 'aside', selector: 'aside.panel' } }, { descriptor: {} }]
			},
			{ normalizeDrawing: (drawing) => ({ ...drawing, color: 'orange' }) }
		);

		expect(state).toEqual({
			active: false,
			tool: 'arrow',
			mode: 'components',
			placingComponent: 'Button',
			drawings: [
				expect.objectContaining({
					id: 'note',
					color: 'orange'
				})
			],
			added: [
				{
					id: 'component',
					kind: 'Button',
					snap: {
						left: '1px',
						top: '2px',
						width: '',
						height: '',
						transform: '',
						rotation: undefined
					}
				}
			],
			moved: [
				{
					descriptor: { tag: 'main' },
					snap: {
						left: '3px',
						top: '4px',
						width: '',
						height: '',
						transform: '',
						rotation: undefined
					}
				}
			],
			removed: [{ descriptor: { tag: 'aside', selector: 'aside.panel' } }]
		});
		expect(hasPersistableWidgetState({ tool: 'pencil', mode: 'annotate' })).toBe(false);
		expect(hasPersistableWidgetState(state!)).toBe(true);
	});

	test('writes and removes per-page draft state through a storage adapter', () => {
		const storage = new MemoryStorage();

		writeStoredWidgetState(
			'https://example.test/page',
			{ active: true, tool: 'pencil', mode: 'annotate' },
			{ storage }
		);

		expect(readStoredWidgetState('https://example.test/page', { storage })).toEqual({
			active: true,
			tool: 'pencil',
			mode: 'annotate'
		});

		writeStoredWidgetState('https://example.test/page', null, { storage });
		expect(readStoredWidgetState('https://example.test/page', { storage })).toBeNull();
	});
});

describe('feedback submission client helpers', () => {
	test('canonicalizes page URLs and restricts feedback server handoff hosts', () => {
		expect(
			canonicalFeedbackPageUrl(
				'https://example.test/work?dryui-feedback=1&dryui-feedback-server=http://127.0.0.1:5888&tab=settings#notes'
			)
		).toBe('https://example.test/work?tab=settings');
		expect(normalizeFeedbackServerUrl('http://127.0.0.1:5888/ui/?focus=one')).toBe(
			'http://127.0.0.1:5888'
		);
		expect(normalizeFeedbackServerUrl('https://feedback.localhost:4748/path')).toBe(
			'https://feedback.localhost:4748'
		);
		expect(normalizeFeedbackServerUrl('https://example.com:4748')).toBeNull();
	});

	test('query handoff wins over fallback and is stored for later tabs', () => {
		const localStorage = new MemoryStorage();
		const sessionStorage = new MemoryStorage();
		const resolved = resolveFeedbackServerUrl('http://127.0.0.1:4748', {
			href: 'https://example.test/page?dryui-feedback-server=http%3A%2F%2F127.0.0.1%3A5888',
			localStorage,
			sessionStorage
		});

		expect(resolved).toBe('http://127.0.0.1:5888');
		expect(localStorage.getItem('dryui-feedback-server-url')).toBe('http://127.0.0.1:5888');
		expect(
			resolveFeedbackServerUrl('http://127.0.0.1:4748', {
				href: 'https://example.test/page',
				localStorage,
				sessionStorage
			})
		).toBe('http://127.0.0.1:5888');
	});
});

describe('captureBrowserScreenshot', () => {
	test('cleans stream, capture annotations, video, and toolbar state when capture fails', async () => {
		const stopped: string[] = [];
		let cleanupCount = 0;
		let toolbarHidden = false;
		const statuses: string[] = [];
		const video = {
			srcObject: null as MediaStream | null,
			muted: false,
			play: async () => {
				throw new Error('video failed');
			}
		} as HTMLVideoElement;

		await expect(
			captureBrowserScreenshot({
				readCaptureViewport: () => ({ width: 100, height: 50 }),
				snapshotLayout: () => ({ components: [], removed: [], moved: [] }),
				waitForNextPaint: async () => {},
				requestDisplayMedia: async () =>
					({
						getTracks: () => [{ stop: () => stopped.push('track') }]
					}) as MediaStream,
				createVideo: () => video,
				createCanvas: () => {
					throw new Error('canvas should not be created');
				},
				mountCaptureAnnotations: () => {
					cleanupCount++;
					return () => cleanupCount++;
				},
				setToolbarHiddenForCapture: (hidden) => {
					toolbarHidden = hidden;
				},
				setSubmitStatus: (status) => statuses.push(status)
			})
		).rejects.toThrow('video failed');

		expect(stopped).toEqual(['track']);
		expect(video.srcObject).toBeNull();
		expect(cleanupCount).toBe(2);
		expect(toolbarHidden).toBe(false);
		expect(statuses).toEqual(['waiting-for-capture', 'capturing']);
	});
});
