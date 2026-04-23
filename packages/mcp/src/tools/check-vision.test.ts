import { describe, expect, test } from 'bun:test';
import { runVisionCheck, type VisionRenderer } from './check-vision.js';

const FAKE_PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

const FAKE_RENDERER: VisionRenderer = async () => ({
	bytes: FAKE_PNG,
	screenshotPath: '/tmp/dryui-vision-test.png'
});

interface StubResponse {
	content: ReadonlyArray<{ type: 'text'; text: string }>;
}

function stubClient(response: StubResponse) {
	const messageCalls: unknown[] = [];
	const client = {
		messages: {
			async create(params: unknown): Promise<StubResponse> {
				messageCalls.push(params);
				return response;
			}
		}
	};
	return { client, messageCalls };
}

describe('runVisionCheck', () => {
	test('parses { findings: [] } as a clean run', async () => {
		const { client } = stubClient({
			content: [{ type: 'text', text: '{ "findings": [] }' }]
		});

		const result = await runVisionCheck(
			{ url: 'https://example.com' },
			{
				apiKey: 'sk-test',
				client: client as Parameters<typeof runVisionCheck>[1]['client'],
				renderer: FAKE_RENDERER
			}
		);

		expect(result.findings).toHaveLength(0);
		expect(result.diagnostics).toHaveLength(0);
		expect(result.summary.hasBlockers).toBe(false);
		expect(result.text).toContain('findings[0]: clean');
		expect(result.text).toContain('hasBlockers: false');
	});

	test('strips ```json fences and parses findings', async () => {
		const fenced = [
			'```json',
			JSON.stringify({
				findings: [
					{ rule: 'vision/chip-wrap', severity: 'warning', message: 'Filter chip stacked.' },
					{ rule: 'vision/low-contrast', severity: 'error', message: 'Body fails 4.5:1 on glass.' }
				]
			}),
			'```'
		].join('\n');

		const { client } = stubClient({ content: [{ type: 'text', text: fenced }] });

		const result = await runVisionCheck(
			{ url: 'https://example.com' },
			{
				apiKey: 'sk-test',
				client: client as Parameters<typeof runVisionCheck>[1]['client'],
				renderer: FAKE_RENDERER
			}
		);

		expect(result.findings).toHaveLength(2);
		expect(result.summary.hasBlockers).toBe(true);
		expect(result.summary.counts.error).toBe(1);
		expect(result.summary.counts.warning).toBe(1);
		expect(result.diagnostics[0]?.code).toBe('vision/chip-wrap');
		expect(result.diagnostics[0]?.source).toBe('vision');
		expect(result.diagnostics[0]?.hint).toMatch(/Badge/);
		expect(result.diagnostics[1]?.code).toBe('vision/low-contrast');
		expect(result.text).toContain('vision/chip-wrap');
	});

	test('emits a parseError diagnostic when the model returns non-JSON', async () => {
		const { client } = stubClient({
			content: [{ type: 'text', text: 'I think this looks fine, no issues to report!' }]
		});

		const result = await runVisionCheck(
			{ url: 'https://example.com' },
			{
				apiKey: 'sk-test',
				client: client as Parameters<typeof runVisionCheck>[1]['client'],
				renderer: FAKE_RENDERER
			}
		);

		expect(result.findings).toHaveLength(0);
		// parse-error diagnostic is appended even though no real findings landed
		const parseErr = result.diagnostics.find((d) => d.code === 'vision/parse-error');
		expect(parseErr).toBeDefined();
		expect(parseErr?.severity).toBe('warning');
		expect(parseErr?.hint).toMatch(/JSON/);
		expect(result.text).toContain('parseError:');
	});

	test('rejects non-http(s) URLs', async () => {
		await expect(
			runVisionCheck({ url: 'file:///etc/passwd' }, { apiKey: 'sk-test', renderer: FAKE_RENDERER })
		).rejects.toThrow(/http or https/);
	});

	test('throws structured error when no API key is available', async () => {
		const previous = process.env.ANTHROPIC_API_KEY;
		delete process.env.ANTHROPIC_API_KEY;
		try {
			await expect(
				runVisionCheck({ url: 'https://example.com' }, { renderer: FAKE_RENDERER })
			).rejects.toThrow(/ANTHROPIC_API_KEY/);
		} finally {
			if (previous !== undefined) process.env.ANTHROPIC_API_KEY = previous;
		}
	});

	test('caches the rubric in the system prompt block', async () => {
		const { client, messageCalls } = stubClient({
			content: [{ type: 'text', text: '{ "findings": [] }' }]
		});

		await runVisionCheck(
			{ url: 'https://example.com', extraRubric: 'focus on the hero' },
			{
				apiKey: 'sk-test',
				client: client as Parameters<typeof runVisionCheck>[1]['client'],
				renderer: FAKE_RENDERER
			}
		);

		const params = messageCalls[0] as {
			system: ReadonlyArray<{ cache_control?: unknown }>;
			messages: ReadonlyArray<{ content: ReadonlyArray<{ type: string; text?: string }> }>;
		};
		expect(params.system[0]?.cache_control).toEqual({ type: 'ephemeral' });
		const userText = params.messages[0]?.content.find((c) => c.type === 'text')?.text ?? '';
		expect(userText).toContain('focus on the hero');
	});
});
