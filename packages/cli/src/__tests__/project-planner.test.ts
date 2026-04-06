import { afterEach, describe, expect, test } from 'bun:test';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { getAdd, runAdd } from '../commands/add.js';
import { getDetect, runDetect } from '../commands/detect.js';
import { getInstall, runInstall } from '../commands/install.js';

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

function createProject(files: Record<string, string>): string {
	const root = mkdtempSync(resolve(tmpdir(), 'dryui-cli-'));
	tempDirs.push(root);

	for (const [relativePath, contents] of Object.entries(files)) {
		const absolutePath = resolve(root, relativePath);
		mkdirSync(resolve(absolutePath, '..'), { recursive: true });
		writeFileSync(absolutePath, contents);
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

describe('getDetect', () => {
	test('formats project detection text', () => {
		const root = createProject({
			'package.json': JSON.stringify({
				dependencies: {
					'@sveltejs/kit': '^2.0.0',
					svelte: '^5.0.0',
					'@dryui/ui': 'workspace:*'
				}
			}),
			'bun.lock': '',
			'src/app.html': '<html class="theme-auto"></html>',
			'src/routes/+layout.svelte': [
				'<script lang="ts">',
				"  import '@dryui/ui/themes/default.css';",
				"  import '@dryui/ui/themes/dark.css';",
				'</script>'
			].join('\n'),
			'src/routes/+page.svelte': '<h1>Home</h1>'
		});

		const { output, error, exitCode } = getDetect(root, mockSpec);

		expect(exitCode).toBe(0);
		expect(error).toBeNull();
		expect(output).toContain('DryUI project detection');
		expect(output).toContain('Status: ready');
		expect(output).toContain('Framework: sveltekit');
	});

	test('returns raw JSON when requested', () => {
		const root = createProject({
			'package.json': JSON.stringify({
				dependencies: {
					'@sveltejs/kit': '^2.0.0',
					svelte: '^5.0.0',
					'@dryui/ui': 'workspace:*'
				}
			}),
			'src/app.html': '<html class="theme-auto"></html>',
			'src/routes/+layout.svelte': [
				'<script lang="ts">',
				"  import '@dryui/ui/themes/default.css';",
				"  import '@dryui/ui/themes/dark.css';",
				'</script>'
			].join('\n')
		});

		const { output, error, exitCode } = getDetect(root, mockSpec, { json: true });

		expect(exitCode).toBe(0);
		expect(error).toBeNull();
		expect(JSON.parse(output)).toMatchObject({
			framework: 'sveltekit',
			status: 'ready',
			theme: { themeAuto: true }
		});
	});
});

describe('getInstall', () => {
	test('formats an install plan with pending setup steps', () => {
		const root = createProject({
			'package.json': JSON.stringify({
				dependencies: {
					'@sveltejs/kit': '^2.0.0',
					svelte: '^5.0.0'
				}
			}),
			'package-lock.json': '',
			'src/app.html': '<html></html>'
		});

		const { output, error, exitCode } = getInstall(root, mockSpec);

		expect(exitCode).toBe(0);
		expect(error).toBeNull();
		expect(output).toContain('DryUI install plan');
		expect(output).toContain('Install @dryui/ui');
		expect(output).toContain('Create root layout with theme imports');
		expect(output).toContain('Set html theme mode to auto');
	});
});

describe('CLI project planning flow', () => {
	test('detect uses cwd when no path is provided', () => {
		const root = createProject({
			'package.json': JSON.stringify({
				dependencies: {
					'@sveltejs/kit': '^2.0.0',
					svelte: '^5.0.0',
					'@dryui/ui': 'workspace:*'
				}
			}),
			'bun.lock': '',
			'src/app.html': '<html class="theme-auto"></html>',
			'src/routes/+layout.svelte': [
				'<script lang="ts">',
				"  import '@dryui/ui/themes/default.css';",
				"  import '@dryui/ui/themes/dark.css';",
				'</script>'
			].join('\n'),
			'src/routes/+page.svelte': '<h1>Home</h1>'
		});

		const originalCwd = process.cwd();
		process.chdir(root);

		try {
			const cwd = process.cwd();
			const result = captureCommand(() => runDetect([], mockSpec));

			expect(result.exitCode).toBe(0);
			expect(result.errors).toEqual([]);
			expect(result.logs.join('\n')).toContain('DryUI project detection');
			expect(result.logs.join('\n')).toContain(`Input: ${cwd}`);
		} finally {
			process.chdir(originalCwd);
		}
	});

	test('install uses cwd when no path is provided', () => {
		const root = createProject({
			'package.json': JSON.stringify({
				dependencies: {
					'@sveltejs/kit': '^2.0.0',
					svelte: '^5.0.0'
				}
			}),
			'package-lock.json': '',
			'src/app.html': '<html></html>'
		});

		const originalCwd = process.cwd();
		process.chdir(root);

		try {
			const cwd = process.cwd();
			const result = captureCommand(() => runInstall([], mockSpec));

			expect(result.exitCode).toBe(0);
			expect(result.errors).toEqual([]);
			expect(result.logs.join('\n')).toContain('DryUI install plan');
			expect(result.logs.join('\n')).toContain(`Input: ${cwd}`);
		} finally {
			process.chdir(originalCwd);
		}
	});

	test('add project mode accepts an explicit project path', () => {
		const root = createProject({
			'package.json': JSON.stringify({
				dependencies: {
					'@sveltejs/kit': '^2.0.0',
					svelte: '^5.0.0',
					'@dryui/ui': 'workspace:*'
				}
			}),
			'bun.lock': '',
			'src/app.html': '<html class="theme-auto"></html>',
			'src/routes/+layout.svelte': [
				'<script lang="ts">',
				"  import '@dryui/ui/themes/default.css';",
				"  import '@dryui/ui/themes/dark.css';",
				'</script>'
			].join('\n'),
			'src/routes/+page.svelte': '<h1>Home</h1>'
		});

		const result = captureCommand(() => runAdd(['--project', root, 'Card'], mockSpec));

		expect(result.exitCode).toBe(0);
		expect(result.errors).toEqual([]);
		expect(result.logs.join('\n')).toContain('DryUI add plan');
		expect(result.logs.join('\n')).toContain(`Input: ${root}`);
		expect(result.logs.join('\n')).toContain(`Target: ${resolve(root, 'src/routes/+page.svelte')}`);
	});
});

describe('getAdd project mode', () => {
	test('formats a project-aware add plan', () => {
		const root = createProject({
			'package.json': JSON.stringify({
				dependencies: {
					'@sveltejs/kit': '^2.0.0',
					svelte: '^5.0.0',
					'@dryui/ui': 'workspace:*'
				}
			}),
			'bun.lock': '',
			'src/app.html': '<html class="theme-auto"></html>',
			'src/routes/+layout.svelte': [
				'<script lang="ts">',
				"  import '@dryui/ui/themes/default.css';",
				"  import '@dryui/ui/themes/dark.css';",
				'</script>'
			].join('\n'),
			'src/routes/+page.svelte': '<h1>Home</h1>'
		});

		const { output, error, exitCode } = getAdd('Card', mockSpec, {
			project: true,
			subpath: true,
			cwd: root,
			target: 'src/routes/components/card.svelte'
		});

		expect(exitCode).toBe(0);
		expect(error).toBeNull();
		expect(output).toContain('DryUI add plan');
		expect(output).toContain(`Target: ${resolve(root, 'src/routes/components/card.svelte')}`);
		expect(output).toContain("import { Card } from '@dryui/ui/card';");
		expect(output).toContain('Insert component into the target file');
	});

	test('returns JSON for project mode when requested', () => {
		const root = createProject({
			'package.json': JSON.stringify({
				dependencies: {
					'@sveltejs/kit': '^2.0.0',
					svelte: '^5.0.0',
					'@dryui/ui': 'workspace:*'
				}
			}),
			'src/app.html': '<html class="theme-auto"></html>',
			'src/routes/+layout.svelte': [
				'<script lang="ts">',
				"  import '@dryui/ui/themes/default.css';",
				"  import '@dryui/ui/themes/dark.css';",
				'</script>'
			].join('\n'),
			'src/routes/+page.svelte': '<h1>Home</h1>'
		});

		const { output, error, exitCode } = getAdd('Card', mockSpec, {
			project: true,
			json: true,
			cwd: root
		});

		expect(exitCode).toBe(0);
		expect(error).toBeNull();
		expect(JSON.parse(output)).toMatchObject({
			targetType: 'component',
			name: 'Card',
			importStatement: "import { Card } from '@dryui/ui';"
		});
	});
});

describe('getAdd snippet mode', () => {
	test('prints a standalone component snippet when project mode is not requested', () => {
		const { output, error, exitCode } = getAdd('Card', mockSpec);

		expect(exitCode).toBe(0);
		expect(error).toBeNull();
		expect(output).toContain("import { Card } from '@dryui/ui';");
		expect(output).toContain('<Card.Root>');
	});
});
