import { afterEach, describe, expect, test } from 'bun:test';
import spec from '@dryui/mcp/spec.json';
import { getCheckCommandResult } from '../commands/check.js';
import { cleanupTempDirs, createTempTree } from './helpers.js';

afterEach(cleanupTempDirs);

describe('check command', () => {
	test('validates a Svelte file through the static checker', async () => {
		const root = createTempTree({
			'Example.svelte': '<div style="color: red">hello</div>'
		});

		const result = await getCheckCommandResult(['Example.svelte', '--cwd', root], spec, 'toon');

		expect(result.exitCode).toBe(1);
		expect(result.error).toBeNull();
		expect(result.output).toContain('kind: component');
		expect(result.output).toContain('dryui/no-inline-style');
	});

	test('emits structured JSON for static checks', async () => {
		const root = createTempTree({
			'Example.svelte': '<div style="color: red">hello</div>'
		});

		const result = await getCheckCommandResult(
			['Example.svelte', '--cwd', root, '--json'],
			spec,
			'json'
		);
		const parsed = JSON.parse(result.output);

		expect(parsed.summary.hasBlockers).toBe(true);
		expect(
			parsed.diagnostics.some((d: { code: string }) => d.code === 'lint/dryui/no-inline-style')
		).toBe(true);
	});

	test('routes --visual to the visual checker', async () => {
		const result = await getCheckCommandResult(
			['--visual', 'http://localhost:5173/dashboard', '--viewport=800x600'],
			spec,
			'toon',
			{
				runVisual: async (input) => ({
					text: `kind: vision\ntarget: ${input.url}`,
					findings: [],
					diagnostics: [],
					screenshotPath: '/tmp/dryui-vision-test.png',
					summary: { hasBlockers: false, counts: { error: 0, warning: 0, suggestion: 0 } }
				})
			}
		);

		expect(result.exitCode).toBe(0);
		expect(result.output).toContain('kind: vision');
		expect(result.output).toContain('http://localhost:5173/dashboard');
	});

	test('routes --design to the visual checker as a design brief path', async () => {
		const root = createTempTree({ 'DESIGN.md': '# DESIGN.md\n' });
		const calls: unknown[] = [];

		const result = await getCheckCommandResult(
			['--visual', 'http://localhost:5173/dashboard', '--cwd', root, '--design', 'DESIGN.md'],
			spec,
			'toon',
			{
				runVisual: async (input) => {
					calls.push(input);
					return {
						text: `kind: vision\ntarget: ${input.url}`,
						findings: [],
						diagnostics: [],
						screenshotPath: '/tmp/dryui-vision-test.png',
						summary: { hasBlockers: false, counts: { error: 0, warning: 0, suggestion: 0 } }
					};
				}
			}
		);

		expect(result.exitCode).toBe(0);
		expect(calls[0]).toMatchObject({
			url: 'http://localhost:5173/dashboard',
			designPath: 'DESIGN.md'
		});
	});

	test('requires a visual URL when --visual is present', async () => {
		const result = await getCheckCommandResult(['--visual'], spec, 'toon');

		expect(result.exitCode).toBe(1);
		expect(result.error).toContain('missing-visual-url');
		expect(result.output).toBe('');
	});
});
