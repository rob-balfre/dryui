import { describe, expect, it } from 'bun:test';
import { EventEmitter } from 'node:events';
import { createStudioGateway } from '../../../packages/studio-server/src/ws-gateway.js';
import type { PtyManager } from '../../../packages/studio-server/src/pty-manager.js';

interface SentMessage {
	type: string;
	[key: string]: unknown;
}

function makeConnection() {
	const sent: SentMessage[] = [];
	return {
		id: 'client-1',
		sent,
		send(message: SentMessage) {
			sent.push(message);
		},
		close() {}
	};
}

function createFakePty(): PtyManager {
	const emitter = new EventEmitter();

	return Object.assign(emitter, {
		running: false,
		start() {
			emitter.emit('data', { chunk: 'hello from pty' });
			emitter.emit('exit', { code: 0, signal: null });
		},
		write(_input: string) {},
		resize(_columns: number, _rows: number) {},
		stop() {}
	}) as PtyManager;
}

describe('createStudioGateway', () => {
	it('routes commands and PTY output', () => {
		const gateway = createStudioGateway({
			createPty: () => createFakePty()
		});
		const connection = makeConnection();
		const sessionId = gateway.connect(connection);

		gateway.handleMessage(
			connection.id,
			JSON.stringify({ type: 'command', command: { type: 'select-node', nodeId: 'node-1' } })
		);
		gateway.handleMessage(connection.id, JSON.stringify({ type: 'attach-pty', sessionId }));

		expect(connection.sent[0]).toMatchObject({ type: 'welcome' });
		expect(connection.sent.some((message) => message.type === 'command-applied')).toBe(true);
		expect(connection.sent.some((message) => message.type === 'pty-output')).toBe(true);
		expect(connection.sent.some((message) => message.type === 'pty-exit')).toBe(true);
	});
});
