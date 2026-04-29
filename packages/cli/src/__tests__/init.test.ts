import { afterAll, afterEach, beforeAll, describe, expect, test } from 'bun:test';
import { existsSync, readFileSync, realpathSync } from 'node:fs';
import { join } from 'node:path';
import { runInit } from '../commands/init.js';
import { captureAsyncCommandIO, cleanupTempDirs, createTempTree, withCwd } from './helpers.js';

afterEach(cleanupTempDirs);

// Tests run inside the DryUI workspace, so runInit's auto-detect sees the
// repo's manifest.json and tries to inject local tarballs into the scaffolded
// project. Suppress that here so tests exercise the published-versions path.
const originalSkipDetect = process.env['DRYUI_SKIP_WORKSPACE_DETECT'];
beforeAll(() => {
	process.env['DRYUI_SKIP_WORKSPACE_DETECT'] = '1';
});
afterAll(() => {
	if (originalSkipDetect === undefined) delete process.env['DRYUI_SKIP_WORKSPACE_DETECT'];
	else process.env['DRYUI_SKIP_WORKSPACE_DETECT'] = originalSkipDetect;
});

interface FeedbackRuntimeStubs {
	installPackage: (options: {
		cwd: string;
		packageManager: string;
		packageNames: string[];
	}) => boolean;
	mountFeedback: (options: { layoutPath: string; serverUrl: string }) => boolean;
	patchViteConfig: (configPath: string) => boolean;
	findViteConfig: (root: string) => string | null;
	isInteractiveTTY: () => boolean;
	promptInstallImpeccable: () => Promise<boolean>;
	installImpeccable: (cwd: string) => boolean;
}

interface FeedbackRuntimeRecorder {
	installCalls: Array<{
		cwd: string;
		packageManager: string;
		packageNames: string[];
	}>;
	mountCalls: Array<{ layoutPath: string; serverUrl: string }>;
	patchCalls: string[];
	impeccablePromptCalls: { count: number };
	impeccableInstallCalls: string[];
	stubs: FeedbackRuntimeStubs;
}

function buildFeedbackRuntime(
	overrides: Partial<FeedbackRuntimeStubs> = {}
): FeedbackRuntimeRecorder {
	const installCalls: FeedbackRuntimeRecorder['installCalls'] = [];
	const mountCalls: FeedbackRuntimeRecorder['mountCalls'] = [];
	const patchCalls: string[] = [];
	const impeccablePromptCalls = { count: 0 };
	const impeccableInstallCalls: string[] = [];
	const stubs: FeedbackRuntimeStubs = {
		installPackage: (options) => {
			installCalls.push({ ...options });
			return true;
		},
		mountFeedback: (options) => {
			mountCalls.push({ ...options });
			return true;
		},
		patchViteConfig: (configPath) => {
			patchCalls.push(configPath);
			return true;
		},
		findViteConfig: (root) => join(root, 'vite.config.ts'),
		isInteractiveTTY: () => false,
		promptInstallImpeccable: async () => {
			impeccablePromptCalls.count += 1;
			return false;
		},
		installImpeccable: (cwd) => {
			impeccableInstallCalls.push(cwd);
			return true;
		},
		...overrides
	};
	return {
		installCalls,
		mountCalls,
		patchCalls,
		impeccablePromptCalls,
		impeccableInstallCalls,
		stubs
	};
}

function scaffoldTestBed(runtimeOverrides: Partial<FeedbackRuntimeStubs> = {}): {
	root: string;
	target: string;
	feedback: FeedbackRuntimeRecorder;
} {
	const root = createTempTree({
		'package.json': JSON.stringify({ private: true, workspaces: ['projects/*'] }),
		'bun.lock': '',
		'projects/smoke/.keep': ''
	});
	const target = realpathSync(join(root, 'projects/smoke'));
	const feedback = buildFeedbackRuntime(runtimeOverrides);
	return { root, target, feedback };
}

