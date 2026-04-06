import { existsSync, readFileSync } from 'node:fs';
import { extname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { WIZARD_COMPONENTS } from './components.js';
import { WIZARD_LAYOUTS } from './layouts.js';
import { decodeWizardMessage, encodeWizardMessage, isWizardQuestionType } from './protocol.js';
import type {
	WizardBrowserMessage,
	WizardQuestionInput,
	WizardRuntimeEvent,
	WizardServerMessage
} from './types.js';
import { createWizardRuntime, type WizardBrowserConnection, type WizardRuntime } from './state.js';

export interface WizardServerOptions {
	readonly onEvent?: (event: WizardRuntimeEvent) => void;
	readonly appDir?: string;
}

export interface WizardServerHandle {
	readonly port: number;
	readonly url: string;
	readonly runtime: WizardRuntime;
	stop(): void;
}

interface BunServerLike {
	readonly port: number;
	stop(): void;
}

interface BunServeOptions {
	readonly port?: number;
	readonly hostname?: string;
	readonly fetch: (
		request: Request,
		server: { upgrade: (request: Request, options: { data: unknown }) => boolean }
	) => Response | Promise<Response>;
	readonly websocket?: {
		readonly open?: (ws: {
			data: { connectionId: string };
			send: (message: string) => void;
			close: (code?: number, reason?: string) => void;
		}) => void;
		readonly message?: (
			ws: { data: { connectionId: string } },
			message: string | ArrayBufferLike
		) => void;
		readonly close?: (ws: { data: { connectionId: string } }) => void;
	};
}

const APP_FILE_EXTENSIONS = new Set([
	'.html',
	'.css',
	'.js',
	'.mjs',
	'.cjs',
	'.json',
	'.svg',
	'.png',
	'.jpg',
	'.jpeg',
	'.webp',
	'.ico',
	'.txt',
	'.map',
	'.wasm'
]);

function createAppDirCandidates(): readonly string[] {
	const current = fileURLToPath(import.meta.url);
	const sourceDir = resolve(current, '..');
	return [
		resolve(sourceDir, 'app'),
		resolve(sourceDir, '..', 'dist', 'app'),
		resolve(sourceDir, '..', 'app')
	];
}

function resolveAppDir(explicitDir?: string): string {
	if (explicitDir) {
		return explicitDir;
	}

	const candidates = createAppDirCandidates();
	for (const candidate of candidates) {
		if (existsSync(candidate)) {
			return candidate;
		}
	}

	return candidates[0] ?? candidates[1] ?? candidates[2] ?? '.';
}

function contentTypeForPath(pathname: string): string {
	switch (extname(pathname)) {
		case '.html':
			return 'text/html; charset=utf-8';
		case '.css':
			return 'text/css; charset=utf-8';
		case '.js':
		case '.mjs':
		case '.cjs':
			return 'text/javascript; charset=utf-8';
		case '.json':
		case '.map':
			return 'application/json; charset=utf-8';
		case '.svg':
			return 'image/svg+xml';
		case '.png':
			return 'image/png';
		case '.jpg':
		case '.jpeg':
			return 'image/jpeg';
		case '.webp':
			return 'image/webp';
		case '.ico':
			return 'image/x-icon';
		case '.txt':
			return 'text/plain; charset=utf-8';
		case '.wasm':
			return 'application/wasm';
		default:
			return 'application/octet-stream';
	}
}

function safePathJoin(rootDir: string, pathname: string): string | null {
	const normalized = pathname.replaceAll('\\', '/');
	const relative = normalized.startsWith('/') ? normalized.slice(1) : normalized;
	const absolute = resolve(rootDir, relative);
	const root = rootDir.endsWith(sep) ? rootDir : `${rootDir}${sep}`;

	if (!absolute.startsWith(root) && absolute !== rootDir) {
		return null;
	}

	return absolute;
}

function resolveStaticFile(appDir: string, pathname: string): string | null {
	const cleanPath = decodeURIComponent(pathname);

	if (cleanPath === '/' || cleanPath === '') {
		return join(appDir, 'index.html');
	}

	const direct = safePathJoin(appDir, cleanPath);
	if (!direct) {
		return null;
	}

	if (existsSync(direct) && !cleanPath.endsWith('/')) {
		return direct;
	}

	if (APP_FILE_EXTENSIONS.has(extname(cleanPath))) {
		return existsSync(direct) ? direct : null;
	}

	const htmlFile = safePathJoin(appDir, `${cleanPath.replace(/\/+$/, '')}.html`);
	if (htmlFile && existsSync(htmlFile)) {
		return htmlFile;
	}

	const nestedIndex = safePathJoin(appDir, `${cleanPath.replace(/\/+$/, '')}/index.html`);
	if (nestedIndex && existsSync(nestedIndex)) {
		return nestedIndex;
	}

	const fallback = join(appDir, 'index.html');
	return existsSync(fallback) ? fallback : null;
}

function readJsonQuestion(body: string): WizardQuestionInput {
	const parsed = JSON.parse(body) as Partial<WizardQuestionInput> & { readonly type?: unknown };

	if (typeof parsed.prompt !== 'string' || parsed.prompt.trim() === '') {
		throw new Error('Question prompt is required.');
	}

	const type = parsed.type ?? parsed.questionType;
	if (type !== undefined && !isWizardQuestionType(type)) {
		throw new Error('Unsupported question type.');
	}

	return {
		prompt: parsed.prompt,
		...(isWizardQuestionType(type) ? { type } : {}),
		...(Array.isArray(parsed.options) ? { options: parsed.options } : {})
	};
}

function jsonResponse(body: unknown, init?: ResponseInit): Response {
	return new Response(JSON.stringify(body), {
		...init,
		headers: {
			'content-type': 'application/json; charset=utf-8',
			...(init?.headers ?? {})
		}
	});
}

function createWsConnection(
	connectionId: string,
	send: (message: WizardServerMessage) => void,
	close: (code?: number, reason?: string) => void
): WizardBrowserConnection {
	return {
		id: connectionId,
		send,
		close
	};
}

export function createWizardServer(options: WizardServerOptions = {}): WizardServerHandle {
	const runtime = createWizardRuntime(options.onEvent ? { onEvent: options.onEvent } : {});
	const appDir = resolveAppDir(options.appDir);

	let server: BunServerLike | null = null;
	let stopped = false;

	const stop = (): void => {
		if (stopped) {
			return;
		}

		stopped = true;
		runtime.close();
		queueMicrotask(() => {
			server?.stop();
		});
	};

	const bun = (
		globalThis as {
			readonly Bun?: {
				serve: (options: BunServeOptions) => BunServerLike;
			};
		}
	).Bun;

	if (!bun) {
		throw new Error('Bun runtime is required to start the wizard server.');
	}

	server = bun.serve({
		port: 0,
		fetch: async (request, upgradeServer) => {
			const url = new URL(request.url);

			if (url.pathname === '/ws') {
				if (!upgradeServer.upgrade(request, { data: { connectionId: crypto.randomUUID() } })) {
					return new Response('Upgrade failed', { status: 400 });
				}

				return new Response(null, { status: 101 });
			}

			if (url.pathname === '/api/layouts' && request.method === 'GET') {
				return jsonResponse(WIZARD_LAYOUTS);
			}

			if (url.pathname === '/api/components' && request.method === 'GET') {
				return jsonResponse(WIZARD_COMPONENTS);
			}

			if (url.pathname === '/api/ask' && request.method === 'POST') {
				try {
					const question = readJsonQuestion(await request.text());
					const queued = runtime.ask(question);
					return jsonResponse({
						type: 'answer',
						questionId: queued.question.id,
						value: await queued.answer
					});
				} catch (error) {
					return jsonResponse(
						{ error: error instanceof Error ? error.message : String(error) },
						{ status: 400 }
					);
				}
			}

			if (url.pathname === '/api/done' && request.method === 'POST') {
				stop();
				return jsonResponse({ type: 'closed' });
			}

			if (request.method !== 'GET' && request.method !== 'HEAD') {
				return new Response('Method not allowed', { status: 405 });
			}

			const staticFile = resolveStaticFile(appDir, url.pathname);
			if (!staticFile) {
				return new Response('Not found', { status: 404 });
			}

			const headers: Record<string, string> = {
				'content-type': contentTypeForPath(staticFile)
			};

			if (staticFile.includes('/_app/')) {
				headers['cache-control'] = 'public, max-age=31536000, immutable';
			}

			if (request.method === 'HEAD') {
				return new Response(null, { headers });
			}

			return new Response(readFileSync(staticFile), { headers });
		},
		websocket: {
			open(ws) {
				const connectionId = crypto.randomUUID();
				const connection = createWsConnection(
					connectionId,
					(message) => {
						ws.send(encodeWizardMessage(message));
					},
					(code, reason) => {
						ws.close(code, reason);
					}
				);

				ws.data = { connectionId };
				runtime.connectBrowser(connection);
			},
			message(ws, message) {
				const parsed = decodeWizardMessage(message);
				if (!parsed || typeof parsed !== 'object' || !('type' in parsed)) {
					return;
				}

				runtime.handleBrowserMessage(parsed as WizardBrowserMessage);
			},
			close(ws) {
				runtime.disconnectBrowser(ws.data.connectionId);
			}
		}
	});

	return {
		port: server.port,
		url: `http://localhost:${server.port}`,
		runtime,
		stop
	};
}
