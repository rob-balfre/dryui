import {
	DEFAULT_FEEDBACK_HOST,
	DEFAULT_FEEDBACK_PORT,
	toFeedbackBaseUrl,
	writeFeedbackServerConfig
} from './config.js';
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

function main(): void {
	const port = toNumber(
		readFlag('--port') ?? process.env['DRYUI_FEEDBACK_PORT'],
		DEFAULT_FEEDBACK_PORT
	);
	const host = readFlag('--host') ?? process.env['DRYUI_FEEDBACK_HOST'] ?? DEFAULT_FEEDBACK_HOST;
	const dbPath = readFlag('--db') ?? process.env['DRYUI_FEEDBACK_STORE_PATH'];

	const store = new FeedbackStore(dbPath);
	const bus = new EventBus();
	const server = startFeedbackHttpServer(store, bus, { host, port });
	const baseUrl = toFeedbackBaseUrl(server.hostname, server.port);

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
