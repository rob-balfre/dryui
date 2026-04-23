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

	test('merges renderer layout findings when the reviewer returns clean JSON', async () => {
		const { reviewer } = stubReviewer('{ "findings": [] }');
		const renderer: VisionRenderer = async () => ({
			bytes: FAKE_PNG,
			screenshotPath: '/tmp/dryui-vision-test.png',
			findings: [
				{
					rule: 'vision/header-rhythm',
					severity: 'suggestion',
					message: 'Header H1 and supporting line have a loose gap.',
					evidence: 'h1-to-supporting gap=16px threshold=12px'
				},
				{
					rule: 'vision/stray-padding',
					severity: 'warning',
					message: 'Meta row content sits low in its band.',
					evidence: 'top=12px bottom=0px center-drift=6px'
				}
			]
		});

		const result = await runVisionCheck({ url: 'https://example.com' }, { reviewer, renderer });

		expect(result.findings).toHaveLength(2);
		expect(result.summary.counts.warning).toBe(1);
		expect(result.summary.counts.suggestion).toBe(1);
		expect(result.diagnostics.map((d) => d.code)).toEqual([
			'vision/header-rhythm',
			'vision/stray-padding'
		]);
		expect(result.text).toContain('vision/header-rhythm');
		expect(result.text).toContain('vision/stray-padding');
	});

	test('strips ```json fences and parses findings', async () => {
		const fenced = [
			'```json',
			JSON.stringify({
				findings: [
					{ rule: 'vision/chip-wrap', severity: 'warning', message: 'Filter chip stacked.' },
					{ rule: 'vision/low-contrast', severity: 'error', message: 'Body fails 4.5:1 on glass.' },
					{
						rule: 'vision/cramped-layout',
						severity: 'warning',
						message: 'Page header title, subtitle, and metadata chips are packed too tightly.'
					},
					{
						rule: 'vision/header-rhythm',
						severity: 'suggestion',
						message: 'The H1 and subtitle have too much vertical distance to read as one header.'
					},
					{
						rule: 'vision/stray-padding',
						severity: 'warning',
						message: 'The metadata row has stray top padding and the chips sit low in the band.'
					}
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

		expect(result.findings).toHaveLength(5);
		expect(result.summary.hasBlockers).toBe(true);
		expect(result.summary.counts.error).toBe(1);
		expect(result.summary.counts.warning).toBe(3);
		expect(result.summary.counts.suggestion).toBe(1);
		expect(result.diagnostics[0]?.code).toBe('vision/chip-wrap');
		expect(result.diagnostics[0]?.source).toBe('vision');
		expect(result.diagnostics[0]?.hint).toMatch(/Badge/);
		expect(result.diagnostics[1]?.code).toBe('vision/low-contrast');
		expect(result.diagnostics[2]?.code).toBe('vision/cramped-layout');
		expect(result.diagnostics[2]?.hint).toMatch(/breathing room/);
		expect(result.diagnostics[3]?.code).toBe('vision/header-rhythm');
		expect(result.diagnostics[3]?.hint).toMatch(/page-header stack/);
		expect(result.diagnostics[4]?.code).toBe('vision/stray-padding');
		expect(result.diagnostics[4]?.hint).toMatch(/asymmetric margins/);
		expect(result.text).toContain('vision/chip-wrap');
		expect(result.text).toContain('vision/cramped-layout');
		expect(result.text).toContain('vision/header-rhythm');
		expect(result.text).toContain('vision/stray-padding');
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
		expect(params.rubricPrompt).toContain('vision/cramped-layout');
		expect(params.rubricPrompt).toContain('visibly squashed together');
		expect(params.rubricPrompt).toContain('vision/header-rhythm');
		expect(params.rubricPrompt).toContain('H1 and subtitle');
		expect(params.rubricPrompt).toContain('vision/stray-padding');
		expect(params.rubricPrompt).toContain('random top padding');
		expect(params.userText).toContain('focus on the hero');
		expect(params.screenshotPath).toBe('/tmp/dryui-vision-test.png');
	});
});
