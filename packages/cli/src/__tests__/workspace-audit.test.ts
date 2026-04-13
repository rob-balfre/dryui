import { afterEach, describe, expect, test } from 'bun:test';
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { getDoctor, runDoctor } from '../commands/doctor.js';
import { getLint, runLint } from '../commands/lint.js';
import {
	captureCommandIO,
	cleanupTempDirs,
	createCardMockSpec,
	createTempTree
} from './helpers.js';

const mockSpec = createCardMockSpec();

afterEach(cleanupTempDirs);

describe('doctor', () => {
	test('formats workspace findings as text', () => {
		const root = createTempTree({
			'apps/docs/src/routes/+page.svelte': [
				'<script lang="ts">',
				"  import { Card } from '@dryui/ui';",
				'</script>',
				'',
				'<Card />'
			].join('\n')
		});

		const { output, error, exitCode } = getDoctor(root, mockSpec, 'text');

		expect(exitCode).toBe(0);
		expect(error).toBeNull();
		expect(output).toContain('DryUI workspace doctor');
		expect(output).toContain('ERROR [component/bare-compound]');
		expect(output).toContain('apps/docs/src/routes/+page.svelte');
	});
});

describe('lint', () => {
	test('parses include, exclude, json, and max-severity flags', () => {
		const root = createTempTree({
			'apps/docs/package.json': '{',
			'apps/docs/src/routes/+page.svelte': [
				'<script lang="ts">',
				"  import { Card } from '@dryui/ui';",
				'</script>',
				'',
				'<Card />'
			].join('\n'),
			'apps/docs/src/routes/ignored.svelte': [
				'<script lang="ts">',
				"  import { Card } from '@dryui/ui';",
				'</script>',
				'',
				'<Card />'
			].join('\n')
		});

		const result = captureCommandIO(() =>
			runLint(
				[
					'--json',
					'--include',
					'apps/docs/src/routes/+page.svelte',
					'--exclude',
					'apps/docs/src/routes/ignored.svelte',
					'--max-severity',
					'warning',
					root
				],
				mockSpec
			)
		);

		expect(result.exitCode).toBe(1);
		expect(result.errors).toEqual([]);
		const report = JSON.parse(result.logs.join('\n'));
		expect(report.scope).toMatchObject({
			include: ['apps/docs/src/routes/+page.svelte'],
			exclude: ['apps/docs/src/routes/ignored.svelte'],
			changed: false
		});
		expect(report.findings).toHaveLength(1);
		expect(report.findings[0]?.file).toBe('apps/docs/src/routes/+page.svelte');
	});

	test('filters out warning-level findings when max-severity is error', () => {
		const root = createTempTree({
			'apps/docs/package.json': '{'
		});

		const { output, error, exitCode } = getLint(root, mockSpec, 'text', { maxSeverity: 'error' });

		expect(exitCode).toBe(0);
		expect(error).toBeNull();
		expect(output).toContain('No workspace issues found.');
	});

	test('limits changed scans to modified files in a git repo', () => {
		const root = createTempTree(
			{
				'apps/docs/src/routes/+page.svelte': [
					'<script lang="ts">',
					"  import { Card } from '@dryui/ui';",
					'</script>',
					'',
					'<Card />'
				].join('\n'),
				'apps/docs/src/routes/other.svelte': [
					'<script lang="ts">',
					"  import { Card } from '@dryui/ui';",
					'</script>',
					'',
					'<Card />'
				].join('\n')
			},
			{ git: true }
		);

		writeFileSync(
			resolve(root, 'apps/docs/src/routes/+page.svelte'),
			[
				'<script lang="ts">',
				"  import { Card } from '@dryui/ui';",
				'</script>',
				'',
				'<Card />',
				'',
				'<hr />'
			].join('\n')
		);

		const { output, error, exitCode } = getLint(root, mockSpec, 'text', { changed: true });

		expect(exitCode).toBe(1);
		expect(error).toBeNull();
		expect(output).toContain('apps/docs/src/routes/+page.svelte');
		expect(output).not.toContain('apps/docs/src/routes/other.svelte');
	});

	test('runLint reports a git error when changed filtering is requested outside a repo', () => {
		const root = createTempTree({
			'apps/docs/src/routes/+page.svelte': [
				'<script lang="ts">',
				"  import { Card } from '@dryui/ui';",
				'</script>',
				'',
				'<Card />'
			].join('\n')
		});

		const result = captureCommandIO(() => runLint(['--text', '--changed', root], mockSpec));

		expect(result.exitCode).toBe(1);
		expect(result.errors.join('\n')).toContain(
			'The --changed option requires a Git repository with an existing HEAD commit.'
		);
	});
});

describe('doctor command', () => {
	test('runDoctor accepts a path argument', () => {
		const root = createTempTree({
			'apps/docs/src/routes/+page.svelte': [
				'<script lang="ts">',
				"  import { Card } from '@dryui/ui';",
				'</script>',
				'',
				'<Card />'
			].join('\n')
		});

		const result = captureCommandIO(() => runDoctor(['--text', root], mockSpec));

		expect(result.exitCode).toBe(0);
		expect(result.errors).toEqual([]);
		expect(result.logs.join('\n')).toContain('DryUI workspace doctor');
	});
});
