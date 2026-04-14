import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import { EventBus } from '../../../feedback-server/src/events.ts';
import { startFeedbackHttpServer } from '../../../feedback-server/src/http.ts';
import { FeedbackStore } from '../../../feedback-server/src/store.ts';
import { runFeedback } from '../commands/feedback.js';
import { captureAsyncCommandIO } from './helpers.js';

describe('feedback command', () => {
	let store: FeedbackStore;
	let bus: EventBus;
	let server: { stop(): void; hostname: string; port: number };
	let baseUrl: string;

	beforeEach(() => {
		store = new FeedbackStore(':memory:');
		bus = new EventBus();
		server = startFeedbackHttpServer(store, bus, { host: '127.0.0.1', port: 0 });
		baseUrl = `http://${server.hostname}:${server.port}`;
	});

	afterEach(() => {
		server.stop();
		store.close();
	});

	test('prints subcommand help for feedback ui', async () => {
		const result = await captureAsyncCommandIO(() => runFeedback(['ui', '--help']));

		expect(result.logs).toEqual([
			'Usage: dryui feedback ui [--endpoint <url>] [--no-open] [--host <host>] [--port <port>] [--db <path>]',
			'',
			'Open the feedback dashboard for queue and history review.',
			'If no feedback server is running at the target endpoint, this command starts one in the background first.',
			'',
			'Options:',
			'  --endpoint <url>  Feedback server base URL',
			'  --no-open         Print the dashboard URL without opening a browser',
			'  --host <host>     Host to use when starting the server',
			'  --port <port>     Port to use when starting the server',
			'  --db <path>       SQLite database path to use when starting the server',
			'',
			'Examples:',
			'  dryui feedback ui',
			'  dryui feedback ui --endpoint http://127.0.0.1:4748 --no-open',
			'  dryui feedback ui --port 5757 --db ~/.dryui-feedback/preview.db'
		]);
		expect(result.exitCode).toBe(0);
	});

	test('prints the dashboard url without opening a browser when --no-open is set', async () => {
		const result = await captureAsyncCommandIO(() =>
			runFeedback(['ui', '--endpoint', baseUrl, '--no-open'])
		);

		expect(result.logs).toHaveLength(1);
		expect(result.logs[0]).toContain('DryUI feedback ui');
		expect(result.logs[0]).toContain(`Endpoint: ${baseUrl}`);
		expect(result.logs[0]).toContain(`Dashboard: ${baseUrl}/ui?v=`);
		expect(result.logs[0]).toContain('Server: already running');
		expect(result.logs[0]).toContain('Browser: skipped (--no-open)');
		expect(result.exitCode).toBe(0);
	});

	test('uses the requested host and port when resolving the dashboard url', async () => {
		const result = await captureAsyncCommandIO(() =>
			runFeedback(['ui', '--host', '127.0.0.1', '--port', String(server.port), '--no-open'])
		);

		expect(result.logs).toHaveLength(1);
		expect(result.logs[0]).toContain('DryUI feedback ui');
		expect(result.logs[0]).toContain(`Endpoint: ${baseUrl}`);
		expect(result.logs[0]).toContain(`Dashboard: ${baseUrl}/ui?v=`);
		expect(result.logs[0]).toContain('Server: already running');
		expect(result.logs[0]).toContain('Browser: skipped (--no-open)');
		expect(result.exitCode).toBe(0);
	});
});
