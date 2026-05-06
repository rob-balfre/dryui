import { existsSync, mkdtempSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Database } from 'bun:sqlite';
import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import { SubmissionCapture } from '../src/submission-capture.ts';
import type { CreateSubmissionInput } from '../src/types.ts';

function imagePayload(tag: string): { webp: string; png: string } {
	return {
		webp: Buffer.from(`${tag}-webp`).toString('base64'),
		png: Buffer.from(`${tag}-png`).toString('base64')
	};
}

function submissionInput(overrides: Partial<CreateSubmissionInput> = {}): CreateSubmissionInput {
	return {
		url: 'https://example.com/capture',
		image: imagePayload('capture'),
		drawings: [],
		...overrides
	};
}

describe('SubmissionCapture', () => {
	let db: Database;
	let screenshotsDir: string;
	let capture: SubmissionCapture;

	beforeEach(() => {
		db = new Database(':memory:', { create: true });
		screenshotsDir = mkdtempSync(join(tmpdir(), 'dryui-submission-capture-'));
		capture = new SubmissionCapture({ db, screenshotsDir });
	});

	afterEach(() => {
		db.close();
		rmSync(screenshotsDir, { recursive: true, force: true });
	});

	test('initializes the submissions schema it owns', () => {
		capture.initSchema();

		const row = db
			.query<{ name: string }>("SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?")
			.get('submissions');

		expect(row?.name).toBe('submissions');
	});

	test('returns null for invalid capture input before writing screenshots', () => {
		capture.initSchema();

		const result = capture.create({
			...submissionInput(),
			image: { webp: Buffer.from('only-webp').toString('base64') }
		} as CreateSubmissionInput);

		const rows = db.query<{ count: number }>('SELECT COUNT(*) AS count FROM submissions').get();

		expect(result).toBeNull();
		expect(rows?.count).toBe(0);
		expect(readdirSync(screenshotsDir)).toEqual([]);
	});

	test('removes written screenshots when row persistence fails', () => {
		expect(() => capture.create(submissionInput())).toThrow();
		expect(readdirSync(screenshotsDir)).toEqual([]);
	});

	test('serializes optional storage facts while preserving capture response shape', () => {
		capture.initSchema();

		const result = capture.create(
			submissionInput({
				drawings: [
					{
						id: 'draw-1',
						kind: 'arrow',
						color: '#0f766e',
						start: { x: 10, y: 20 },
						end: { x: 30, y: 40 },
						width: 2
					}
				],
				hints: [{ corner: 'top-left', percentX: 12, percentY: 34 }],
				components: [
					{
						id: 'component-1',
						kind: 'Button',
						props: { variant: 'primary' },
						rect: { x: 1, y: 2, width: 100, height: 40 }
					}
				],
				removed: [
					{
						tag: 'section',
						id: 'removed-1',
						selector: '.legacy-card',
						rect: { x: 4, y: 8, width: 320, height: 180 }
					}
				],
				moved: [
					{
						tag: 'nav',
						id: 'moved-1',
						selector: '.toolbar',
						originalRect: { x: 1, y: 2, width: 200, height: 48 },
						currentRect: { x: 3, y: 4, width: 200, height: 48 }
					}
				],
				viewport: { width: 1280, height: 720 },
				scroll: { x: 0, y: 180 },
				agent: 'off'
			}),
			{ workspace: '/tmp/workspace' }
		);

		expect(result).toMatchObject({
			url: 'https://example.com/capture',
			drawings: [{ id: 'draw-1', kind: 'arrow' }],
			hints: [{ corner: 'top-left', percentX: 12, percentY: 34 }],
			components: [{ id: 'component-1', kind: 'Button', props: { variant: 'primary' } }],
			removed: [{ tag: 'section', id: 'removed-1', selector: '.legacy-card' }],
			moved: [{ tag: 'nav', id: 'moved-1', selector: '.toolbar' }],
			viewport: { width: 1280, height: 720 },
			scroll: { x: 0, y: 180 },
			status: 'pending',
			agent: 'off',
			workspace: '/tmp/workspace'
		});

		const row = db
			.query<{
				drawings: string;
				hints: string | null;
				components: string | null;
				removed: string | null;
				moved: string | null;
				viewport: string | null;
				scroll: string | null;
				agent: string | null;
				workspace: string | null;
			}>(
				'SELECT drawings, hints, components, removed, moved, viewport, scroll, agent, workspace FROM submissions WHERE id = ?'
			)
			.get(result?.id);

		expect(row).toEqual({
			drawings: JSON.stringify([
				{
					id: 'draw-1',
					kind: 'arrow',
					color: '#0f766e',
					start: { x: 10, y: 20 },
					end: { x: 30, y: 40 },
					width: 2
				}
			]),
			hints: JSON.stringify([{ corner: 'top-left', percentX: 12, percentY: 34 }]),
			components: JSON.stringify([
				{
					id: 'component-1',
					kind: 'Button',
					props: { variant: 'primary' },
					rect: { x: 1, y: 2, width: 100, height: 40 }
				}
			]),
			removed: JSON.stringify([
				{
					tag: 'section',
					id: 'removed-1',
					selector: '.legacy-card',
					rect: { x: 4, y: 8, width: 320, height: 180 }
				}
			]),
			moved: JSON.stringify([
				{
					tag: 'nav',
					id: 'moved-1',
					selector: '.toolbar',
					originalRect: { x: 1, y: 2, width: 200, height: 48 },
					currentRect: { x: 3, y: 4, width: 200, height: 48 }
				}
			]),
			viewport: JSON.stringify({ width: 1280, height: 720 }),
			scroll: JSON.stringify({ x: 0, y: 180 }),
			agent: 'off',
			workspace: '/tmp/workspace'
		});
	});

	test('creates presentation responses from captured submissions', () => {
		capture.initSchema();

		const presentation = capture.createPresentation(
			submissionInput({
				drawings: [
					{
						id: 'note-1',
						kind: 'text',
						color: '#0f766e',
						position: { x: 20, y: 30 },
						text: 'Tighten this copy',
						fontSize: 16
					}
				],
				hints: [{ corner: 'center', percentX: 50, percentY: 30 }]
			})
		);

		expect(presentation).toMatchObject({
			url: 'https://example.com/capture',
			status: 'pending',
			preferredScreenshotPath: expect.stringMatching(/\.png$/),
			textNotes: ['Tighten this copy'],
			summary: {
				drawingCount: 1,
				hintCount: 1,
				drawingKinds: { text: 1 },
				corners: { center: 1 }
			}
		});
		expect(presentation?.drawingHints[0]?.hint?.corner).toBe('center');
	});

	test('orders pending submissions as a queue and history by newest first', async () => {
		capture.initSchema();

		const pendingOlder = capture.create(submissionInput({ url: 'https://example.com/older' }));
		await new Promise((resolve) => setTimeout(resolve, 5));
		const pendingNewer = capture.create(submissionInput({ url: 'https://example.com/newer' }));
		await new Promise((resolve) => setTimeout(resolve, 5));
		const resolved = capture.create(submissionInput({ url: 'https://example.com/resolved' }));
		expect(resolved).not.toBeNull();
		capture.updateStatus(resolved?.id ?? '', 'resolved');

		expect(capture.listPresentations('pending').submissions.map((entry) => entry.id)).toEqual([
			pendingOlder?.id,
			pendingNewer?.id
		]);
		expect(capture.listPresentations('resolved').submissions.map((entry) => entry.id)).toEqual([
			resolved?.id
		]);
		expect(capture.listPresentations('all').submissions.map((entry) => entry.id)).toEqual([
			resolved?.id,
			pendingNewer?.id,
			pendingOlder?.id
		]);
	});

	test('updates status through presentation lifecycle reads', () => {
		capture.initSchema();
		const submission = capture.create(submissionInput());
		expect(submission).not.toBeNull();

		const presentation = capture.updateStatusPresentation(submission?.id ?? '', 'resolved');

		expect(presentation).toMatchObject({
			id: submission?.id,
			status: 'resolved',
			preferredScreenshotPath: submission?.screenshotPath.png
		});
		expect(capture.get(submission?.id ?? '')?.status).toBe('resolved');
		expect(capture.updateStatusPresentation('missing', 'resolved')).toBeNull();
	});

	test('selects screenshot paths for HTTP streaming without caller path knowledge', () => {
		capture.initSchema();
		const submission = capture.create(submissionInput());
		expect(submission).not.toBeNull();
		const id = submission?.id ?? '';

		expect(capture.selectScreenshotPath(id)).toBe(submission?.screenshotPath.webp);
		expect(capture.selectScreenshotPath(id, 'png')).toBe(submission?.screenshotPath.png);
		expect(capture.selectScreenshotPath('missing')).toBeNull();
	});

	test('deletes captured screenshots with the submission lifecycle', () => {
		capture.initSchema();
		const submission = capture.create(submissionInput());
		expect(submission).not.toBeNull();
		expect(existsSync(submission?.screenshotPath.webp ?? '')).toBe(true);
		expect(existsSync(submission?.screenshotPath.png ?? '')).toBe(true);

		const deleted = capture.delete(submission?.id ?? '');

		expect(deleted).toMatchObject({ id: submission?.id });
		expect(capture.get(submission?.id ?? '')).toBeNull();
		expect(existsSync(submission?.screenshotPath.webp ?? '')).toBe(false);
		expect(existsSync(submission?.screenshotPath.png ?? '')).toBe(false);
		expect(capture.delete(submission?.id ?? '')).toBeNull();
	});
});
