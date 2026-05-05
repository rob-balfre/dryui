import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
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
	let screenshotsDir: string;

	beforeEach(() => {
		screenshotsDir = mkdtempSync(join(tmpdir(), 'dryui-cli-feedback-'));
		store = new FeedbackStore({ dbPath: ':memory:', screenshotsDir });
		bus = new EventBus();
		server = startFeedbackHttpServer(store, bus, { host: '127.0.0.1', port: 0 });
		baseUrl = `http://${server.hostname}:${server.port}`;
	});

	afterEach(() => {
		server.stop();
		store.close();
		rmSync(screenshotsDir, { recursive: true, force: true });
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
			'  dryui feedback ui --port 5757 --db ./.dryui/feedback/preview.db'
		]);
		expect(result.exitCode).toBe(0);
	});

	test('prints the local setup guide for feedback init', async () => {
		const result = await captureAsyncCommandIO(() =>
			runFeedback(['init'], { exitOnComplete: false })
		);

		expect(result.logs).toHaveLength(1);
		expect(result.logs[0]).toContain('DryUI feedback init');
		expect(result.logs[0]).toContain('Default server URL: http://127.0.0.1:4748');
		expect(result.logs[0]).toContain('.dryui/feedback');
		expect(result.logs[0]).toContain('packages/feedback-server/hooks/check-feedback.sh');
		expect(result.logs[0]).toContain('dryui feedback doctor');
		expect(result.errors).toEqual([]);
		expect(result.exitCode).toBeNull();
	});

	test('runs feedback doctor against a live server', async () => {
		const result = await captureAsyncCommandIO(() =>
			runFeedback(['doctor', '--endpoint', baseUrl], { exitOnComplete: false })
		);

		expect(result.logs).toHaveLength(1);
		expect(result.logs[0]).toContain('DryUI feedback doctor');
		expect(result.logs[0]).toContain(`Endpoint: ${baseUrl}`);
		expect(result.logs[0]).toContain('Health: ok');
		expect(result.logs[0]).toContain('Active listeners: 0');
		expect(result.logs[0]).toContain('Agent listeners: 0');
		expect(result.errors).toEqual([]);
		expect(result.exitCode).toBeNull();
	});

	test('surfaces a structured error when feedback doctor cannot reach the server', async () => {
		const result = await captureAsyncCommandIO(() =>
			runFeedback(['doctor', '--endpoint', 'http://127.0.0.1:9'], { exitOnComplete: false })
		);

		expect(result.logs).toHaveLength(1);
		expect(result.logs[0]).toContain('feedback-unreachable');
		expect(result.logs[0]).toContain('dryui feedback server');
		expect(result.logs[0]).toContain('dryui feedback ui');
		expect(result.errors).toEqual([]);
		expect(result.exitCode).toBeNull();
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

	test('opens the dashboard by default and reports unknown feedback subcommands', async () => {
		const missing = await captureAsyncCommandIO(() =>
			runFeedback(['--host', '127.0.0.1', '--port', String(server.port), '--no-open'], {
				exitOnComplete: false
			})
		);
		expect(missing.logs).toHaveLength(1);
		expect(missing.logs[0]).toContain('DryUI feedback ui');
		expect(missing.logs[0]).toContain(`Endpoint: ${baseUrl}`);
		expect(missing.logs[0]).toContain('Browser: skipped (--no-open)');
		expect(missing.errors).toEqual([]);
		expect(missing.exitCode).toBeNull();

		const unknown = await captureAsyncCommandIO(() =>
			runFeedback(['wat'], { exitOnComplete: false })
		);
		expect(unknown.logs).toHaveLength(1);
		expect(unknown.logs[0]).toContain('unknown-subcommand');
		expect(unknown.logs[0]).toContain('Unknown feedback subcommand: "wat"');
		expect(unknown.errors).toEqual([]);
		expect(unknown.exitCode).toBeNull();
	});
});
