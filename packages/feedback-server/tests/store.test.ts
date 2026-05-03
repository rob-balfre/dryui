import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import { FeedbackStore } from '../src/store.ts';
import type { SubmissionDrawing } from '../src/types.ts';

function drawingArrow(id = 'a1'): SubmissionDrawing {
	return {
		id,
		kind: 'arrow',
		color: 'hsl(25 100% 55%)',
		start: { x: 100, y: 100 },
		end: { x: 200, y: 150 },
		width: 3
	};
}

function drawingText(id = 't1', text = 'Looks good'): SubmissionDrawing {
	return {
		id,
		kind: 'text',
		color: 'hsl(25 100% 55%)',
		position: { x: 50, y: 60 },
		text,
		fontSize: 16
	};
}

function imagePayload(tag: string): { webp: string; png: string } {
	return {
		webp: Buffer.from(`${tag}-webp`).toString('base64'),
		png: Buffer.from(`${tag}-png`).toString('base64')
	};
}

describe('FeedbackStore', () => {
	let store: FeedbackStore;
	let screenshotsDir: string;
	let screenshotPaths: string[];

	beforeEach(() => {
		screenshotsDir = mkdtempSync(join(tmpdir(), 'dryui-feedback-store-'));
		store = new FeedbackStore({ dbPath: ':memory:', screenshotsDir });
		screenshotPaths = [];
	});

	afterEach(() => {
		for (const path of screenshotPaths) {
			rmSync(path, { force: true });
		}
		store.close();
		rmSync(screenshotsDir, { recursive: true, force: true });
	});

	test('creates sessions and annotations with persisted contract fields', () => {
		const session = store.createSession({ url: 'https://example.com/products/1' });
		const annotation = store.createAnnotation(session.id, {
			x: 25,
			y: 180,
			comment: 'Tighten the spacing in this block.',
			element: 'section "Product summary"',
			elementPath: 'main > section:nth-of-type(1)',
			timestamp: 123,
			status: 'failed',
			intent: 'fix',
			severity: 'important',
			color: 'warning',
			resolutionNote: 'Previous fix regressed on mobile.'
		});

		const saved = store.getAnnotation(annotation.id);

		expect(saved).not.toBeNull();
		expect(saved).toMatchObject({
			id: annotation.id,
			sessionId: session.id,
			status: 'failed',
			color: 'warning',
			resolutionNote: 'Previous fix regressed on mobile.',
			isFixed: false
		});
	});

	test('updates annotations, filters pending items, and appends thread messages', () => {
		const session = store.createSession({ url: 'https://example.com/dashboard' });
		const pending = store.createAnnotation(session.id, {
			x: 50,
			y: 240,
			comment: 'Increase contrast here.',
			element: 'button "Save"',
			elementPath: 'main button',
			timestamp: 1,
			color: 'brand',
			isFixed: false
		});
		const resolved = store.createAnnotation(session.id, {
			x: 52,
			y: 300,
			comment: 'This is already done.',
			element: 'input "Email"',
			elementPath: 'main form input',
			timestamp: 2,
			color: 'success',
			isFixed: true,
			status: 'resolved'
		});

		const updated = store.updateAnnotation(pending.id, {
			status: 'acknowledged',
			color: 'info',
			resolutionNote: 'Queued for next pass.'
		});
		const threaded = store.addThreadMessage(resolved.id, {
			role: 'agent',
			content: 'Confirmed in the updated build.'
		});

		expect(updated).not.toBeNull();
		expect(updated).toMatchObject({
			id: pending.id,
			status: 'acknowledged',
			color: 'info',
			resolutionNote: 'Queued for next pass.'
		});

		expect(store.getPending(session.id).map((annotation) => annotation.id)).toEqual([]);
		expect(threaded?.thread).toHaveLength(1);
		expect(threaded?.thread?.[0]).toMatchObject({
			role: 'agent',
			content: 'Confirmed in the updated build.'
		});
	});

	test('lists submissions across queue and history filters', () => {
		const pendingOlder = store.createSubmission({
			url: 'https://example.com/queue/older',
			image: imagePayload('pending'),
			drawings: [drawingArrow('pending-older')]
		});
		const pendingNewer = store.createSubmission({
			url: 'https://example.com/queue/newer',
			image: imagePayload('pending-newer'),
			drawings: [drawingArrow('pending-newer')]
		});
		const resolved = store.createSubmission({
			url: 'https://example.com/history',
			image: imagePayload('resolved'),
			drawings: [drawingText('resolved-text', 'Looks good')]
		});

		screenshotPaths.push(
			pendingOlder.screenshotPath.webp,
			pendingOlder.screenshotPath.png,
			pendingNewer.screenshotPath.webp,
			pendingNewer.screenshotPath.png,
			resolved.screenshotPath.webp,
			resolved.screenshotPath.png
		);
		store.updateSubmissionStatus(resolved.id, 'resolved');

		expect(store.listSubmissions('pending').map((submission) => submission.id)).toEqual([
			pendingOlder.id,
			pendingNewer.id
		]);
		expect(store.listSubmissions('resolved').map((submission) => submission.id)).toEqual([
			resolved.id
		]);
		expect(
			store
				.listSubmissions('all')
				.map((submission) => submission.id)
				.sort()
		).toEqual([pendingOlder.id, pendingNewer.id, resolved.id].sort());
	});

	test('deletes submissions and captured screenshots', () => {
		const submission = store.createSubmission({
			url: 'https://example.com/delete-me',
			image: imagePayload('delete-me'),
			drawings: [drawingText('delete-text', 'Remove this one')]
		});

		screenshotPaths.push(submission.screenshotPath.webp, submission.screenshotPath.png);
		expect(existsSync(submission.screenshotPath.webp)).toBe(true);
		expect(existsSync(submission.screenshotPath.png)).toBe(true);

		const deleted = store.deleteSubmission(submission.id);

		expect(deleted).toMatchObject({ id: submission.id });
		expect(store.getSubmission(submission.id)).toBeNull();
		expect(store.listSubmissions('all').map((entry) => entry.id)).not.toContain(submission.id);
		expect(existsSync(submission.screenshotPath.webp)).toBe(false);
		expect(existsSync(submission.screenshotPath.png)).toBe(false);
		expect(store.deleteSubmission(submission.id)).toBeNull();
	});

	test('persists dual screenshot paths, hints, and scroll offset', () => {
		const submission = store.createSubmission({
			url: 'https://example.com/hints',
			image: imagePayload('hints'),
			drawings: [drawingArrow('arrow-1'), drawingText('text-1', 'Fix spacing')],
			hints: [
				{
					corner: 'top-right',
					percentX: 96.4,
					percentY: 2.3,
					element: { tag: 'button', id: 'nav-close', selector: 'button#nav-close' }
				},
				{
					corner: 'center',
					percentX: 50,
					percentY: 50
				}
			],
			viewport: { width: 2560, height: 1440 },
			scroll: { x: 0, y: 420 }
		});

		screenshotPaths.push(submission.screenshotPath.webp, submission.screenshotPath.png);

		const saved = store.getSubmission(submission.id);
		expect(saved).not.toBeNull();
		expect(saved?.screenshotPath.webp).toMatch(/\.webp$/);
		expect(saved?.screenshotPath.png).toMatch(/\.png$/);
		expect(saved?.hints).toEqual([
			{
				corner: 'top-right',
				percentX: 96.4,
				percentY: 2.3,
				element: { tag: 'button', id: 'nav-close', selector: 'button#nav-close' }
			},
			{
				corner: 'center',
				percentX: 50,
				percentY: 50
			}
		]);
		expect(saved?.scroll).toEqual({ x: 0, y: 420 });
		expect(saved?.drawings).toHaveLength(2);
	});
});
