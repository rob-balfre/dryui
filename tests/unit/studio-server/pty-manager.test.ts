import { describe, expect, it } from 'bun:test';
import { EventEmitter } from 'node:events';
import type { ChildProcessWithoutNullStreams } from 'node:child_process';
import { PtyManager } from '../../../packages/studio-server/src/pty-manager.js';

class FakeStream extends EventEmitter {
	written: string[] = [];
	write(chunk: string) {
		this.written.push(chunk);
		return true;
	}
}

interface FakeChildProcess {
	process: ChildProcessWithoutNullStreams;
	stdout: FakeStream;
	stderr: FakeStream;
	stdin: FakeStream;
}

function createFakeProcess(): FakeChildProcess {
	const stdout = new FakeStream();
	const stderr = new FakeStream();
	const stdin = new FakeStream();
	const emitter = new EventEmitter();

	const process = Object.assign(emitter, {
		stdout,
		stderr,
		stdin,
		kill: () => true
	});

	return {
		process: process as unknown as ChildProcessWithoutNullStreams,
		stdout,
		stderr,
		stdin
	};
}

describe('PtyManager', () => {
	it('streams output and forwards writes', () => {
		const fake = createFakeProcess();
		let spawned = 0;
		const manager = new PtyManager({ command: 'claude', args: ['code'] }, () => {
			spawned += 1;
			return fake.process;
		});

		const events: string[] = [];
		manager.on('data', (event) => events.push(`${event.stream}:${event.chunk}`));
		manager.start();
		manager.write('hello');

		fake.stdout.emit('data', Buffer.from('out'));
		fake.stderr.emit('data', Buffer.from('err'));
		fake.process.emit('exit', 0, null);

		expect(spawned).toBe(1);
		expect(events).toEqual(['stdout:out', 'stderr:err']);
		expect(fake.stdin.written).toEqual(['hello']);
		expect(manager.running).toBe(false);
	});
});
