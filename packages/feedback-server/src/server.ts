import {
	DEFAULT_FEEDBACK_HOST,
	DEFAULT_FEEDBACK_PORT,
	FEEDBACK_PORT_SEARCH_LIMIT,
	projectFeedbackPaths,
	resolveProjectPath,
	toFeedbackBaseUrl,
	writeFeedbackServerConfig
} from './config.js';
import {
	attachDispatcher,
	DISPATCH_AGENTS,
	TERMINAL_APPS,
	type DispatchAgent,
	type TerminalApp
} from './dispatch.js';
import { EventBus } from './events.js';
import { startFeedbackHttpServer } from './http.js';
import { FeedbackStore } from './store.js';

function readFlag(name: string): string | undefined {
	const args = process.argv.slice(2);
	const index = args.indexOf(name);
	if (index === -1) return undefined;
	return args[index + 1];
}

function toNumber(value: string | undefined, fallback: number): number {
	if (!value) return fallback;
	const numeric = Number(value);
	return Number.isFinite(numeric) && numeric > 0 ? numeric : fallback;
}

function parseDispatchAgent(raw: string | undefined, fallback: DispatchAgent): DispatchAgent {
	if (!raw) return fallback;
	return DISPATCH_AGENTS.includes(raw as DispatchAgent) ? (raw as DispatchAgent) : fallback;
}

function parseTerminalApp(raw: string | undefined, fallback: TerminalApp): TerminalApp {
	if (!raw) return fallback;
	const normalized = raw.toLowerCase() as TerminalApp;
	return TERMINAL_APPS.includes(normalized) ? normalized : fallback;
}

interface StartedServer {
	stop(): void;
	hostname: string;
	port: number;
}

function isAddressInUse(error: unknown): boolean {
	if (!error || typeof error !== 'object') return false;
	// Bun surfaces EADDRINUSE on both .code and .message, Node only on .code.
	const code = (error as { code?: string }).code;
	if (code === 'EADDRINUSE') return true;
	const message = (error as { message?: string }).message ?? '';
	return /EADDRINUSE|address already in use/i.test(message);
}

function tryStart(
	host: string,
	port: number,
	start: (host: string, port: number) => StartedServer
): StartedServer {
	let lastError: unknown;
	for (let offset = 0; offset < FEEDBACK_PORT_SEARCH_LIMIT; offset++) {
		const candidate = port + offset;
		try {
			return start(host, candidate);
		} catch (error) {
			if (!isAddressInUse(error)) throw error;
			lastError = error;
			if (offset > 0) {
				console.error(`[feedback] port ${candidate} busy, trying ${candidate + 1}`);
			}
		}
	}
	throw new Error(
		`Unable to bind feedback server: ports ${port}..${port + FEEDBACK_PORT_SEARCH_LIMIT - 1} all in use (${
			lastError instanceof Error ? lastError.message : String(lastError)
		})`
	);
}

function main(): void {
	const projectFlag =
		readFlag('--project') ?? readFlag('--workspace') ?? process.env['DRYUI_FEEDBACK_PROJECT'];
	const projectRoot = projectFlag ?? process.cwd();
	const paths = projectFeedbackPaths(projectRoot);

	const requestedPort = toNumber(
		readFlag('--port') ?? process.env['DRYUI_FEEDBACK_PORT'],
		DEFAULT_FEEDBACK_PORT
	);
	const host = readFlag('--host') ?? process.env['DRYUI_FEEDBACK_HOST'] ?? DEFAULT_FEEDBACK_HOST;
	const dbOverride = resolveProjectPath(
		paths.root,
		readFlag('--db') ?? process.env['DRYUI_FEEDBACK_STORE_PATH']
	);
	const dbPath = dbOverride ?? paths.dbPath;
	const dispatchEnabled = !process.argv.includes('--no-dispatch');
	const defaultAgent = parseDispatchAgent(
		readFlag('--default-agent') ?? process.env['DRYUI_DISPATCH_AGENT'],
		'codex'
	);
	const terminalApp = parseTerminalApp(
		readFlag('--terminal-app') ?? process.env['DRYUI_DISPATCH_TERMINAL_APP'],
		'terminal'
	);

	const store = new FeedbackStore({ dbPath, screenshotsDir: paths.screenshotsDir });
	const bus = new EventBus();
	const server = tryStart(host, requestedPort, (boundHost, boundPort) =>
		startFeedbackHttpServer(store, bus, {
			host: boundHost,
			port: boundPort,
			dispatcher: { workspace: paths.root, defaultAgent, terminalApp }
		})
	);
	const baseUrl = toFeedbackBaseUrl(server.hostname, server.port);

	if (dispatchEnabled) {
		attachDispatcher(bus, { workspace: paths.root, defaultAgent, terminalApp });
	}

	writeFeedbackServerConfig(paths.root, {
		host: server.hostname,
		port: server.port,
		baseUrl,
		dbPath: store.dbPath,
		updatedAt: new Date().toISOString()
	});

	console.error(`DryUI feedback server listening on ${baseUrl} for ${paths.root}`);
}

if (import.meta.main) {
	main();
}
