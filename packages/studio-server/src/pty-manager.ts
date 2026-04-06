import { spawn, type ChildProcessWithoutNullStreams } from 'node:child_process';
import { EventEmitter } from 'node:events';

export interface PtySpawnOptions {
	readonly command: string;
	readonly args?: readonly string[];
	readonly cwd?: string;
	readonly env?: NodeJS.ProcessEnv;
}

export interface PtyDataEvent {
	readonly chunk: string;
	readonly stream: 'stdout' | 'stderr';
}

export interface PtyExitEvent {
	readonly code: number | null;
	readonly signal: NodeJS.Signals | null;
}

export type PtySpawnImplementation = (
	command: string,
	args: readonly string[],
	options: { cwd?: string; env?: NodeJS.ProcessEnv; stdio: ['pipe', 'pipe', 'pipe'] }
) => ChildProcessWithoutNullStreams;

export class PtyManager extends EventEmitter {
	#process: ChildProcessWithoutNullStreams | null = null;
	#spawnImpl: PtySpawnImplementation;
	#options: PtySpawnOptions;

	constructor(
		options: PtySpawnOptions,
		spawnImpl: PtySpawnImplementation = spawn as PtySpawnImplementation
	) {
		super();
		this.#options = options;
		this.#spawnImpl = spawnImpl;
	}

	get running(): boolean {
		return this.#process !== null;
	}

	start(): void {
		if (this.#process) {
			return;
		}

		const spawnOptions: { cwd?: string; env?: NodeJS.ProcessEnv; stdio: ['pipe', 'pipe', 'pipe'] } =
			{
				stdio: ['pipe', 'pipe', 'pipe']
			};

		if (this.#options.cwd !== undefined) {
			spawnOptions.cwd = this.#options.cwd;
		}

		if (this.#options.env !== undefined) {
			spawnOptions.env = this.#options.env;
		}

		const child = this.#spawnImpl(
			this.#options.command,
			[...(this.#options.args ?? [])],
			spawnOptions
		);

		this.#process = child;

		child.stdout.on('data', (buffer: Uint8Array) => {
			this.emit('data', {
				chunk: new TextDecoder().decode(buffer),
				stream: 'stdout'
			} satisfies PtyDataEvent);
		});

		child.stderr.on('data', (buffer: Uint8Array) => {
			this.emit('data', {
				chunk: new TextDecoder().decode(buffer),
				stream: 'stderr'
			} satisfies PtyDataEvent);
		});

		child.on('exit', (code, signal) => {
			this.#process = null;
			this.emit('exit', { code, signal } satisfies PtyExitEvent);
		});
	}

	write(input: string): void {
		this.#process?.stdin.write(input);
	}

	resize(columns: number, rows: number): void {
		this.emit('resize', { columns, rows });
	}

	stop(signal: NodeJS.Signals = 'SIGTERM'): void {
		this.#process?.kill(signal);
		this.#process = null;
	}
}

export function createPtyManager(
	options: PtySpawnOptions,
	spawnImpl?: PtySpawnImplementation
): PtyManager {
	return new PtyManager(options, spawnImpl);
}
