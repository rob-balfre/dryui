import { afterEach, describe, expect, test } from 'bun:test';
import { resolve } from 'node:path';
import { getAdd, runAdd } from '../commands/add.js';
import { getDetect, runDetect } from '../commands/detect.js';
import { getInstall, runInstall } from '../commands/install.js';
import {
	captureCommandIO,
	cleanupTempDirs,
	createTabsMockSpec,
	createTempTree,
	withCwd
} from './helpers.js';

const mockSpec = createTabsMockSpec();

const LINT_WIRED_SVELTE_CONFIG = [
	"import { dryuiLint } from '@dryui/lint';",
	'',
	'export default {',
	'  preprocess: [dryuiLint({ strict: true })]',
	'};'
].join('\n');

const LAYOUT_PLUGIN_VITE_CONFIG = [
	"import { sveltekit } from '@sveltejs/kit/vite';",
	"import { dryuiLayoutCss } from '@dryui/lint';",
	'',
	'export default {',
	'  plugins: [dryuiLayoutCss(), sveltekit()]',
	'};'
].join('\n');

const readyProjectFiles = {
	'package.json': JSON.stringify({
		dependencies: {
			'@sveltejs/kit': '^2.0.0',
			svelte: '^5.0.0',
			'@dryui/ui': 'workspace:*'
		},
		devDependencies: {
			'@dryui/lint': 'workspace:*'
		}
	}),
	'bun.lock': '',
	'svelte.config.js': LINT_WIRED_SVELTE_CONFIG,
	'vite.config.ts': LAYOUT_PLUGIN_VITE_CONFIG,
	'src/app.html': '<html class="theme-auto"></html>',
	'src/layout.css': '',
	'src/routes/+layout.svelte': [
		'<script lang="ts">',
		"  import '@dryui/ui/themes/default.css';",
		"  import '@dryui/ui/themes/dark.css';",
		"  import '../layout.css';",
		'</script>'
	].join('\n'),
	'src/routes/+page.svelte': '<h1>Home</h1>'
};

afterEach(cleanupTempDirs);

describe('getDetect', () => {
	test('formats project detection text', () => {
		const root = createTempTree(readyProjectFiles);

		const { output, error, exitCode } = getDetect(root, mockSpec, 'text');

		expect(exitCode).toBe(0);
		expect(error).toBeNull();
		expect(output).toContain('DryUI project detection');
		expect(output).toContain('Status: ready');
		expect(output).toContain('Framework: sveltekit');
	});

	test('returns raw JSON when requested', () => {
		const root = createTempTree(readyProjectFiles);

		const { output, error, exitCode } = getDetect(root, mockSpec, 'json');

		expect(exitCode).toBe(0);
		expect(error).toBeNull();
		expect(JSON.parse(output)).toMatchObject({
			framework: 'sveltekit',
			status: 'ready',
			theme: { themeAuto: true }
		});
	});

	test('formats nested project auto-discovery when the parent directory is not Svelte', () => {
		const root = createTempTree({
			'package.json': JSON.stringify({
				dependencies: {
					react: '^18.0.0'
				}
			}),
			'package-lock.json': '',
			'hammerfall-dryui/package.json': JSON.stringify({
				dependencies: {
					'@sveltejs/kit': '^2.0.0',
					svelte: '^5.0.0',
					'@dryui/ui': 'workspace:*'
				},
				devDependencies: {
					'@dryui/lint': 'workspace:*'
				}
			}),
			'hammerfall-dryui/bun.lock': '',
			'hammerfall-dryui/svelte.config.js': LINT_WIRED_SVELTE_CONFIG,
			'hammerfall-dryui/vite.config.ts': LAYOUT_PLUGIN_VITE_CONFIG,
			'hammerfall-dryui/src/app.html': '<html class="theme-auto"></html>',
			'hammerfall-dryui/src/layout.css': '',
			'hammerfall-dryui/src/routes/+layout.svelte': [
				'<script lang="ts">',
				"  import '@dryui/ui/themes/default.css';",
				"  import '@dryui/ui/themes/dark.css';",
				"  import '../layout.css';",
				'</script>'
			].join('\n')
		});

		const { output, error, exitCode } = getDetect(root, mockSpec, 'text');

		expect(exitCode).toBe(0);
		expect(error).toBeNull();
		expect(output).toContain('Status: ready');
		expect(output).toContain(`Root: ${resolve(root, 'hammerfall-dryui')}`);
		expect(output).toContain('Auto-selected nested sveltekit project');
	});

	test('scopes nested auto-discovery to the requested subtree in text output', () => {
		const root = createTempTree({
			'package.json': JSON.stringify({
				dependencies: {
					react: '^18.0.0'
				}
			}),
			'apps/docs/package.json': JSON.stringify({
				dependencies: {
					'@sveltejs/kit': '^2.0.0',
					svelte: '^5.0.0',
					'@dryui/ui': 'workspace:*'
				},
				devDependencies: {
					'@dryui/lint': 'workspace:*'
				}
			}),
			'apps/docs/bun.lock': '',
			'apps/docs/svelte.config.js': LINT_WIRED_SVELTE_CONFIG,
			'apps/docs/vite.config.ts': LAYOUT_PLUGIN_VITE_CONFIG,
			'apps/docs/src/app.html': '<html class="theme-auto"></html>',
			'apps/docs/src/layout.css': '',
			'apps/docs/src/routes/+layout.svelte': [
				'<script lang="ts">',
				"  import '@dryui/ui/themes/default.css';",
				"  import '@dryui/ui/themes/dark.css';",
				"  import '../layout.css';",
				'</script>'
			].join('\n'),
			'examples/demo/package.json': JSON.stringify({
				dependencies: {
					'@sveltejs/kit': '^2.0.0',
					svelte: '^5.0.0'
				}
			})
		});

		const { output, error, exitCode } = getDetect(resolve(root, 'apps'), mockSpec, 'text');

		expect(exitCode).toBe(0);
		expect(error).toBeNull();
		expect(output).toContain(`Root: ${resolve(root, 'apps/docs')}`);
		expect(output).not.toContain('Found 2 nested');
	});
});

