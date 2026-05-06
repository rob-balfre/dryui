declare module 'bun:sqlite' {
	export class Database {
		constructor(
			filename?: string,
			options?: { create?: boolean; readonly?: boolean; strict?: boolean }
		);
		exec(sql: string): void;
		query<T = unknown>(
			sql: string
		): {
			all(...params: unknown[]): T[];
			get(...params: unknown[]): T | null;
			run(...params: unknown[]): { changes: number; lastInsertRowid: number | bigint };
		};
		close(): void;
	}
}

interface BunFile extends Blob {
	exists(): Promise<boolean>;
}

declare const Bun: {
	serve(options: {
		hostname: string;
		port: number;
		idleTimeout?: number;
		fetch(
			request: Request,
			server: { timeout(req: Request, seconds: number): void }
		): Response | Promise<Response>;
		error?(error: Error): Response;
	}): {
		// Bun's actual signature: stop(closeActiveConnections?: boolean): Promise<void>.
		// Without `await` and `closeActiveConnections=true`, the listener and any
		// in-flight requests/SSE streams keep running after stop() returns —
		// which racing test setUp/tearDown would otherwise pick up.
		stop(closeActiveConnections?: boolean): Promise<void>;
		hostname: string;
		port: number;
	};
	sleep(ms: number): Promise<void>;
	file(path: string): BunFile;
};
