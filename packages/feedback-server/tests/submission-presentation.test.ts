import { describe, expect, test } from 'bun:test';
import {
	buildSubmissionPresentation,
	getSubmissionTextNotes
} from '../src/submission-presentation.ts';
import type { Submission, SubmissionDrawing } from '../src/types.ts';

function createSubmission(overrides: Partial<Submission> = {}): Submission {
	return {
		id: 'submission-1',
		url: 'https://example.com/page',
		screenshotPath: {
			webp: '/tmp/submission-1.webp',
			png: '/tmp/submission-1.png'
		},
		drawings: [],
		viewport: { width: 1440, height: 900 },
		scroll: { x: 0, y: 320 },
		status: 'pending',
		createdAt: '2026-05-05T00:00:00.000Z',
		...overrides
	};
}

describe('submission presentation', () => {
	test('prefers the PNG screenshot path and falls back to WebP for legacy submissions', () => {
		const modern = buildSubmissionPresentation(
			createSubmission({
				screenshotPath: {
					webp: '/tmp/modern.webp',
					png: '/tmp/modern.png'
				}
			})
		);
		const legacy = buildSubmissionPresentation(
			createSubmission({
				screenshotPath: {
					webp: '/tmp/legacy.webp',
					png: ''
				}
			})
		);

		expect(modern.screenshotPath).toEqual({
			webp: '/tmp/modern.webp',
			png: '/tmp/modern.png'
		});
		expect(modern.preferredScreenshotPath).toBe('/tmp/modern.png');
		expect(legacy.screenshotPath).toEqual({
			webp: '/tmp/legacy.webp',
			png: ''
		});
		expect(legacy.preferredScreenshotPath).toBe('/tmp/legacy.webp');
	});

	test('preserves raw arrays while adding drawing-to-hint pairs', () => {
		const drawings: SubmissionDrawing[] = [
			{
				id: 'arrow-1',
				kind: 'arrow',
				color: 'hsl(25 100% 55%)',
				start: { x: 100, y: 120 },
				end: { x: 240, y: 180 },
				width: 3
			},
			{
				id: 'text-1',
				kind: 'text',
				color: 'hsl(25 100% 55%)',
				position: { x: 260, y: 190 },
				text: 'Tighten this heading',
				fontSize: 16
			}
		];
		const hints: Submission['hints'] = [
			{
				corner: 'center',
				percentX: 52.5,
				percentY: 18.1,
				element: { tag: 'h1', selector: 'main h1' }
			},
			{
				corner: 'top-right',
				percentX: 91.2,
				percentY: 7.4,
				element: { tag: 'button', id: 'close', selector: 'button#close' }
			}
		];
		const components: Submission['components'] = [
			{
				id: 'component-1',
				kind: 'button',
				label: 'Save',
				rect: { x: 10, y: 20, width: 120, height: 40 }
			}
		];
		const removed: Submission['removed'] = [
			{
				tag: 'aside',
				selector: 'aside.notice',
				rect: { x: 20, y: 40, width: 280, height: 160 }
			}
		];
		const moved: Submission['moved'] = [
			{
				tag: 'section',
				selector: 'section.hero',
				originalRect: { x: 0, y: 100, width: 640, height: 220 },
				currentRect: { x: 120, y: 160, width: 640, height: 220 }
			}
		];

		const presentation = buildSubmissionPresentation(
			createSubmission({ drawings, hints, components, removed, moved })
		);

		expect(presentation.drawings).toBe(drawings);
		expect(presentation.hints).toBe(hints);
		expect(presentation.components).toBe(components);
		expect(presentation.removed).toBe(removed);
		expect(presentation.moved).toBe(moved);
		expect(presentation.drawingHints).toEqual([
			{ drawing: drawings[0], hint: hints[0] },
			{ drawing: drawings[1], hint: hints[1] }
		]);
	});

	test('counts drawing kinds, hint corners, components, removed elements, and moved elements', () => {
		const presentation = buildSubmissionPresentation(
			createSubmission({
				drawings: [
					{
						id: 'arrow-1',
						kind: 'arrow',
						color: '#f60',
						start: { x: 0, y: 0 },
						end: { x: 10, y: 10 },
						width: 2
					},
					{
						id: 'arrow-2',
						kind: 'arrow',
						color: '#f60',
						start: { x: 10, y: 10 },
						end: { x: 20, y: 20 },
						width: 2
					},
					{
						id: 'freehand-1',
						kind: 'freehand',
						color: '#f60',
						points: [
							{ x: 1, y: 1 },
							{ x: 2, y: 2 }
						],
						width: 4
					},
					{
						id: 'text-1',
						kind: 'text',
						color: '#f60',
						position: { x: 20, y: 20 },
						text: 'Make this clearer',
						fontSize: 14
					},
					{
						id: 'legacy-1',
						color: '#f60'
					} as SubmissionDrawing
				],
				hints: [
					{ corner: 'center', percentX: 50, percentY: 50 },
					{ corner: 'center', percentX: 51, percentY: 49 },
					{ corner: 'bottom-left', percentX: 8, percentY: 92 }
				],
				components: [
					{
						id: 'component-1',
						kind: 'button',
						rect: { x: 0, y: 0, width: 100, height: 32 }
					},
					{
						id: 'component-2',
						kind: 'button',
						rect: { x: 0, y: 40, width: 100, height: 32 }
					},
					{
						id: 'component-3',
						kind: 'card',
						rect: { x: 0, y: 80, width: 240, height: 160 }
					}
				],
				removed: [
					{
						tag: 'nav',
						selector: 'nav.secondary',
						rect: { x: 0, y: 0, width: 200, height: 40 }
					}
				],
				moved: [
					{
						tag: 'article',
						selector: 'article.summary',
						originalRect: { x: 10, y: 10, width: 300, height: 120 },
						currentRect: { x: 40, y: 80, width: 300, height: 120 }
					},
					{
						tag: 'footer',
						selector: 'footer',
						originalRect: { x: 0, y: 700, width: 900, height: 80 },
						currentRect: { x: 0, y: 620, width: 900, height: 80 }
					}
				]
			})
		);

		expect(presentation.summary).toEqual({
			drawingCount: 5,
			hintCount: 3,
			drawingKinds: { arrow: 2, freehand: 1, text: 1, unknown: 1 },
			corners: { center: 2, 'bottom-left': 1 },
			componentCount: 3,
			componentKinds: { button: 2, card: 1 },
			removedCount: 1,
			movedCount: 2
		});
	});

	test('extracts text notes from a submission or a drawing array', () => {
		const drawings: SubmissionDrawing[] = [
			{
				id: 'empty-text',
				kind: 'text',
				color: '#f60',
				position: { x: 10, y: 10 },
				text: '',
				fontSize: 14
			},
			{
				id: 'arrow-1',
				kind: 'arrow',
				color: '#f60',
				start: { x: 0, y: 0 },
				end: { x: 10, y: 10 },
				width: 2
			},
			{
				id: 'note-1',
				kind: 'text',
				color: '#f60',
				position: { x: 20, y: 20 },
				text: 'Add more contrast',
				fontSize: 14
			},
			{
				id: 'note-2',
				kind: 'text',
				color: '#f60',
				position: { x: 30, y: 30 },
				text: 'Move this below the chart',
				fontSize: 14
			}
		];

		expect(getSubmissionTextNotes(drawings)).toEqual([
			'Add more contrast',
			'Move this below the chart'
		]);
		expect(getSubmissionTextNotes(createSubmission({ drawings }))).toEqual([
			'Add more contrast',
			'Move this below the chart'
		]);
	});
});
