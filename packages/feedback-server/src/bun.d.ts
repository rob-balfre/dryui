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
	}): { stop(): void; hostname: string; port: number };
	sleep(ms: number): Promise<void>;
};
