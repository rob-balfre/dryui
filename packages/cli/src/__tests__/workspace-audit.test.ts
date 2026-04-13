import { afterEach, describe, expect, test } from 'bun:test';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { getDoctor, runDoctor } from '../commands/doctor.js';
import { getLint, runLint } from '../commands/lint.js';

const tempDirs: string[] = [];

const mockSpec = {
	themeImports: {
		default: '@dryui/ui/themes/default.css',
		dark: '@dryui/ui/themes/dark.css'
	},
	components: {
		Card: {
			import: '@dryui/ui',
			description: 'Content surface',
			category: 'display',
			tags: ['surface'],
			compound: true,
			parts: {
				Root: { props: {} }
			},
			cssVars: {},
			dataAttributes: [],
			example: '<Card.Root>\n  <Card.Content>Body</Card.Content>\n</Card.Root>'
		}
	}
} as const;

function createWorkspace(files: Record<string, string>, withGit = false): string {
	const root = mkdtempSync(resolve(tmpdir(), 'dryui-workspace-'));
	tempDirs.push(root);

	for (const [relativePath, contents] of Object.entries(files)) {
		const absolutePath = resolve(root, relativePath);
		mkdirSync(resolve(absolutePath, '..'), { recursive: true });
		writeFileSync(absolutePath, contents);
	}

	if (withGit) {
		execFileSync('git', ['init'], { cwd: root });
		execFileSync('git', ['config', 'user.email', 'dryui@example.com'], { cwd: root });
		execFileSync('git', ['config', 'user.name', 'DryUI'], { cwd: root });
		execFileSync('git', ['add', '.'], { cwd: root });
		execFileSync('git', ['commit', '-m', 'init'], { cwd: root });
	}

	return root;
}

function captureCommand(run: () => void): {
	logs: string[];
	errors: string[];
	exitCode: number | null;
} {
	const logs: string[] = [];
	const errors: string[] = [];
	let exitCode: number | null = null;
	const originalLog = console.log;
	const originalError = console.error;
	const originalExit = process.exit;

	console.log = ((...args: unknown[]) => {
		logs.push(args.map(String).join(' '));
	}) as typeof console.log;
	console.error = ((...args: unknown[]) => {
		errors.push(args.map(String).join(' '));
	}) as typeof console.error;
	process.exit = ((code?: number | string | undefined) => {
		exitCode = typeof code === 'number' ? code : 0;
		throw new Error('exit');
	}) as typeof process.exit;

	try {
		run();
	} catch (error) {
		if (!(error instanceof Error) || error.message !== 'exit') {
			throw error;
		}
	} finally {
		console.log = originalLog;
		console.error = originalError;
		process.exit = originalExit;
	}

	return { logs, errors, exitCode };
}

afterEach(() => {
	for (const dir of tempDirs.splice(0)) {
		rmSync(dir, { recursive: true, force: true });
	}
});

describe('doctor', () => {
	test('formats workspace findings as text', () => {
		const root = createWorkspace({
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
		const root = createWorkspace({
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

		const result = captureCommand(() =>
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
		const root = createWorkspace({
			'apps/docs/package.json': '{'
		});

		const { output, error, exitCode } = getLint(root, mockSpec, 'text', { maxSeverity: 'error' });

		expect(exitCode).toBe(0);
		expect(error).toBeNull();
		expect(output).toContain('No workspace issues found.');
	});

	test('limits changed scans to modified files in a git repo', () => {
		const root = createWorkspace(
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
			true
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
		const root = createWorkspace({
			'apps/docs/src/routes/+page.svelte': [
				'<script lang="ts">',
				"  import { Card } from '@dryui/ui';",
				'</script>',
				'',
				'<Card />'
			].join('\n')
		});

		const result = captureCommand(() => runLint(['--text', '--changed', root], mockSpec));

		expect(result.exitCode).toBe(1);
		expect(result.errors.join('\n')).toContain(
			'The --changed option requires a Git repository with an existing HEAD commit.'
		);
	});
});

describe('doctor command', () => {
	test('runDoctor accepts a path argument', () => {
		const root = createWorkspace({
			'apps/docs/src/routes/+page.svelte': [
				'<script lang="ts">',
				"  import { Card } from '@dryui/ui';",
				'</script>',
				'',
				'<Card />'
			].join('\n')
		});

		const result = captureCommand(() => runDoctor(['--text', root], mockSpec));

		expect(result.exitCode).toBe(0);
		expect(result.errors).toEqual([]);
		expect(result.logs.join('\n')).toContain('DryUI workspace doctor');
	});
});
