import { afterEach, describe, expect, test } from 'bun:test';
import spec from '@dryui/mcp/spec.json';
import { getCheckCommandResult } from '../commands/check.js';
import { cleanupTempDirs, createTempTree } from './helpers.js';

afterEach(cleanupTempDirs);

describe('check command', () => {
	const cleanSummary = {
		hasBlockers: false,
		autoFixable: 0,
		counts: { error: 0, warning: 0, suggestion: 0, info: 0, total: 0 }
	};

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

	test('prints CLI-safe follow-up hints in text output', async () => {
		const result = await getCheckCommandResult([], spec, 'toon', {
			runStatic: () => ({
				text: [
					'kind: workspace',
					'',
					'next[3]:',
					'  ask --scope setup "" -- inspect setup status',
					'  check src/routes/+page.svelte -- rerun validation',
					'hint: Run ask --scope list --kind token to browse tokens'
				].join('\n'),
				diagnostics: [],
				summary: cleanSummary
			})
		});

		expect(result.output).toContain('dryui ask --scope setup ""');
		expect(result.output).toContain('dryui check src/routes/+page.svelte');
		expect(result.output).toContain('Run dryui ask --scope list --kind token');
		expect(result.output).not.toContain('\n  ask --scope');
		expect(result.output).not.toContain('\n  check src/routes/+page.svelte');
		expect(result.output).not.toContain('Run ask --scope');
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
});
