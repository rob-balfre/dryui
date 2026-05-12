import { describe, expect, test } from 'bun:test';
import {
	captureSubmission,
	type BrowserCaptureLayoutDraft
} from '../../packages/feedback/src/submission-capture.ts';
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

interface FakeScreenshotResources {
	stopped: string[];
	statuses: string[];
	canvas: HTMLCanvasElement;
	video: HTMLVideoElement;
	stream: MediaStream;
}

function fakeScreenshotResources(options: { videoFails?: boolean } = {}): FakeScreenshotResources {
	const stopped: string[] = [];
	const statuses: string[] = [];
	const stream = {
		getTracks: () => [{ stop: () => stopped.push('track') }]
	} as unknown as MediaStream;

	const video = {
		srcObject: null as MediaStream | null,
		muted: false,
		play: async () => {
			if (options.videoFails) throw new Error('video failed');
		}
	} as HTMLVideoElement;

	const canvas = {
		width: 0,
		height: 0,
		getContext(kind: string) {
			expect(kind).toBe('2d');
			return {
				drawImage(_v: unknown, _x: number, _y: number, _w: number, _h: number) {}
			} as unknown as CanvasRenderingContext2D;
		},
		toDataURL(mime: string) {
			return mime === 'image/webp'
				? 'data:image/webp;base64,webp-data'
				: 'data:image/png;base64,png-data';
		}
	} as unknown as HTMLCanvasElement;

	return { stopped, statuses, canvas, video, stream };
}

