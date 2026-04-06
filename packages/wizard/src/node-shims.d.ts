declare const process: {
	argv: string[];
	platform: string;
	stdout: { write(chunk: string): boolean };
	stderr: { write(chunk: string): boolean };
	once(event: 'SIGINT' | 'SIGTERM', handler: () => void): void;
	exitCode?: number;
};

declare module 'node:fs' {
	export function existsSync(path: string): boolean;
	export function readFileSync(path: string): Uint8Array;
}

declare module 'node:path' {
	export const sep: string;
	export function extname(path: string): string;
	export function join(...paths: string[]): string;
	export function resolve(...paths: string[]): string;
}

declare module 'node:url' {
	export function fileURLToPath(url: string | URL): string;
}

declare module 'node:child_process' {
	export function spawn(
		command: string,
		args?: readonly string[],
		options?: { readonly detached?: boolean; readonly stdio?: 'ignore' | 'pipe' | 'inherit' }
	): { unref(): void };
}
