import type { CanvasCommand, StudioClientMessage, StudioServerMessage } from './types.js';
import { decodeStudioMessage, encodeStudioMessage } from './protocol.js';
import { createStudioSessionStore, type StudioSessionStore } from './session-store.js';
import type { PtyManager } from './pty-manager.js';
import { buildPromptRequest } from './prompt.js';

export interface StudioGatewayDependencies {
	readonly sessions?: StudioSessionStore;
	readonly createPty?: (sessionId: string) => PtyManager | null;
	readonly createPromptPty?: (sessionId: string) => PtyManager | null;
	readonly onCommand?: (sessionId: string, command: CanvasCommand) => void;
}

export interface StudioConnection {
	readonly id: string;
	send(message: StudioServerMessage): void;
	close(code?: number, reason?: string): void;
}

export interface StudioGateway {
	readonly sessions: StudioSessionStore;
	connect(connection: StudioConnection, initialSessionId?: string): string;
	handleMessage(connectionId: string, payload: string | ArrayBufferLike): void;
	disconnect(connectionId: string): void;
	broadcast(message: StudioServerMessage): void;
}

function isStudioClientMessage(value: unknown): value is StudioClientMessage {
	return (
		typeof value === 'object' &&
		value !== null &&
		'type' in value &&
		typeof (value as { type?: unknown }).type === 'string'
	);
}

function createSessionId(): string {
	return crypto.randomUUID();
}

export function createStudioGateway(deps: StudioGatewayDependencies = {}): StudioGateway {
	const sessions = deps.sessions ?? createStudioSessionStore();
	const connections = new Map<string, StudioConnection>();
	const connectionSessions = new Map<string, string>();
	const sessionPtys = new Map<string, PtyManager>();
	const promptPtys = new Map<string, PtyManager>();

	function ensureSession(connection: StudioConnection, initialSessionId?: string): string {
		const sessionId =
			initialSessionId && sessions.getSession(initialSessionId)
				? initialSessionId
				: createSessionId();

		if (!sessions.getSession(sessionId)) {
			sessions.createSession({ id: sessionId, clientId: connection.id });
		}

		sessions.updateSession(sessionId, (session) => {
			session.clientId = connection.id;
			session.status = 'active';
		});

		return sessionId;
	}

	function sendToConnection(connectionId: string, message: StudioServerMessage): void {
		const connection = connections.get(connectionId);
		connection?.send(message);
	}

	function runPromptPipeline(connectionId: string, sessionId: string, text: string): void {
		const session = sessions.snapshot(sessionId);
		const request = buildPromptRequest(sessionId, text, session);
		const pty = deps.createPromptPty?.(sessionId) ?? deps.createPty?.(sessionId);

		if (!pty) {
			sendToConnection(connectionId, {
				type: 'error',
				message: 'No PTY manager available for prompt handling.',
				recoverable: true
			});
			return;
		}

		const existingPromptPty = promptPtys.get(sessionId);
		if (existingPromptPty) {
			existingPromptPty.stop();
		}

		promptPtys.set(sessionId, pty);
		sessions.attachPty(sessionId);

		pty.on('data', (event: { chunk: string }) => {
			sendToConnection(connectionId, {
				type: 'pty-output',
				sessionId,
				chunk: event.chunk
			});
		});

		pty.on('exit', (event: { code: number | null; signal: string | null }) => {
			if (promptPtys.get(sessionId) === pty) {
				promptPtys.delete(sessionId);
			}
			sessions.detachPty(sessionId);
			sendToConnection(connectionId, {
				type: 'pty-exit',
				sessionId,
				code: event.code,
				signal: event.signal
			});
		});

		pty.start();
		pty.write(`${JSON.stringify(request)}\n`);
	}

	return {
		sessions,

		connect(connection, initialSessionId) {
			const sessionId = ensureSession(connection, initialSessionId);
			connections.set(connection.id, connection);
			connectionSessions.set(connection.id, sessionId);

			connection.send({
				type: 'welcome',
				sessionId,
				serverTime: new Date().toISOString()
			});

			const snapshot = sessions.snapshot(sessionId);
			if (snapshot) {
				connection.send({ type: 'state', session: snapshot });
			}

			return sessionId;
		},

		handleMessage(connectionId, payload) {
			const connection = connections.get(connectionId);
			if (!connection) {
				return;
			}

			let parsed: unknown;
			try {
				parsed = decodeStudioMessage(payload);
			} catch (error) {
				connection.send({ type: 'error', message: (error as Error).message, recoverable: true });
				return;
			}

			if (!isStudioClientMessage(parsed)) {
				connection.send({
					type: 'error',
					message: 'Unsupported Studio message payload.',
					recoverable: true
				});
				return;
			}

			const sessionId = connectionSessions.get(connectionId);
			if (!sessionId) {
				connection.send({
					type: 'error',
					message: 'No active Studio session.',
					recoverable: false
				});
				return;
			}

			sessions.touchSession(sessionId);

			switch (parsed.type) {
				case 'hello':
					connection.send({ type: 'pong', at: Date.now() });
					break;
				case 'ping':
					connection.send({ type: 'pong', at: parsed.at });
					break;
				case 'command':
					sessions.recordCommand(sessionId, parsed.command);
					deps.onCommand?.(sessionId, parsed.command);
					sendToConnection(connectionId, { type: 'command-applied', command: parsed.command });
					break;
				case 'attach-pty': {
					const pty = deps.createPty?.(sessionId);
					if (!pty) {
						connection.send({
							type: 'error',
							message: 'No PTY manager available.',
							recoverable: true
						});
						return;
					}

					const existingPty = sessionPtys.get(sessionId);
					if (existingPty) {
						existingPty.stop();
					}

					sessionPtys.set(sessionId, pty);
					sessions.attachPty(sessionId);
					pty.on('data', (event: { chunk: string }) => {
						connection.send({ type: 'pty-output', sessionId, chunk: event.chunk });
					});
					pty.on('exit', (event: { code: number | null; signal: string | null }) => {
						sessions.detachPty(sessionId);
						sessionPtys.delete(sessionId);
						connection.send({
							type: 'pty-exit',
							sessionId,
							code: event.code,
							signal: event.signal
						});
					});
					pty.start();
					break;
				}
				case 'resize': {
					const activePty = sessionPtys.get(sessionId);
					if (activePty) {
						activePty.resize(parsed.columns, parsed.rows);
					} else {
						connection.send({
							type: 'error',
							message: 'No PTY attached to resize.',
							recoverable: true
						});
					}
					break;
				}
				case 'prompt':
					runPromptPipeline(connectionId, sessionId, parsed.text);
					break;
			}
		},

		disconnect(connectionId) {
			const sessionId = connectionSessions.get(connectionId);
			const pty = sessionId ? sessionPtys.get(sessionId) : undefined;
			const promptPty = sessionId ? promptPtys.get(sessionId) : undefined;
			connections.delete(connectionId);
			connectionSessions.delete(connectionId);

			if (sessionId) {
				sessions.detachPty(sessionId);
				pty?.stop();
				promptPty?.stop();
				sessionPtys.delete(sessionId);
				promptPtys.delete(sessionId);
			}
		},

		broadcast(message) {
			for (const connection of connections.values()) {
				connection.send(message);
			}
		}
	};
}

