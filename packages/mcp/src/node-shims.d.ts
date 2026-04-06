declare module 'node:fs/promises' {
	export interface Dirent {
		name: string;
		isFile(): boolean;
		isDirectory(): boolean;
	}

	export function readFile(path: string, encoding: 'utf8'): Promise<string>;
	export function writeFile(path: string, data: string): Promise<void>;
	export function readdir(path: string, options: { withFileTypes: true }): Promise<Dirent[]>;
}

declare module 'node:path' {
	export function dirname(path: string): string;
	export function join(...parts: string[]): string;
	export function resolve(...parts: string[]): string;
}

declare module 'node:url' {
	export function fileURLToPath(url: string | URL): string;
}

declare module 'node:vm' {
	export interface Context {
		[key: string]: unknown;
	}

	export interface ScriptOptions {
		displayErrors?: boolean;
		filename?: string;
	}

	export interface RunInContextOptions {
		timeout?: number;
	}

	export class Script {
		constructor(code: string, options?: ScriptOptions);
		runInContext(context: Context, options?: RunInContextOptions): unknown;
	}

	export function createContext(
		sandbox?: Context,
		options?: { name?: string; origin?: string }
	): Context;

	const vm: {
		Script: typeof Script;
		createContext: typeof createContext;
	};

	export default vm;
}
