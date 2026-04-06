import { describe, expect, test } from 'bun:test';
import { EventEmitter } from 'node:events';
import { buildPromptRequest, renderPromptOutput } from './prompt.js';
import { createStudioGateway } from './ws-gateway.js';
import { encodeStudioMessage } from './protocol.js';
import type { PtyManager } from './pty-manager.js';

function parseFence(output: string): unknown[] {
	const match = output.match(/```json\n([\s\S]*?)\n```/);
	expect(match).not.toBeNull();
	return JSON.parse(match?.[1] ?? '[]') as unknown[];
}

describe('prompt flow', () => {
	test('renders fenced JSON command output', () => {
		const output = renderPromptOutput(buildPromptRequest('session-1', 'add a Card', undefined));
		expect(output.startsWith('```json')).toBe(true);
		expect(parseFence(output)).toEqual([expect.objectContaining({ type: 'insert-node' })]);
	});

	test('streams prompt PTY output through the websocket gateway', () => {
		const pty = new EventEmitter() as PtyManager;
		let started = false;
		let written = '';
		let stopped = false;

		pty.start = () => {
			started = true;
		};
		pty.write = (input: string) => {
			written += input;
		};
		pty.stop = () => {
			stopped = true;
		};
		pty.resize = () => {};

		const gateway = createStudioGateway({
			createPromptPty: () => pty
		});

		const messages: unknown[] = [];
		const connectionId = 'conn-1';
		gateway.connect(
			{
				id: connectionId,
				send(message) {
					messages.push(message);
				},
				close() {}
			},
			undefined
		);

		const sessionId = (messages[0] as { sessionId: string }).sessionId;
		messages.length = 0;

		gateway.handleMessage(
			connectionId,
			encodeStudioMessage({ type: 'prompt', text: 'add a Card' })
		);

		expect(started).toBe(true);
		expect(written).toContain('add a Card');

		pty.emit('data', { chunk: '```json\n', stream: 'stdout' });
		pty.emit('data', { chunk: '[]\n', stream: 'stdout' });
		pty.emit('data', { chunk: '```\n', stream: 'stdout' });
		pty.emit('exit', { code: 0, signal: null });

		expect(messages).toContainEqual({ type: 'pty-output', sessionId, chunk: '```json\n' });
		expect(messages).toContainEqual({ type: 'pty-output', sessionId, chunk: '[]\n' });
		expect(messages).toContainEqual({ type: 'pty-output', sessionId, chunk: '```\n' });
		expect(messages).toContainEqual({ type: 'pty-exit', sessionId, code: 0, signal: null });
		expect(messages).not.toContainEqual(expect.objectContaining({ type: 'command-applied' }));
		expect(stopped).toBe(false);
	});
});