function withHome<T>(home: string, run: () => T): T {
	const originalHome = process.env['HOME'];
	process.env['HOME'] = home;

	try {
		return run();
	} finally {
		if (originalHome === undefined) delete process.env['HOME'];
		else process.env['HOME'] = originalHome;
	}
}

const spec = {
	themeImports: {
		default: '@dryui/ui/themes/default.css',
		dark: '@dryui/ui/themes/dark.css'
	},
	components: {}
} as const;

const packageJson = JSON.stringify({
	dependencies: {
		'@dryui/ui': 'workspace:*',
		'@sveltejs/kit': '^2.0.0',
		svelte: '^5.0.0'
	},
	devDependencies: {
		'@dryui/lint': 'workspace:*'
	}
});

const readyLayout = [
	'<script lang="ts">',
	"  import '@dryui/ui/themes/default.css';",
	"  import '@dryui/ui/themes/dark.css';",
	'</script>',
	'',
	'{@render children()}'
].join('\n');

const readySvelteConfig = [
	"import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';",
	"import { dryuiLint } from '@dryui/lint';",
	'',
	'export default {',
	"\tpreprocess: [dryuiLint({ strict: true, exclude: ['.svelte-kit/', '/dist/', 'node_modules/'] }), vitePreprocess()]",
	'};'
].join('\n');

const editableSvelteConfig = [
	"import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';",
	'',
	'export default {',
	'\tpreprocess: vitePreprocess()',
	'};'
].join('\n');