export interface StudioServerOptions {
	readonly gateway?: StudioGateway;
	readonly host?: string;
	readonly port?: number;
}

export function startStudioServer(options: StudioServerOptions = {}) {
	const gateway = options.gateway ?? createStudioGateway();
	const bun = (
		globalThis as {
			Bun?: {
				serve: (options: {
					fetch: (
						request: Request,
						server: {
							upgrade: (request: Request, options: { data: { gateway: StudioGateway } }) => boolean;
						}
					) => Response | Promise<Response>;
					websocket?: {
						open?: (ws: {
							send: (message: string) => void;
							close: (code?: number, reason?: string) => void;
							data?: { gateway: StudioGateway; connectionId: string };
						}) => void;
						message?: (
							ws: { data: { connectionId: string } },
							message: string | ArrayBufferLike
						) => void;
						close?: (ws: { data: { connectionId: string } }) => void;
					};
					hostname?: string;
					port?: number;
				}) => unknown;
			};
		}
	).Bun;

	if (!bun) {
		throw new Error('Bun runtime is required to start the Studio WebSocket server.');
	}

	const serveOptions: {
		fetch: (
			request: Request,
			server: {
				upgrade: (request: Request, options: { data: { gateway: StudioGateway } }) => boolean;
			}
		) => Response | Promise<Response>;
		websocket: {
			open?: (ws: {
				send: (message: string) => void;
				close: (code?: number, reason?: string) => void;
				data?: { gateway: StudioGateway; connectionId: string };
			}) => void;
			message?: (ws: { data: { connectionId: string } }, message: string | ArrayBufferLike) => void;
			close?: (ws: { data: { connectionId: string } }) => void;
		};
		hostname?: string;
		port?: number;
	} = {
		fetch(request, server) {
			const url = new URL(request.url);
			if (url.pathname !== '/ws') {
				return new Response('Not found', { status: 404 });
			}

			if (server.upgrade(request, { data: { gateway } })) {
				return new Response(null, { status: 101 });
			}

			return new Response('Upgrade failed', { status: 400 });
		},
		websocket: {
			open(ws) {
				const connectionId = crypto.randomUUID();
				gateway.connect({
					id: connectionId,
					send(message) {
						ws.send(encodeStudioMessage(message));
					},
					close(code, reason) {
						ws.close(code, reason);
					}
				});

				ws.data = { gateway, connectionId };
			},
			message(ws, message) {
				gateway.handleMessage(
					(ws.data as { connectionId: string }).connectionId,
					message as string | ArrayBufferLike
				);
			},
			close(ws) {
				gateway.disconnect((ws.data as { connectionId: string }).connectionId);
			}
		}
	};

	if (options.host !== undefined) {
		serveOptions.hostname = options.host;
	}

	if (options.port !== undefined) {
		serveOptions.port = options.port;
	}

	return bun.serve(serveOptions);
}
