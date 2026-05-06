import { mkdtempSync, readdirSync, rmSync } from 'node:fs';
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
});
