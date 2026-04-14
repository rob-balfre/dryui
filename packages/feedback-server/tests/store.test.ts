import { rmSync } from 'node:fs';
import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import { FeedbackStore } from '../src/store.ts';

describe('FeedbackStore', () => {
	let store: FeedbackStore;
	let screenshotPaths: string[];

	beforeEach(() => {
		store = new FeedbackStore(':memory:');
		screenshotPaths = [];
	});

	afterEach(() => {
		for (const path of screenshotPaths) {
			rmSync(path, { force: true });
		}
		store.close();
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
			image: Buffer.from('pending').toString('base64'),
			drawings: [{ kind: 'arrow' }]
		});
		const pendingNewer = store.createSubmission({
			url: 'https://example.com/queue/newer',
			image: Buffer.from('pending-newer').toString('base64'),
			drawings: [{ kind: 'arrow' }]
		});
		const resolved = store.createSubmission({
			url: 'https://example.com/history',
			image: Buffer.from('resolved').toString('base64'),
			drawings: [{ kind: 'text', text: 'Looks good' }]
		});

		screenshotPaths.push(
			pendingOlder.screenshotPath,
			pendingNewer.screenshotPath,
			resolved.screenshotPath
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
});
