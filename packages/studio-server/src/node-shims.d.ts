declare namespace NodeJS {
	interface ProcessEnv {
		[key: string]: string | undefined;
	}

	type Signals = string;
}

declare module 'node:events' {
	export class EventEmitter {
		on(event: string | symbol, listener: (...args: any[]) => void): this;
		once(event: string | symbol, listener: (...args: any[]) => void): this;
		off(event: string | symbol, listener: (...args: any[]) => void): this;
		emit(event: string | symbol, ...args: any[]): boolean;
	}
}

declare module 'node:child_process' {
	import { EventEmitter } from 'node:events';

	export interface ChildProcessWithoutNullStreams extends EventEmitter {
		stdout: {
			on(event: 'data', listener: (chunk: Uint8Array) => void): unknown;
		};
		stderr: {
			on(event: 'data', listener: (chunk: Uint8Array) => void): unknown;
		};
		stdin: {
			write(chunk: string): unknown;
		};
		kill(signal?: NodeJS.Signals): boolean;
		on(event: 'exit', listener: (code: number | null, signal: NodeJS.Signals | null) => void): this;
	}

	export function spawn(
		command: string,
		args: readonly string[],
		options: { cwd?: string; env?: NodeJS.ProcessEnv; stdio: ['pipe', 'pipe', 'pipe'] }
	): ChildProcessWithoutNullStreams;
}
