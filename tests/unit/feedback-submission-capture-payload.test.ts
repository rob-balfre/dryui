import { describe, expect, test } from 'bun:test';
import {
	buildBrowserDrawingHints,
	captureBrowserScreenshot,
	captureBrowserSubmissionPayload
} from '../../packages/feedback/src/submission-capture-payload.ts';
import type { Drawing } from '../../packages/feedback/src/types.ts';

function fakeElement(tagName: string, attrs: Record<string, string | null> = {}): Element {
	return {
		tagName,
		getAttribute(name: string): string | null {
			return attrs[name] ?? null;
		}
	} as Element;
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