describe('runInit', () => {
	test('prints help and exits cleanly', async () => {
		const result = await captureAsyncCommandIO(() => runInit(['--help'], spec));

		expect(result.logs).toEqual([
			'Usage: dryui init [path] [--pm bun|npm|pnpm|yarn] [--no-launch] [--no-feedback]',
			'',
			'Bootstrap a SvelteKit + DryUI project.',
			'',
			'Options:',
			'  [path]             Target directory (default: current directory)',
			'  --pm <manager>     Package manager: bun, npm, pnpm, yarn (auto-detected)',
			'  --no-launch        Skip launching feedback mode after scaffold',
			'  --no-feedback      Skip installing @dryui/feedback and mounting <Feedback />'
		]);
		expect(result.errors).toEqual([]);
		expect(result.exitCode).toBe(0);
	});

	test('prints help when -h or --help appears after other args', async () => {
		const shortHelp = await captureAsyncCommandIO(() => runInit(['myapp', '-h'], spec));
		const longHelp = await captureAsyncCommandIO(() => runInit(['myapp', '--help'], spec));

		expect(shortHelp.exitCode).toBe(0);
		expect(longHelp.exitCode).toBe(0);
		expect(shortHelp.logs[0]).toBe(
			'Usage: dryui init [path] [--pm bun|npm|pnpm|yarn] [--no-launch] [--no-feedback]'
		);
		expect(longHelp.logs).toEqual(shortHelp.logs);
		expect(shortHelp.errors).toEqual([]);
		expect(longHelp.errors).toEqual([]);
	});

	test('rejects unknown init flags', async () => {
		const result = await captureAsyncCommandIO(() => runInit(['myapp', '--wat'], spec));

		expect(result.logs).toEqual([]);
		expect(result.errors).toEqual(['Error: unknown option: --wat']);
		expect(result.exitCode).toBe(1);
	});

	test('validates --pm values before scaffolding', async () => {
		const missing = await captureAsyncCommandIO(() => runInit(['myapp', '--pm'], spec));
		const flagValue = await captureAsyncCommandIO(() =>
			runInit(['myapp', '--pm', '--no-feedback'], spec)
		);
		const invalid = await captureAsyncCommandIO(() => runInit(['myapp', '--pm', 'deno'], spec));

		expect(missing.logs).toEqual([]);
		expect(flagValue.logs).toEqual([]);
		expect(invalid.logs).toEqual([]);
		expect(missing.errors).toEqual([
			'Error: --pm requires a package manager: bun, npm, pnpm, or yarn'
		]);
		expect(flagValue.errors).toEqual([
			'Error: --pm requires a package manager: bun, npm, pnpm, or yarn'
		]);
		expect(invalid.errors).toEqual(['Error: unknown package manager for --pm: deno']);
		expect(missing.exitCode).toBe(1);
		expect(flagValue.exitCode).toBe(1);
		expect(invalid.exitCode).toBe(1);
	});

	test('returns early when DryUI is already set up', async () => {
		const root = createTempTree({
			'package.json': packageJson,
			'bun.lock': '',
			'svelte.config.js': readySvelteConfig,
			'src/app.html': '<html lang="en" class="theme-auto"></html>',
			'src/routes/+layout.svelte': readyLayout
		});

		const result = await withCwd(root, () => captureAsyncCommandIO(() => runInit([], spec)));

		expect(result.errors).toEqual([]);
		expect(result.logs).toEqual(['', '  DryUI is already set up in this project.', '']);
		expect(result.exitCode).toBeNull();
	});

	test('edits app.html, the root layout, and svelte.config in place', async () => {
		const root = createTempTree({
			'package.json': packageJson,
			'bun.lock': '',
			'svelte.config.js': editableSvelteConfig,
			'src/app.html': '<html lang="en" class="shell"></html>',
			'src/routes/+layout.svelte': [
				'<script lang="ts">',
				'\texport let data;',
				'</script>',
				'',
				'{@render children()}'
			].join('\n')
		});

		const result = await captureAsyncCommandIO(() => runInit([root], spec));
		const layout = readFileSync(join(root, 'src/routes/+layout.svelte'), 'utf8');
		const appHtml = readFileSync(join(root, 'src/app.html'), 'utf8');
		const svelteConfig = readFileSync(join(root, 'svelte.config.js'), 'utf8');

		expect(result.errors).toEqual([]);
		expect(result.logs).toContain('  Setting up DryUI...');
		expect(result.logs).toContain('  ~ Add theme imports to the root layout');
		expect(result.logs).toContain('  ~ Set html theme mode to auto');
		expect(result.logs).toContain('  ~ Wire dryuiLint into svelte.config');
		expect(layout.match(/<script/g)).toHaveLength(1);
		expect(layout).toContain("import '@dryui/ui/themes/default.css';");
		expect(layout).toContain("import '@dryui/ui/themes/dark.css';");
		expect(appHtml).toContain('class="shell theme-auto"');
		expect(svelteConfig).toContain("import { dryuiLint } from '@dryui/lint';");
		expect(svelteConfig).toContain(
			"preprocess: [dryuiLint({ strict: true, exclude: ['.svelte-kit/', '/dist/', 'node_modules/'] }), vitePreprocess()]"
		);
		// In-place edits never trigger feedback setup.
		expect(result.logs.some((line) => line.includes('Setting up @dryui/feedback'))).toBe(false);
	});

	test('adds theme imports to app.css when the layout already owns app.css', async () => {
		const root = createTempTree({
			'package.json': packageJson,
			'bun.lock': '',
			'svelte.config.js': readySvelteConfig,
			'src/app.html': '<html lang="en" class="theme-auto"></html>',
			'src/app.css': 'body { color: tomato; }\n',
			'src/routes/+layout.svelte': [
				'<script lang="ts">',
				"\timport '../app.css';",
				'</script>',
				'',
				'{@render children()}'
			].join('\n')
		});

		const result = await captureAsyncCommandIO(() => runInit([root], spec));
		const appCss = readFileSync(join(root, 'src/app.css'), 'utf8');

		expect(result.errors).toEqual([]);
		expect(result.logs).toContain('  ~ Add theme imports to app.css');
		expect(appCss.startsWith("@import '@dryui/ui/themes/default.css';\n")).toBe(true);
		expect(appCss).toContain("@import '@dryui/ui/themes/dark.css';\nbody { color: tomato; }");
	});

	test('creates a new root layout when one is missing', async () => {
		const root = createTempTree({
			'package.json': packageJson,
			'bun.lock': '',
			'svelte.config.js': readySvelteConfig,
			'src/app.html': '<html lang="en" class="theme-auto"></html>'
		});

		const result = await captureAsyncCommandIO(() => runInit([root], spec));
		const layoutPath = join(root, 'src/routes/+layout.svelte');

		expect(result.errors).toEqual([]);
		expect(result.logs).toContain('  + root layout with theme imports');
		expect(existsSync(layoutPath)).toBe(true);
		expect(readFileSync(layoutPath, 'utf8')).toContain('{@render children()}');
	});

	test('scaffolds an explicit child target without touching the parent workspace root', async () => {
		const rootLayout = [
			'<script lang="ts">',
			"\timport { RootShell } from '$lib/root-shell';",
			'</script>',
			'',
			'<RootShell />'
		].join('\n');
		const rootAppHtml = '<html lang="en" class="workspace-root"></html>';
		const rootSvelteConfig = [
			"import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';",
			'',
			'export default {',
			'\tpreprocess: vitePreprocess()',
			'};'
		].join('\n');
		const root = createTempTree({
			'package.json': JSON.stringify({
				private: true,
				workspaces: ['projects/*']
			}),
			'bun.lock': '',
			'src/app.html': rootAppHtml,
			'src/routes/+layout.svelte': rootLayout,
			'svelte.config.js': rootSvelteConfig,
			'projects/smoke/.keep': ''
		});
		const workspaceRoot = realpathSync(root);
		const target = realpathSync(join(root, 'projects/smoke'));
		const commands: Array<{ command: string; args: readonly string[]; cwd: string }> = [];
		const feedback = buildFeedbackRuntime();

		const result = await withCwd(root, () =>
			captureAsyncCommandIO(() =>
				runInit(['projects/smoke', '--pm', 'bun'], spec, {
					runCommand: (command, args, cwd) => {
						commands.push({ command, args, cwd });
						return true;
					},
					...feedback.stubs
				})
			)
		);

		expect(result.errors).toEqual([]);
		expect(commands).toEqual([
			{
				command: 'bun',
				args: [
					'add',
					'-d',
					'svelte',
					'@sveltejs/kit',
					'@sveltejs/vite-plugin-svelte',
					'@sveltejs/adapter-auto',
					'vite'
				],
				cwd: target
			},
			{ command: 'bun', args: ['add', '@dryui/ui'], cwd: target },
			{ command: 'bun', args: ['add', '-d', '@dryui/lint'], cwd: target }
		]);
		expect(feedback.installCalls).toEqual([
			{
				cwd: target,
				packageManager: 'bun',
				packageNames: ['@dryui/feedback', 'lucide-svelte']
			}
		]);
		expect(feedback.mountCalls).toEqual([
			{
				layoutPath: join(target, 'src/routes/+layout.svelte'),
				serverUrl: 'http://127.0.0.1:4748'
			}
		]);
		expect(feedback.patchCalls).toEqual([join(target, 'vite.config.ts')]);
		expect(result.logs).toContain('  Setting up @dryui/feedback...');
		expect(result.logs).toContain('  + @dryui/feedback + lucide-svelte');
		expect(result.logs).toContain('  ~ Mounted <Feedback /> in src/routes/+layout.svelte');
		expect(result.logs).toContain('  ~ Added @dryui/feedback to ssr.noExternal in vite.config');
		expect(readFileSync(join(workspaceRoot, 'src/app.html'), 'utf8')).toBe(rootAppHtml);
		expect(readFileSync(join(workspaceRoot, 'src/routes/+layout.svelte'), 'utf8')).toBe(rootLayout);
		expect(readFileSync(join(workspaceRoot, 'svelte.config.js'), 'utf8')).toBe(rootSvelteConfig);
		expect(readFileSync(join(target, 'package.json'), 'utf8')).toContain('"name": "my-dryui-app"');
		expect(existsSync(join(target, 'src/routes/+layout.svelte'))).toBe(true);
		expect(readFileSync(join(target, 'src/routes/+layout.svelte'), 'utf8')).toContain(
			'{@render children()}'
		);
	});

	test('--dev-tarballs substitutes package tokens without splitting paths with spaces', async () => {
		const { root, target, feedback } = scaffoldTestBed();
		const uiTarball = join(root, 'packed tarballs/@dryui ui;touch nope.tgz');
		const lintTarball = join(root, 'packed tarballs/@dryui lint.tgz');
		const tarballsDir = createTempTree({
			'manifest.json': JSON.stringify({
				generatedAt: 'test',
				packages: {
					'@dryui/ui': { version: '0.0.0', tarball: uiTarball },
					'@dryui/lint': { version: '0.0.0', tarball: lintTarball }
				}
			})
		});
		const commands: Array<{ command: string; args: readonly string[]; cwd: string }> = [];

		const result = await withCwd(root, () =>
			captureAsyncCommandIO(() =>
				runInit(
					['projects/smoke', '--pm', 'bun', '--dev-tarballs', tarballsDir, '--no-feedback'],
					spec,
					{
						runCommand: (command, args, cwd) => {
							commands.push({ command, args, cwd });
							return true;
						},
						...feedback.stubs
					}
				)
			)
		);

		expect(result.errors).toEqual([]);
		expect(commands).toEqual([
			{
				command: 'bun',
				args: [
					'add',
					'-d',
					'svelte',
					'@sveltejs/kit',
					'@sveltejs/vite-plugin-svelte',
					'@sveltejs/adapter-auto',
					'vite'
				],
				cwd: target
			},
			{ command: 'bun', args: ['add', uiTarball], cwd: target },
			{ command: 'bun', args: ['add', '-d', lintTarball], cwd: target }
		]);

		const writtenPackageJson = JSON.parse(readFileSync(join(target, 'package.json'), 'utf8'));
		// Bare absolute paths (not file: URLs) so the override matches whatever
		// `bun add /abs/path.tgz` writes to dependencies; npm 11 EOVERRIDE only
		// passes when the strings are byte-identical.
		expect(writtenPackageJson.overrides['@dryui/ui']).toBe(uiTarball);
		expect(writtenPackageJson.overrides['@dryui/lint']).toBe(lintTarball);
	});

	test('scaffold launches project feedback mode without prompting', async () => {
		const { root, target, feedback } = scaffoldTestBed({ isInteractiveTTY: () => true });
		const launcherCalls: Array<{ cwd: string; portPromptResult: boolean }> = [];
		let promptCalls = 0;

		const result = await withCwd(root, () =>
			captureAsyncCommandIO(() =>
				runInit(['projects/smoke', '--pm', 'bun'], spec, {
					runCommand: () => true,
					...feedback.stubs,
					promptLaunch: async () => {
						promptCalls++;
						return false;
					},
					promptKillPortHolder: async (holder, port) =>
						holder.pid === 12345 && holder.command === 'node' && port === 5173,
					runLauncher: async (cwd, _spec, launcherRuntime) => {
						launcherCalls.push({
							cwd,
							portPromptResult: await launcherRuntime.promptKillPortHolder(
								{ pid: 12345, command: 'node' },
								5173
							)
						});
					}
				})
			)
		);

		expect(result.errors).toEqual([]);
		expect(promptCalls).toBe(0);
		expect(launcherCalls).toEqual([{ cwd: target, portPromptResult: true }]);
		expect(result.logs).toContain('  Launching project in feedback mode...');
		// After the launcher returns, init still prints the cd hint so the user
		// knows where to go: a child process can't chdir its parent shell.
		expect(result.logs).toContain('  Project ready. To keep working in this project:');
		expect(result.logs).toContain('  Next steps:');
		expect(result.logs).toContain('    cd projects/smoke');
		// The dev command tip is omitted when the launcher already ran.
		expect(result.logs.some((line) => line.includes('bun run dev'))).toBe(false);
	});

	test('scaffold expands ~/ target paths before launching feedback', async () => {
		const home = createTempTree({});
		const root = createTempTree({ 'package.json': JSON.stringify({ private: true }) });
		const feedback = buildFeedbackRuntime({ isInteractiveTTY: () => true });
		const launcherCalls: string[] = [];

		const result = await withHome(home, () =>
			withCwd(root, () =>
				captureAsyncCommandIO(() =>
					runInit(['~/smoke', '--pm', 'bun'], spec, {
						runCommand: () => true,
						...feedback.stubs,
						runLauncher: async (cwd) => {
							launcherCalls.push(cwd);
						}
					})
				)
			)
		);

		expect(result.errors).toEqual([]);
		expect(launcherCalls).toEqual([join(home, 'smoke')]);
		expect(result.logs).toContain('    cd ~/smoke');
		expect(result.logs.some((line) => line.includes('bun run dev'))).toBe(false);
	});

	test('--no-launch falls back to next steps in a TTY', async () => {
		const { root, feedback } = scaffoldTestBed({ isInteractiveTTY: () => true });
		const launcherCalls: string[] = [];

		const result = await withCwd(root, () =>
			captureAsyncCommandIO(() =>
				runInit(['projects/smoke', '--pm', 'bun', '--no-launch'], spec, {
					runCommand: () => true,
					...feedback.stubs,
					runLauncher: async (cwd) => {
						launcherCalls.push(cwd);
					}
				})
			)
		);

		expect(result.errors).toEqual([]);
		expect(launcherCalls).toEqual([]);
		expect(result.logs).toContain('    cd projects/smoke');
		expect(result.logs).toContain('    bun run dev');
		expect(result.logs).toContain(
			'  Tip: run `dryui` in the project to start feedback mode alongside dev.'
		);
	});

	test('--no-launch skips launch even in a TTY', async () => {
		const { root, feedback } = scaffoldTestBed({ isInteractiveTTY: () => true });
		let launcherCalls = 0;

		const result = await withCwd(root, () =>
			captureAsyncCommandIO(() =>
				runInit(['projects/smoke', '--pm', 'bun', '--no-launch'], spec, {
					runCommand: () => true,
					...feedback.stubs,
					runLauncher: async () => {
						launcherCalls++;
					}
				})
			)
		);

		expect(result.errors).toEqual([]);
		expect(launcherCalls).toBe(0);
		expect(result.logs).toContain('    bun run dev');
	});

	test('non-TTY scaffold sets up feedback but does not launch', async () => {
		const { root, feedback } = scaffoldTestBed();
		let launcherCalls = 0;

		const result = await withCwd(root, () =>
			captureAsyncCommandIO(() =>
				runInit(['projects/smoke', '--pm', 'bun'], spec, {
					runCommand: () => true,
					...feedback.stubs,
					runLauncher: async () => {
						launcherCalls++;
					}
				})
			)
		);

		expect(result.errors).toEqual([]);
		expect(launcherCalls).toBe(0);
		expect(feedback.installCalls).toHaveLength(1);
		expect(result.logs).toContain('    bun run dev');
	});

	test('feedback setup is skipped when an install step fails', async () => {
		const { root, feedback } = scaffoldTestBed({ isInteractiveTTY: () => true });

		const result = await withCwd(root, () =>
			captureAsyncCommandIO(() =>
				runInit(['projects/smoke', '--pm', 'bun'], spec, {
					runCommand: () => false,
					...feedback.stubs
				})
			)
		);

		expect(feedback.installCalls).toEqual([]);
		expect(feedback.mountCalls).toEqual([]);
		expect(result.logs.some((line) => line.includes('Setting up @dryui/feedback'))).toBe(false);
	});

	test('--no-feedback skips @dryui/feedback install, mount, and vite patch', async () => {
		const { root, target, feedback } = scaffoldTestBed({ isInteractiveTTY: () => true });
		let launcherCalls = 0;

		const result = await withCwd(root, () =>
			captureAsyncCommandIO(() =>
				runInit(['projects/smoke', '--pm', 'bun', '--no-feedback'], spec, {
					runCommand: () => true,
					...feedback.stubs,
					runLauncher: async () => {
						launcherCalls++;
					}
				})
			)
		);

		expect(result.errors).toEqual([]);
		expect(feedback.installCalls).toEqual([]);
		expect(feedback.mountCalls).toEqual([]);
		expect(feedback.patchCalls).toEqual([]);
		expect(launcherCalls).toBe(0);
		expect(result.logs.some((line) => line.includes('Setting up @dryui/feedback'))).toBe(false);
		expect(result.logs).toContain('    bun run dev');
		const layout = readFileSync(join(target, 'src/routes/+layout.svelte'), 'utf8');
		expect(layout).not.toContain('@dryui/feedback');
		expect(layout).not.toContain('<Feedback');
	});

	test('scaffold writes +layout.svelte with theme CSS imports before app.css', async () => {
		const { root, target, feedback } = scaffoldTestBed();

		const result = await withCwd(root, () =>
			captureAsyncCommandIO(() =>
				runInit(['projects/smoke', '--pm', 'bun', '--no-feedback'], spec, {
					runCommand: () => true,
					...feedback.stubs
				})
			)
		);

		expect(result.errors).toEqual([]);
		const layout = readFileSync(join(target, 'src/routes/+layout.svelte'), 'utf8');
		const defaultThemeIdx = layout.indexOf("'@dryui/ui/themes/default.css'");
		const darkThemeIdx = layout.indexOf("'@dryui/ui/themes/dark.css'");
		const appCssIdx = layout.indexOf("'../app.css'");
		expect(defaultThemeIdx).toBeGreaterThan(-1);
		expect(darkThemeIdx).toBeGreaterThan(-1);
		expect(appCssIdx).toBeGreaterThan(-1);
		// Theme imports must precede app.css so :root token overrides in app.css win.
		expect(defaultThemeIdx).toBeLessThan(appCssIdx);
		expect(darkThemeIdx).toBeLessThan(appCssIdx);
	});

	test('next-steps cd line preserves an absolute path verbatim', async () => {
		// Regression: previously `targetPath.startsWith(process.cwd())` lacked a
		// path-boundary check, so if cwd was `/a` and the user typed `/app`, the
		// displayed path got its `/a` prefix sliced off and `cd pp` was printed.
		// Reproduce that shape here by making the cwd a prefix-sibling of the
		// target (same parent, target name starts with the cwd's name).
		const rawParent = createTempTree({
			'a/.keep': '',
			'app/package.json': packageJson,
			'app/bun.lock': '',
			'app/svelte.config.js': readySvelteConfig,
			'app/src/app.html': '<html lang="en" class="shell"></html>',
			'app/src/routes/+layout.svelte': readyLayout
		});
		// Resolve through /private on macOS so cwd() matches what startsWith saw.
		const parent = realpathSync(rawParent);
		const cwd = join(parent, 'a');
		const target = join(parent, 'app');

		const result = await withCwd(cwd, () =>
			captureAsyncCommandIO(() => runInit([target, '--pm', 'bun'], spec))
		);

		expect(result.errors).toEqual([]);
		expect(result.logs).toContain(`    cd ${target}`);
		expect(result.logs).toContain('    bun run dev');
	});

	test('next-steps cd line shows the relative path the user typed', async () => {
		const root = createTempTree({
			'myapp/package.json': packageJson,
			'myapp/bun.lock': '',
			'myapp/svelte.config.js': readySvelteConfig,
			'myapp/src/app.html': '<html lang="en" class="shell"></html>',
			'myapp/src/routes/+layout.svelte': readyLayout
		});

		const result = await withCwd(root, () =>
			captureAsyncCommandIO(() => runInit(['myapp', '--pm', 'bun'], spec))
		);

		expect(result.errors).toEqual([]);
		expect(result.logs).toContain('    cd myapp');
		expect(result.logs).toContain('    bun run dev');
	});

	test('next-steps omits the cd line when initializing the current directory', async () => {
		const root = createTempTree({
			'package.json': packageJson,
			'bun.lock': '',
			'svelte.config.js': readySvelteConfig,
			'src/app.html': '<html lang="en" class="shell"></html>',
			'src/routes/+layout.svelte': readyLayout
		});

		const result = await withCwd(root, () =>
			captureAsyncCommandIO(() => runInit(['.', '--pm', 'bun'], spec))
		);

		expect(result.errors).toEqual([]);
		expect(result.logs.some((line) => line.startsWith('    cd '))).toBe(false);
		expect(result.logs).toContain('    bun run dev');
	});

	test('warns instead of rewriting an unrecognised preprocess shape', async () => {
		const weirdConfig = [
			'const preprocessor = buildPreprocessor();',
			'',
			'export default {',
			'\tpreprocess: preprocessor',
			'};'
		].join('\n');
		const root = createTempTree({
			'package.json': packageJson,
			'bun.lock': '',
			'svelte.config.js': weirdConfig,
			'src/app.html': '<html lang="en" class="theme-auto"></html>',
			'src/routes/+layout.svelte': readyLayout
		});

		const result = await captureAsyncCommandIO(() => runInit([root], spec));
		const svelteConfig = readFileSync(join(root, 'svelte.config.js'), 'utf8');

		expect(result.logs).toContain('  Setting up DryUI...');
		expect(result.errors).toEqual([
			`  ? Skipped edit: Wire dryuiLint into svelte.config (manual action needed — unrecognised preprocess shape in ${join(root, 'svelte.config.js')}; add dryuiLint({ strict: true, exclude: ['.svelte-kit/', '/dist/', 'node_modules/'] }) to the preprocess array manually)`
		]);
		expect(svelteConfig).toBe(weirdConfig);
	});

	test('scaffold does not prompt for or install impeccable in a TTY', async () => {
		const { root, feedback } = scaffoldTestBed({ isInteractiveTTY: () => true });

		const result = await withCwd(root, () =>
			captureAsyncCommandIO(() =>
				runInit(['projects/smoke', '--pm', 'bun', '--no-feedback', '--no-launch'], spec, {
					runCommand: () => true,
					...feedback.stubs
				})
			)
		);

		expect(result.errors).toEqual([]);
		expect(feedback.impeccablePromptCalls.count).toBe(0);
		expect(feedback.impeccableInstallCalls).toEqual([]);
		expect(result.logs.some((line) => line.includes('impeccable'))).toBe(false);
	});

	test('non-TTY scaffold does not install impeccable silently', async () => {
		const { root, feedback } = scaffoldTestBed();

		const result = await withCwd(root, () =>
			captureAsyncCommandIO(() =>
				runInit(['projects/smoke', '--pm', 'bun', '--no-feedback', '--no-launch'], spec, {
					runCommand: () => true,
					...feedback.stubs
				})
			)
		);

		expect(result.errors).toEqual([]);
		expect(feedback.impeccablePromptCalls.count).toBe(0);
		expect(feedback.impeccableInstallCalls).toEqual([]);
		expect(result.logs.some((line) => line.includes('impeccable'))).toBe(false);
	});

	test('legacy --skip-impeccable flag is accepted as a no-op', async () => {
		const { root, feedback } = scaffoldTestBed({ isInteractiveTTY: () => true });

		const result = await withCwd(root, () =>
			captureAsyncCommandIO(() =>
				runInit(
					['projects/smoke', '--pm', 'bun', '--no-feedback', '--no-launch', '--skip-impeccable'],
					spec,
					{
						runCommand: () => true,
						...feedback.stubs
					}
				)
			)
		);

		expect(result.errors).toEqual([]);
		expect(feedback.impeccablePromptCalls.count).toBe(0);
		expect(feedback.impeccableInstallCalls).toEqual([]);
		expect(result.logs.some((line) => line.includes('impeccable'))).toBe(false);
	});
});
