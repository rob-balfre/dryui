import { describe, expect, it } from 'bun:test';
import {
	encodeStudioMessage,
	decodeStudioMessage
} from '../../../packages/studio-server/src/protocol.js';

describe('protocol', () => {
	it('round-trips a message through encode and decode', () => {
		const message = { type: 'welcome', sessionId: 'abc-123', serverTime: '2026-01-01T00:00:00Z' };
		const encoded = encodeStudioMessage(message);
		const decoded = decodeStudioMessage(encoded);

		expect(decoded).toEqual(message);
	});

	it('encodes to a JSON string', () => {
		const encoded = encodeStudioMessage({ type: 'pong', at: 42 });

		expect(typeof encoded).toBe('string');
		expect(JSON.parse(encoded)).toEqual({ type: 'pong', at: 42 });
	});

	it('decodes an ArrayBuffer payload', () => {
		const json = JSON.stringify({ type: 'ping', at: 99 });
		const buffer = new TextEncoder().encode(json).buffer;
		const decoded = decodeStudioMessage(buffer);

		expect(decoded).toEqual({ type: 'ping', at: 99 });
	});

	it('throws on invalid JSON', () => {
		expect(() => decodeStudioMessage('not json {')).toThrow();
	});
});
