// Minimal shims so the preprocessor can read package.json files without
// depending on @types/node. The lint package stays runtime-zero-dep but we
// need a tiny pinch of Node APIs to walk up to the nearest package.json
// when deciding whether a file belongs to an upstream `@dryui/*` package.
declare module 'node:fs' {
	export function appendFileSync(path: string, data: string, encoding: 'utf-8' | 'utf8'): void;
	export function existsSync(path: string): boolean;
	export function mkdirSync(path: string, options: { recursive: boolean }): void;
	export function readFileSync(path: string, encoding: 'utf-8' | 'utf8'): string;
}

declare module 'node:path' {
	export function dirname(path: string): string;
	export function resolve(...paths: string[]): string;
}

declare const process: {
	cwd(): string;
};
