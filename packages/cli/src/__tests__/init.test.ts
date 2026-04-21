import { afterEach, describe, expect, test } from 'bun:test';
import { existsSync, readFileSync, realpathSync } from 'node:fs';
import { join } from 'node:path';
import { runInit } from '../commands/init.js';
import { captureCommandIO, cleanupTempDirs, createTempTree, withCwd } from './helpers.js';

afterEach(cleanupTempDirs);

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
	"\tpreprocess: [dryuiLint({ strict: true, exclude: ['.svelte-kit/', '/dist/'] }), vitePreprocess()]",
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
	test('prints help and exits cleanly', () => {
		const result = captureCommandIO(() => runInit(['--help'], spec));

		expect(result.logs).toEqual([
			'Usage: dryui init [path] [--pm bun|npm|pnpm|yarn]',
			'',
			'Bootstrap a SvelteKit + DryUI project.',
			'',
			'Options:',
			'  [path]           Target directory (default: current directory)',
			'  --pm <manager>   Package manager: bun, npm, pnpm, yarn (auto-detected)'
		]);
		expect(result.errors).toEqual([]);
		expect(result.exitCode).toBe(0);
	});

	test('returns early when DryUI is already set up', () => {
		const root = createTempTree({
			'package.json': packageJson,
			'bun.lock': '',
			'svelte.config.js': readySvelteConfig,
			'src/app.html': '<html lang="en" class="theme-auto"></html>',
			'src/routes/+layout.svelte': readyLayout
		});

		const result = withCwd(root, () => captureCommandIO(() => runInit([], spec)));

		expect(result.errors).toEqual([]);
		expect(result.logs).toEqual(['', '  DryUI is already set up in this project.', '']);
		expect(result.exitCode).toBeNull();
	});

	test('edits app.html, the root layout, and svelte.config in place', () => {
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

		const result = captureCommandIO(() => runInit([root], spec));
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
			"preprocess: [dryuiLint({ strict: true, exclude: ['.svelte-kit/', '/dist/'] }), vitePreprocess()]"
		);
	});

	test('adds theme imports to app.css when the layout already owns app.css', () => {
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

		const result = captureCommandIO(() => runInit([root], spec));
		const appCss = readFileSync(join(root, 'src/app.css'), 'utf8');

		expect(result.errors).toEqual([]);
		expect(result.logs).toContain('  ~ Add theme imports to app.css');
		expect(appCss.startsWith("@import '@dryui/ui/themes/default.css';\n")).toBe(true);
		expect(appCss).toContain("@import '@dryui/ui/themes/dark.css';\nbody { color: tomato; }");
	});

	test('creates a new root layout when one is missing', () => {
		const root = createTempTree({
			'package.json': packageJson,
			'bun.lock': '',
			'svelte.config.js': readySvelteConfig,
			'src/app.html': '<html lang="en" class="theme-auto"></html>'
		});

		const result = captureCommandIO(() => runInit([root], spec));
		const layoutPath = join(root, 'src/routes/+layout.svelte');

		expect(result.errors).toEqual([]);
		expect(result.logs).toContain('  + root layout with theme imports');
		expect(existsSync(layoutPath)).toBe(true);
		expect(readFileSync(layoutPath, 'utf8')).toContain('{@render children()}');
	});

	test('next-steps cd line preserves an absolute path verbatim', () => {
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

		const result = withCwd(cwd, () =>
			captureCommandIO(() => runInit([target, '--pm', 'bun'], spec))
		);

		expect(result.errors).toEqual([]);
		expect(result.logs).toContain(`    cd ${target}`);
		expect(result.logs).toContain('    bun run dev');
	});

	test('next-steps cd line shows the relative path the user typed', () => {
		const root = createTempTree({
			'myapp/package.json': packageJson,
			'myapp/bun.lock': '',
			'myapp/svelte.config.js': readySvelteConfig,
			'myapp/src/app.html': '<html lang="en" class="shell"></html>',
			'myapp/src/routes/+layout.svelte': readyLayout
		});

		const result = withCwd(root, () =>
			captureCommandIO(() => runInit(['myapp', '--pm', 'bun'], spec))
		);

		expect(result.errors).toEqual([]);
		expect(result.logs).toContain('    cd myapp');
		expect(result.logs).toContain('    bun run dev');
	});

	test('next-steps omits the cd line when initializing the current directory', () => {
		const root = createTempTree({
			'package.json': packageJson,
			'bun.lock': '',
			'svelte.config.js': readySvelteConfig,
			'src/app.html': '<html lang="en" class="shell"></html>',
			'src/routes/+layout.svelte': readyLayout
		});

		const result = withCwd(root, () => captureCommandIO(() => runInit(['.', '--pm', 'bun'], spec)));

		expect(result.errors).toEqual([]);
		expect(result.logs.some((line) => line.startsWith('    cd '))).toBe(false);
		expect(result.logs).toContain('    bun run dev');
	});

	test('warns instead of rewriting an unrecognised preprocess shape', () => {
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

		const result = captureCommandIO(() => runInit([root], spec));
		const svelteConfig = readFileSync(join(root, 'svelte.config.js'), 'utf8');

		expect(result.logs).toContain('  Setting up DryUI...');
		expect(result.errors).toEqual([
			`  ? Skipped edit: Wire dryuiLint into svelte.config (manual action needed — unrecognised preprocess shape in ${join(root, 'svelte.config.js')}; add dryuiLint({ strict: true, exclude: ['.svelte-kit/', '/dist/'] }) to the preprocess array manually)`
		]);
		expect(svelteConfig).toBe(weirdConfig);
	});
});
