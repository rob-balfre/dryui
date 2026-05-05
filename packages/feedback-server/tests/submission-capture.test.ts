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
});