describe('getInstall', () => {
	test('formats an install plan with pending setup steps', () => {
		const root = createTempTree({
			'package.json': JSON.stringify({
				dependencies: {
					'@sveltejs/kit': '^2.0.0',
					svelte: '^5.0.0'
				}
			}),
			'package-lock.json': '',
			'src/app.html': '<html></html>'
		});

		const { output, error, exitCode } = getInstall(root, mockSpec, 'text');

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
		const root = createTempTree({
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

		withCwd(root, () => {
			const cwd = process.cwd();
			const result = captureCommandIO(() => runDetect(['--text'], mockSpec));

			expect(result.exitCode).toBe(0);
			expect(result.errors).toEqual([]);
			expect(result.logs.join('\n')).toContain('DryUI project detection');
			expect(result.logs.join('\n')).toContain(`Input: ${cwd}`);
		});
	});

	test('install uses cwd when no path is provided', () => {
		const root = createTempTree({
			'package.json': JSON.stringify({
				dependencies: {
					'@sveltejs/kit': '^2.0.0',
					svelte: '^5.0.0'
				}
			}),
			'package-lock.json': '',
			'src/app.html': '<html></html>'
		});

		withCwd(root, () => {
			const cwd = process.cwd();
			const result = captureCommandIO(() => runInstall(['--text'], mockSpec));

			expect(result.exitCode).toBe(0);
			expect(result.errors).toEqual([]);
			expect(result.logs.join('\n')).toContain('DryUI install plan');
			expect(result.logs.join('\n')).toContain(`Input: ${cwd}`);
		});
	});

	test('add project mode accepts an explicit project path', () => {
		const root = createTempTree({
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

		const result = captureCommandIO(() => runAdd(['--project', '--text', root, 'Tabs'], mockSpec));

		expect(result.exitCode).toBe(0);
		expect(result.errors).toEqual([]);
		expect(result.logs.join('\n')).toContain('DryUI add plan');
		expect(result.logs.join('\n')).toContain(`Input: ${root}`);
		expect(result.logs.join('\n')).toContain(`Target: ${resolve(root, 'src/routes/+page.svelte')}`);
	});
});

describe('getAdd project mode', () => {
	test('formats a project-aware add plan', () => {
		const root = createTempTree({
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

		const { output, error, exitCode } = getAdd('Tabs', mockSpec, 'text', {
			project: true,
			subpath: true,
			cwd: root,
			target: 'src/routes/components/tabs.svelte'
		});

		expect(exitCode).toBe(0);
		expect(error).toBeNull();
		expect(output).toContain('DryUI add plan');
		expect(output).toContain(`Target: ${resolve(root, 'src/routes/components/tabs.svelte')}`);
		expect(output).toContain("import { Tabs } from '@dryui/ui/tabs';");
		expect(output).toContain('Insert component into the target file');
	});

	test('returns JSON for project mode when requested', () => {
		const root = createTempTree({
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

		const { output, error, exitCode } = getAdd('Tabs', mockSpec, 'json', {
			project: true,
			cwd: root
		});

		expect(exitCode).toBe(0);
		expect(error).toBeNull();
		expect(JSON.parse(output)).toMatchObject({
			targetType: 'component',
			name: 'Tabs',
			importStatement: "import { Tabs } from '@dryui/ui';"
		});
	});
});

describe('getAdd snippet mode', () => {
	test('prints a standalone component snippet when project mode is not requested', () => {
		const { output, error, exitCode } = getAdd('Tabs', mockSpec, 'text');

		expect(exitCode).toBe(0);
		expect(error).toBeNull();
		expect(output).toContain("import { Tabs } from '@dryui/ui';");
		expect(output).toContain('<Tabs.Root');
	});
});
