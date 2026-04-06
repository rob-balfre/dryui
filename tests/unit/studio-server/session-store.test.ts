import { describe, expect, it } from 'bun:test';
import { createStudioSessionStore } from '../../../packages/studio-server/src/session-store.js';

describe('StudioSessionStore', () => {
	it('creates, updates, snapshots, and closes sessions', () => {
		const store = createStudioSessionStore();
		const created = store.createSession({
			id: 'session-1',
			clientId: 'client-1',
			metadata: { source: 'test' }
		});

		expect(created.id).toBe('session-1');
		expect(store.getSession('session-1')?.clientId).toBe('client-1');

		store.attachPty('session-1');
		store.recordCommand('session-1', { type: 'select-node', nodeId: 'node-1' });
		const snapshot = store.snapshot('session-1');

		expect(snapshot?.attachedPty).toBe(true);
		expect(snapshot?.commandCount).toBe(1);
		expect(snapshot?.metadata).toEqual({ source: 'test' });

		store.closeSession('session-1');
		expect(store.getSession('session-1')?.status).toBe('closed');
	});
});
