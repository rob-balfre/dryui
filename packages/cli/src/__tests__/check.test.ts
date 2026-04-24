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
});
