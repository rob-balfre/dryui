import { describe, expect, test } from 'bun:test';
import { chmod, mkdir, mkdtemp, readFile, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
	applyTheme,
	getInstalledPackageVersion,
	getStarterPageSource,
	resolveShellCommand,
	runInstallPipeline,
	runUpdatePipeline
} from '../../../apps/launcher/server/setup-pipeline.ts';

async function createFileLinkedPackage(
	projectPath: string,
	packageName: string,
	version = '1.0.0'
): Promise<void> {
	const packageDir = join(projectPath, 'node_modules', ...packageName.split('/'));
	await mkdir(join(packageDir, 'src'), { recursive: true });
	await mkdir(join(packageDir, 'dist'), { recursive: true });
	await writeFile(
		join(packageDir, 'package.json'),
		JSON.stringify(
			{
				name: packageName,
				version,
				exports: {
					'.': {
						types: './src/index.ts',
						svelte: './src/index.ts',
						default: './src/index.ts'
					}
				}
			},
			null,
			2
		) + '\n',
		'utf-8'
	);
	await writeFile(join(packageDir, 'src', 'index.ts'), 'export {};\n', 'utf-8');
	await writeFile(join(packageDir, 'dist', 'index.js'), 'export {};\n', 'utf-8');
}

describe('launcher setup pipeline', () => {
	test('resolves an installed package version from the selected project', async () => {
		const projectPath = await mkdtemp(join(tmpdir(), 'dryui-launcher-setup-'));

		try {
			await writeFile(join(projectPath, 'package.json'), '{"name":"fixture"}\n', 'utf-8');
			await mkdir(join(projectPath, 'node_modules', '@dryui', 'ui'), { recursive: true });
			await writeFile(
				join(projectPath, 'node_modules', '@dryui', 'ui', 'package.json'),
				'{"name":"@dryui/ui","version":"1.2.3","exports":{".":"./index.js"}}\n',
				'utf-8'
			);
			await writeFile(
				join(projectPath, 'node_modules', '@dryui', 'ui', 'index.js'),
				'export {};\n',
				'utf-8'
			);

			await expect(getInstalledPackageVersion(projectPath, '@dryui/ui')).resolves.toBe('1.2.3');
		} finally {
			await rm(projectPath, { recursive: true, force: true });
		}
	});

	test('resolves a file-linked package version from node_modules when exports point at source files', async () => {
		const sandboxPath = await mkdtemp(join(tmpdir(), 'dryui-launcher-linked-'));
		const linkedPackagePath = join(sandboxPath, 'feedback-package');
		const projectPath = join(sandboxPath, 'project');

		try {
			await mkdir(join(linkedPackagePath, 'src'), { recursive: true });
			await writeFile(
				join(linkedPackagePath, 'package.json'),
				JSON.stringify(
					{
						name: '@dryui/feedback',
						version: '9.9.9',
						exports: {
							'.': {
								types: './src/index.ts',
								svelte: './src/index.ts',
								default: './src/index.ts'
							}
						}
					},
					null,
					2
				) + '\n',
				'utf-8'
			);
			await writeFile(join(linkedPackagePath, 'src', 'index.ts'), 'export {};\n', 'utf-8');

			await mkdir(join(projectPath, 'node_modules', '@dryui'), { recursive: true });
			await writeFile(join(projectPath, 'package.json'), '{"name":"fixture"}\n', 'utf-8');
			await symlink(linkedPackagePath, join(projectPath, 'node_modules', '@dryui', 'feedback'));

			await expect(getInstalledPackageVersion(projectPath, '@dryui/feedback')).resolves.toBe(
				'9.9.9'
			);
		} finally {
			await rm(sandboxPath, { recursive: true, force: true });
		}
	});

	test('creates a missing project directory before the setup pipeline runs', async () => {
		const events: Array<{ step: string; status: string; output?: string }> = [];
		const sandboxPath = await mkdtemp(join(tmpdir(), 'dryui-launcher-pipeline-'));
		const fakeBinPath = join(sandboxPath, 'bin');
		const missingProjectPath = join(sandboxPath, 'new-project');
		const originalPath = process.env.PATH ?? '';

		try {
			await mkdir(fakeBinPath, { recursive: true });
			await writeFile(join(fakeBinPath, 'npm'), '#!/bin/sh\nexit 0\n', 'utf-8');
			await chmod(join(fakeBinPath, 'npm'), 0o755);
			process.env.PATH = `${fakeBinPath}:${originalPath}`;

			const result = await runInstallPipeline({
				path: missingProjectPath,
				cli: 'codex',
				packageManager: 'npm',
				onProgress: (step, status, output) => {
					events.push({ step, status, output });
				}
			});

			expect(result.success).toBe(false);
			expect(result.failedStep).toBe('install-package');
			expect(events).toEqual([
				{ step: 'scaffold-sveltekit', status: 'running', output: undefined },
				{
					step: 'scaffold-sveltekit',
					status: 'done',
					output: 'Installed Svelte & SvelteKit, created project structure'
				},
				{ step: 'install-package', status: 'running', output: undefined },
				{
					step: 'install-package',
					status: 'failed',
					output:
						'The install command finished, but @dryui/ui is still not resolvable from this project.'
				}
			]);
			await expect(
				readFile(join(missingProjectPath, 'svelte.config.js'), 'utf-8')
			).resolves.toContain('adapter-auto');
			const generatedPage = await readFile(
				join(missingProjectPath, 'src', 'routes', '+page.svelte'),
				'utf-8'
			);
			expect(generatedPage).toContain('Hello, World');
			expect(generatedPage).toContain('Your DryUI project is ready. Start building.');
		} finally {
			process.env.PATH = originalPath;
			await rm(sandboxPath, { recursive: true, force: true });
		}
	});

	test('falls back to the first available shell when the preferred shell path is missing', () => {
		const resolved = resolveShellCommand('/definitely-missing-shell', [
			'/also-missing-shell',
			'/bin/sh'
		]);

		expect(resolved).toEqual({
			command: '/bin/sh',
			args: ['-c']
		});
	});

	test('scaffolds a DryUI starter page that meaningfully exercises the surface', async () => {
		const output = await getStarterPageSource();

		expect(output).toContain(`import { Container, Heading, Text } from '@dryui/ui';`);
		expect(output).toContain('<title>My App</title>');
		expect(output).toContain('<Heading level={1}>Hello, World</Heading>');
		expect(output).toContain('Your DryUI project is ready. Start building.');
	});

	test('applyTheme wires src/theme.css with the correct route-relative import path', async () => {
		const projectPath = await mkdtemp(join(tmpdir(), 'dryui-launcher-theme-'));

		try {
			const layoutPath = join(projectPath, 'src', 'routes', '+layout.svelte');
			await mkdir(join(projectPath, 'src', 'routes'), { recursive: true });
			await writeFile(
				layoutPath,
				`<script>\n  let { children } = $props();\n</script>\n\n{@render children()}\n`,
				'utf-8'
			);

			await applyTheme(
				projectPath,
				':root { --dry-color-bg-base: #fff; }',
				'.theme-dark { --dry-color-bg-base: #000; }'
			);

			const layout = await readFile(layoutPath, 'utf-8');
			expect(layout).toContain(`import '../theme.css';`);
			expect(layout).not.toContain(`import './theme.css';`);
			await expect(readFile(join(projectPath, 'src', 'theme.css'), 'utf-8')).resolves.toContain(
				'--dry-color-bg-base'
			);
		} finally {
			await rm(projectPath, { recursive: true, force: true });
		}
	});

	test('update pipeline uses update semantics for local file-linked DryUI packages and patches src exports to dist', async () => {
		const sandboxPath = await mkdtemp(join(tmpdir(), 'dryui-launcher-update-'));
		const projectPath = join(sandboxPath, 'project');
		const fakeBinPath = join(sandboxPath, 'bin');
		const commandLogPath = join(sandboxPath, 'commands.log');
		const originalPath = process.env.PATH ?? '';

		try {
			await mkdir(fakeBinPath, { recursive: true });
			await writeFile(
				join(fakeBinPath, 'npm'),
				`#!/bin/sh\nprintf "npm:%s\\n" "$*" >> "${commandLogPath}"\nexit 0\n`,
				'utf-8'
			);
			await writeFile(
				join(fakeBinPath, 'codex'),
				`#!/bin/sh\nprintf "codex:%s\\n" "$*" >> "${commandLogPath}"\nexit 0\n`,
				'utf-8'
			);
			await chmod(join(fakeBinPath, 'npm'), 0o755);
			await chmod(join(fakeBinPath, 'codex'), 0o755);
			process.env.PATH = `${fakeBinPath}:${originalPath}`;

			await mkdir(projectPath, { recursive: true });
			await writeFile(join(projectPath, 'package.json'), '{"name":"fixture"}\n', 'utf-8');
			await createFileLinkedPackage(projectPath, '@dryui/primitives', '2.0.0');
			await createFileLinkedPackage(projectPath, '@dryui/ui', '2.0.0');

			const result = await runUpdatePipeline(
				{
					path: projectPath,
					cli: 'codex',
					packageManager: 'npm',
					onProgress: () => {}
				},
				'1.0.0',
				'2.0.0'
			);

			expect(result.success).toBe(true);

			const commandLog = await readFile(commandLogPath, 'utf-8');
			expect(commandLog).toContain('npm:update file:');
			expect(commandLog).toContain('codex:exec --json --skip-git-repo-check');

			const primitivesManifest = await readFile(
				join(projectPath, 'node_modules', '@dryui', 'primitives', 'package.json'),
				'utf-8'
			);
			const uiManifest = await readFile(
				join(projectPath, 'node_modules', '@dryui', 'ui', 'package.json'),
				'utf-8'
			);
			expect(primitivesManifest).toContain('/dist/index.js');
			expect(primitivesManifest).not.toContain('/src/index.ts');
			expect(uiManifest).toContain('/dist/index.js');
			expect(uiManifest).not.toContain('/src/index.ts');
		} finally {
			process.env.PATH = originalPath;
			await rm(sandboxPath, { recursive: true, force: true });
		}
	});
});
