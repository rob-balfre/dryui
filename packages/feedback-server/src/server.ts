import {
	DEFAULT_FEEDBACK_HOST,
	DEFAULT_FEEDBACK_PORT,
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

function main(): void {
	const port = toNumber(
		readFlag('--port') ?? process.env['DRYUI_FEEDBACK_PORT'],
		DEFAULT_FEEDBACK_PORT
	);
	const host = readFlag('--host') ?? process.env['DRYUI_FEEDBACK_HOST'] ?? DEFAULT_FEEDBACK_HOST;
	const dbPath = readFlag('--db') ?? process.env['DRYUI_FEEDBACK_STORE_PATH'];
	const dispatchEnabled = !process.argv.includes('--no-dispatch');
	const workspace =
		readFlag('--workspace') ?? process.env['DRYUI_DISPATCH_WORKSPACE'] ?? process.cwd();
	const defaultAgent = parseDispatchAgent(
		readFlag('--default-agent') ?? process.env['DRYUI_DISPATCH_AGENT'],
		'codex'
	);
	const terminalApp = parseTerminalApp(
		readFlag('--terminal-app') ?? process.env['DRYUI_DISPATCH_TERMINAL_APP'],
		'terminal'
	);

	const store = new FeedbackStore(dbPath);
	const bus = new EventBus();
	const server = startFeedbackHttpServer(store, bus, {
		host,
		port,
		dispatcher: { workspace, defaultAgent, terminalApp }
	});
	const baseUrl = toFeedbackBaseUrl(server.hostname, server.port);

	if (dispatchEnabled) {
		attachDispatcher(bus, { workspace, defaultAgent, terminalApp });
	}

	writeFeedbackServerConfig({
		host: server.hostname,
		port: server.port,
		baseUrl,
		dbPath: dbPath ?? store.dbPath,
		updatedAt: new Date().toISOString()
	});

	console.error(`DryUI feedback server listening on ${baseUrl}`);
}

if (import.meta.main) {
	main();
}
