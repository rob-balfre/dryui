import { describe, expect, test } from 'bun:test';
import { runVisionCheck, type VisionRenderer, type VisionReviewer } from './check-vision.js';

const FAKE_PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

const FAKE_RENDERER: VisionRenderer = async () => ({
	bytes: FAKE_PNG,
	screenshotPath: '/tmp/dryui-vision-test.png'
});

function stubReviewer(rawText: string, model = 'codex-test') {
	const reviewCalls: unknown[] = [];
	const reviewer: VisionReviewer = async (params) => {
		reviewCalls.push(params);
		return { rawText, model };
	};
	return { reviewer, reviewCalls };
}

describe('runVisionCheck', () => {
	test('parses { findings: [] } as a clean run', async () => {
		const { reviewer } = stubReviewer('{ "findings": [] }');

		const result = await runVisionCheck(
			{ url: 'https://example.com' },
			{
				reviewer,
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

		const { reviewer } = stubReviewer(fenced);

		const result = await runVisionCheck(
			{ url: 'https://example.com' },
			{
				reviewer,
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
		const { reviewer } = stubReviewer('I think this looks fine, no issues to report!');

		const result = await runVisionCheck(
			{ url: 'https://example.com' },
			{
				reviewer,
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
			runVisionCheck(
				{ url: 'file:///etc/passwd' },
				{ reviewer: stubReviewer('{ "findings": [] }').reviewer, renderer: FAKE_RENDERER }
			)
		).rejects.toThrow(/http or https/);
	});

	test('surfaces reviewer failures', async () => {
		const reviewer: VisionReviewer = async () => {
			throw new Error('codex exploded');
		};

		await expect(
			runVisionCheck({ url: 'https://example.com' }, { reviewer, renderer: FAKE_RENDERER })
		).rejects.toThrow(/codex exploded/);
	});

	test('passes the rubric and extra emphasis into the reviewer prompt', async () => {
		const { reviewer, reviewCalls } = stubReviewer('{ "findings": [] }');

		await runVisionCheck(
			{ url: 'https://example.com', extraRubric: 'focus on the hero' },
			{
				reviewer,
				renderer: FAKE_RENDERER
			}
		);

		const params = reviewCalls[0] as {
			rubricPrompt: string;
			userText: string;
			screenshotPath: string;
		};
		expect(params.rubricPrompt).toContain('vision/chip-wrap');
		expect(params.userText).toContain('focus on the hero');
		expect(params.screenshotPath).toBe('/tmp/dryui-vision-test.png');
	});
});