describe('captureSubmission', () => {
	test('orders the lifecycle: snapshot layout, mount annotations, screenshot, then assemble payload', async () => {
		const order: string[] = [];
		const annotations: string[] = [];
		const fakeDoc = {
			body: { appendChild: (_: unknown) => {} },
			createElement: () => {
				const el = {
					dataset: {} as Record<string, string>,
					style: {} as Record<string, string>,
					textContent: '',
					remove: () => {}
				} as unknown as HTMLElement;
				return el;
			}
		} as unknown as Document;

		const layoutDraft: BrowserCaptureLayoutDraft = {
			added: [
				{
					id: 'add-1',
					kind: 'Button',
					label: 'Save changes',
					element: fakeLayoutElement({ rect: { left: 5, top: 5, width: 50, height: 20 } })
				}
			],
			removed: [
				{
					descriptor: { tag: 'nav', selector: 'nav.primary' },
					rect: { x: 1, y: 2, width: 3, height: 4 }
				}
			],
			moved: []
		};

		const resources = fakeScreenshotResources();

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

		let geometryReads = 0;

		const payload = await captureSubmission({
			url: 'https://example.test/lifecycle',
			drawings,
			layoutDraft,
			readCaptureViewport: () => {
				order.push('readCaptureViewport');
				return { width: 200, height: 100 };
			},
			readGeometry: () => {
				geometryReads++;
				order.push('readGeometry');
				return {
					viewport: { width: 320, height: 240 },
					scroll: { x: 12, y: 18 },
					viewportOffset: { left: 2, top: 4 }
				};
			},
			waitForNextPaint: async () => {
				order.push('waitForNextPaint');
			},
			document: fakeDoc,
			requestDisplayMedia: async () => {
				order.push('requestDisplayMedia');
				return resources.stream;
			},
			createVideo: () => {
				order.push('createVideo');
				return resources.video;
			},
			createCanvas: () => {
				order.push('createCanvas');
				return resources.canvas;
			},
			setSubmitStatus: (status) => {
				resources.statuses.push(status);
				order.push(`status:${status}`);
			},
			setToolbarHiddenForCapture: (hidden) => {
				order.push(`toolbar:${hidden}`);
			},
			buildHints: (items, geometry) => {
				order.push('buildHints');
				annotations.push(items[0]?.id ?? '');
				return [
					{
						corner: items[0]?.id === 'arrow' ? 'bottom-right' : 'center',
						percentX: geometry.viewport.width,
						percentY: geometry.scroll.y
					}
				];
			}
		});

		// Lifecycle order: status set before screenshot, then 'uploading' set after.
		expect(order[0]).toBe('readCaptureViewport');
		expect(order).toContain('createVideo');
		expect(order).toContain('status:waiting-for-capture');
		expect(order).toContain('status:capturing');
		expect(order.indexOf('status:uploading')).toBeGreaterThan(order.indexOf('status:capturing'));
		expect(order.indexOf('readGeometry')).toBeGreaterThan(order.indexOf('status:uploading'));
		expect(order.indexOf('buildHints')).toBeGreaterThan(order.indexOf('readGeometry'));

		// Toolbar is hidden before screen capture and restored before status moves to 'uploading'.
		expect(order.indexOf('toolbar:true')).toBeGreaterThanOrEqual(0);
		expect(order.indexOf('toolbar:false')).toBeGreaterThan(order.indexOf('toolbar:true'));
		expect(order.indexOf('toolbar:false')).toBeLessThan(order.indexOf('status:uploading'));

		// Geometry sampled exactly once for both payload and hints.
		expect(geometryReads).toBe(1);
		expect(annotations).toEqual(['arrow']);

		// Resources cleaned up.
		expect(resources.stopped).toEqual(['track']);
		expect(resources.video.srcObject).toBeNull();

		// Submission contract: payload shape and field set.
		expect(Object.keys(payload).sort()).toEqual([
			'components',
			'drawings',
			'hints',
			'image',
			'removed',
			'scroll',
			'url',
			'viewport'
		]);
		expect(payload.url).toBe('https://example.test/lifecycle');
		expect(payload.image).toEqual({ webp: 'webp-data', png: 'png-data' });
		expect(payload.viewport).toEqual({ width: 320, height: 240 });
		expect(payload.scroll).toEqual({ x: 12, y: 18 });
		expect(payload.hints).toEqual([{ corner: 'bottom-right', percentX: 320, percentY: 18 }]);
		expect(payload.components).toEqual([
			{
				id: 'add-1',
				kind: 'Button',
				label: 'Save changes',
				rect: { x: 5, y: 5, width: 50, height: 20 }
			}
		]);
		expect(payload.removed).toEqual([
			{ tag: 'nav', selector: 'nav.primary', rect: { x: 1, y: 2, width: 3, height: 4 } }
		]);
		expect(payload.drawings).toEqual(drawings);
		expect('agent' in payload).toBe(false);
		expect('moved' in payload).toBe(false);
	});

	test('omits empty optional fields when no layout changes are present', async () => {
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

		const resources = fakeScreenshotResources();

		const payload = await captureSubmission({
			url: 'https://example.test/page',
			drawings,
			layoutDraft: { added: [], removed: [], moved: [] },
			readCaptureViewport: () => ({ width: 1000, height: 800 }),
			readGeometry: () => ({
				viewport: { width: 1000, height: 800 },
				scroll: { x: 4, y: 8 },
				viewportOffset: { left: 0, top: 0 }
			}),
			waitForNextPaint: async () => {},
			requestDisplayMedia: async () => resources.stream,
			createVideo: () => resources.video,
			createCanvas: () => resources.canvas,
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
		expect(payload.image).toEqual({ webp: 'webp-data', png: 'png-data' });
		expect(payload.hints).toEqual([{ corner: 'top-left', percentX: 10, percentY: 6.25 }]);
		expect('agent' in payload).toBe(false);
	});

	test('cleans stream, capture annotations, video, and toolbar state when capture fails', async () => {
		const resources = fakeScreenshotResources({ videoFails: true });
		let cleanupCount = 0;
		let toolbarHidden = false;

		await expect(
			captureSubmission({
				url: 'https://example.test/fail',
				drawings: [],
				layoutDraft: {
					added: [],
					removed: [
						{
							descriptor: { tag: 'aside' },
							// Real document is unavailable in bun:test, so a non-zero rect still drives
							// the annotation mount path; cleanup is tested via the increment below.
							rect: { x: 0, y: 0, width: 50, height: 20 }
						}
					],
					moved: []
				},
				readCaptureViewport: () => ({ width: 100, height: 50 }),
				readGeometry: () => ({
					viewport: { width: 100, height: 50 },
					scroll: { x: 0, y: 0 },
					viewportOffset: { left: 0, top: 0 }
				}),
				waitForNextPaint: async () => {},
				requestDisplayMedia: async () => resources.stream,
				createVideo: () => resources.video,
				createCanvas: () => {
					throw new Error('canvas should not be created');
				},
				// Override the default annotation mount with a counting probe so we can
				// confirm cleanup runs even when the inner capture fails.
				document: {
					body: {
						appendChild() {
							cleanupCount++;
						}
					},
					createElement: () => ({
						dataset: {},
						style: {},
						textContent: '',
						remove: () => {
							cleanupCount--;
						}
					})
				} as unknown as Document,
				setToolbarHiddenForCapture: (hidden) => {
					toolbarHidden = hidden;
				},
				setSubmitStatus: (status) => resources.statuses.push(status)
			})
		).rejects.toThrow('video failed');

		expect(resources.stopped).toEqual(['track']);
		expect(resources.video.srcObject).toBeNull();
		expect(toolbarHidden).toBe(false);
		expect(resources.statuses).toEqual(['waiting-for-capture', 'capturing']);
		// All annotation nodes that were appended are also removed during cleanup.
		expect(cleanupCount).toBe(0);
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
						label: 'Persisted button',
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
					label: 'Persisted button',
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

	test('query handoff wins over a configured server and is stored for later tabs', () => {
		const localStorage = new MemoryStorage();
		const sessionStorage = new MemoryStorage();
		const resolved = resolveFeedbackServerUrl('http://127.0.0.1:4748', {
			href: 'https://example.test/page?dryui-feedback-server=http%3A%2F%2F127.0.0.1%3A5888',
			localStorage,
			sessionStorage
		});

		expect(resolved).toBe('http://127.0.0.1:5888');
		expect(localStorage.getItem('dryui-feedback-server-url')).toBe('http://127.0.0.1:5888');
	});

	test('configured server wins over a stored handoff so an explicit prop is authoritative', () => {
		const localStorage = new MemoryStorage();
		const sessionStorage = new MemoryStorage();
		localStorage.setItem('dryui-feedback-server-url', 'http://127.0.0.1:5888');

		expect(
			resolveFeedbackServerUrl('http://127.0.0.1:4748', {
				href: 'https://example.test/page',
				localStorage,
				sessionStorage
			})
		).toBe('http://127.0.0.1:4748');
	});

	test('stored handoff wins over a configured default for feedback-launched tabs', () => {
		const localStorage = new MemoryStorage();
		const sessionStorage = new MemoryStorage();
		localStorage.setItem('dryui-feedback-server-url', 'http://127.0.0.1:5888');

		expect(
			resolveFeedbackServerUrl('http://127.0.0.1:4748', {
				href: 'https://example.test/page?dryui-feedback=1',
				localStorage,
				sessionStorage
			})
		).toBe('http://127.0.0.1:5888');
	});

	test('stored handoff is used when no server is configured', () => {
		const localStorage = new MemoryStorage();
		const sessionStorage = new MemoryStorage();
		localStorage.setItem('dryui-feedback-server-url', 'http://127.0.0.1:5888');

		expect(
			resolveFeedbackServerUrl(undefined, {
				href: 'https://example.test/page',
				localStorage,
				sessionStorage
			})
		).toBe('http://127.0.0.1:5888');
	});
});
