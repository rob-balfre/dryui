import { afterEach, describe, expect, test } from 'bun:test';
import { chmodSync, mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { detectProject, planAdd, planInstall, type ProjectPlannerSpec } from './project-planner.js';

const tempDirs: string[] = [];

const mockSpec: ProjectPlannerSpec = {
	themeImports: {
		default: '@dryui/ui/themes/default.css',
		dark: '@dryui/ui/themes/dark.css'
	},
	components: {
		Card: {
			import: '@dryui/ui',
			example: '<Card.Root>\n  <Card.Content>Body</Card.Content>\n</Card.Root>'
		}
	}
};

function createProject(files: Record<string, string>): string {
	const root = mkdtempSync(resolve(tmpdir(), 'dryui-planner-'));
	tempDirs.push(root);
	for (const [relativePath, contents] of Object.entries(files)) {
		const absolutePath = resolve(root, relativePath);
		mkdirSync(resolve(absolutePath, '..'), { recursive: true });
		writeFileSync(absolutePath, contents);
	}
	return root;
}

afterEach(() => {
	for (const dir of tempDirs.splice(0)) {
		rmSync(dir, { recursive: true, force: true });
	}
});

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

describe('detectProject', () => {
	test('detects a configured SvelteKit project', () => {
		const root = createProject({
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
			'src/app.css': '',
			'src/layout.css': '',
			'src/routes/+layout.svelte': [
				'<script lang="ts">',
				"  import '@dryui/ui/themes/default.css';",
				"  import '@dryui/ui/themes/dark.css';",
				"  import '../app.css';",
				"  import '../layout.css';",
				'</script>'
			].join('\n'),
			'src/routes/+page.svelte': '<h1>Home</h1>'
		});

		const result = detectProject(mockSpec, root);

		expect(result.status).toBe('ready');
		expect(result.framework).toBe('sveltekit');
		expect(result.packageManager).toBe('bun');
		expect(result.theme.themeAuto).toBe(true);
		expect(result.theme.defaultImported).toBe(true);
		expect(result.theme.layoutCssImported).toBe(true);
		expect(result.dependencies.lint).toBe(true);
		expect(result.lint.preprocessorWired).toBe(true);
		expect(result.lint.layoutCssPluginWired).toBe(true);
		expect(result.files.svelteConfig).toBe(resolve(root, 'svelte.config.js'));
		expect(result.files.viteConfig).toBe(resolve(root, 'vite.config.ts'));
		expect(result.files.rootPage).toBe(resolve(root, 'src/routes/+page.svelte'));
		expect(result.files.layoutCss).toBe(resolve(root, 'src/layout.css'));
	});

	test('detects @dryui/feedback dependency and a mounted <Feedback /> in the root layout', () => {
		const root = createProject({
			'package.json': JSON.stringify({
				dependencies: {
					'@sveltejs/kit': '^2.0.0',
					svelte: '^5.0.0',
					'@dryui/ui': 'workspace:*',
					'@dryui/feedback': 'workspace:*'
				}
			}),
			'bun.lock': '',
			'src/app.html': '<html class="theme-auto"></html>',
			'src/routes/+layout.svelte': [
				'<script lang="ts">',
				"  import { Feedback } from '@dryui/feedback';",
				'</script>',
				'<Feedback serverUrl="http://localhost:4748" />'
			].join('\n')
		});

		const result = detectProject(mockSpec, root);

		expect(result.dependencies.feedback).toBe(true);
		expect(result.feedback.layoutPath).toBe(resolve(root, 'src/routes/+layout.svelte'));
	});

	test('reports feedback missing when @dryui/feedback is not installed', () => {
		const root = createProject({
			'package.json': JSON.stringify({
				dependencies: {
					'@sveltejs/kit': '^2.0.0',
					svelte: '^5.0.0'
				}
			}),
			'src/routes/+layout.svelte': '<h1>Layout</h1>'
		});

		const result = detectProject(mockSpec, root);

		expect(result.dependencies.feedback).toBe(false);
		expect(result.feedback.layoutPath).toBeNull();
	});

	test('finds a mounted <Feedback /> inside a nested group layout', () => {
		const root = createProject({
			'package.json': JSON.stringify({
				dependencies: {
					'@sveltejs/kit': '^2.0.0',
					svelte: '^5.0.0',
					'@dryui/feedback': 'workspace:*'
				}
			}),
			'src/routes/+layout.svelte': '<slot />',
			'src/routes/(app)/+layout.svelte': [
				'<script>',
				"  import { Feedback } from '@dryui/feedback';",
				'</script>',
				'<Feedback />'
			].join('\n')
		});

		const result = detectProject(mockSpec, root);

		expect(result.dependencies.feedback).toBe(true);
		expect(result.feedback.layoutPath).toBe(resolve(root, 'src/routes/(app)/+layout.svelte'));
	});

	test('inherits the workspace package manager and accepts theme imports from app.css', () => {
		const workspaceRoot = createProject({
			'package.json': JSON.stringify({ private: true }),
			'bun.lock': '',
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
			'apps/docs/svelte.config.js': LINT_WIRED_SVELTE_CONFIG,
			'apps/docs/vite.config.ts': LAYOUT_PLUGIN_VITE_CONFIG,
			'apps/docs/src/app.html': '<html class="theme-auto"></html>',
			'apps/docs/src/layout.css': '',
			'apps/docs/src/app.css': [
				"@import '@dryui/ui/themes/default.css';",
				"@import '@dryui/ui/themes/dark.css';"
			].join('\n'),
			'apps/docs/src/routes/+layout.svelte': [
				'<script lang="ts">',
				"  import '../app.css';",
				"  import '../layout.css';",
				'</script>'
			].join('\n'),
			'apps/docs/src/routes/+page.svelte': '<h1>Home</h1>'
		});

		const result = detectProject(mockSpec, resolve(workspaceRoot, 'apps/docs'));

		expect(result.status).toBe('ready');
		expect(result.packageManager).toBe('bun');
		expect(result.theme.defaultImported).toBe(true);
		expect(result.theme.darkImported).toBe(true);
		expect(result.dependencies.lint).toBe(true);
		expect(result.lint.preprocessorWired).toBe(true);
		expect(result.files.appCss).toBe(resolve(workspaceRoot, 'apps/docs/src/app.css'));
	});

	test('auto-selects a unique nested SvelteKit project from a non-Svelte parent directory', () => {
		const workspaceRoot = createProject({
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

		const result = detectProject(mockSpec, workspaceRoot);

		expect(result.status).toBe('ready');
		expect(result.framework).toBe('sveltekit');
		expect(result.root).toBe(resolve(workspaceRoot, 'hammerfall-dryui'));
		expect(result.packageManager).toBe('bun');
		expect(result.warnings).toContain(
			`Auto-selected nested sveltekit project at ${resolve(workspaceRoot, 'hammerfall-dryui')} because the provided path is not a Svelte/SvelteKit project.`
		);
	});

	test('keeps explicit package.json detection anchored to the provided package file', () => {
		const workspaceRoot = createProject({
			'package.json': JSON.stringify({
				dependencies: {
					react: '^18.0.0'
				}
			}),
			'package-lock.json': '',
			'hammerfall-dryui/package.json': JSON.stringify({
				dependencies: {
					'@sveltejs/kit': '^2.0.0',
					svelte: '^5.0.0'
				}
			})
		});

		const result = detectProject(mockSpec, resolve(workspaceRoot, 'package.json'));

		expect(result.status).toBe('unsupported');
		expect(result.framework).toBe('unknown');
		expect(result.root).toBe(workspaceRoot);
		expect(result.warnings).not.toContain(
			`Auto-selected nested sveltekit project at ${resolve(workspaceRoot, 'hammerfall-dryui')} because the provided path is not a Svelte/SvelteKit project.`
		);
	});

	test('keeps an explicit empty target anchored to the target directory when strictTarget is enabled', () => {
		const workspaceRoot = createProject({
			'package.json': JSON.stringify({
				private: true,
				workspaces: ['projects/*']
			}),
			'bun.lock': '',
			'projects/smoke/.keep': ''
		});

		const target = resolve(workspaceRoot, 'projects/smoke');
		const result = detectProject(mockSpec, target, { strictTarget: true });

		expect(result.status).toBe('unsupported');
		expect(result.framework).toBe('unknown');
		expect(result.root).toBeNull();
		expect(result.packageJsonPath).toBeNull();
		expect(result.warnings).toContain('No package.json found at the provided path.');
	});

	test('warns instead of guessing when multiple nested Svelte projects are present', () => {
		const workspaceRoot = createProject({
			'package.json': JSON.stringify({
				dependencies: {
					react: '^18.0.0'
				}
			}),
			'apps/docs/package.json': JSON.stringify({
				dependencies: {
					'@sveltejs/kit': '^2.0.0',
					svelte: '^5.0.0'
				}
			}),
			'apps/admin/package.json': JSON.stringify({
				dependencies: {
					'@sveltejs/kit': '^2.0.0',
					svelte: '^5.0.0'
				}
			})
		});

		const result = detectProject(mockSpec, workspaceRoot);

		expect(result.status).toBe('unsupported');
		expect(result.framework).toBe('unknown');
		expect(result.root).toBe(workspaceRoot);
		expect(result.warnings).toContain(
			`Found 2 nested SvelteKit projects below ${workspaceRoot}; rerun against the intended app directory.`
		);
	});

	test('survives unreadable descendant directories instead of crashing', () => {
		const workspaceRoot = createProject({
			'package.json': JSON.stringify({
				dependencies: { react: '^18.0.0' }
			}),
			'quarantine/.keep': '',
			'apps/docs/package.json': JSON.stringify({
				dependencies: {
					'@sveltejs/kit': '^2.0.0',
					svelte: '^5.0.0',
					'@dryui/ui': 'workspace:*'
				},
				devDependencies: { '@dryui/lint': 'workspace:*' }
			}),
			'apps/docs/bun.lock': '',
			'apps/docs/svelte.config.js': LINT_WIRED_SVELTE_CONFIG,
			'apps/docs/src/app.html': '<html class="theme-auto"></html>',
			'apps/docs/src/routes/+layout.svelte': [
				'<script lang="ts">',
				"  import '@dryui/ui/themes/default.css';",
				"  import '@dryui/ui/themes/dark.css';",
				'</script>'
			].join('\n')
		});

		const quarantine = resolve(workspaceRoot, 'quarantine');
		chmodSync(quarantine, 0o000);
		try {
			const result = detectProject(mockSpec, workspaceRoot);

			expect(result.framework).toBe('sveltekit');
			expect(result.root).toBe(resolve(workspaceRoot, 'apps/docs'));
		} finally {
			chmodSync(quarantine, 0o755);
		}
	});

	test('scopes descendant auto-discovery to the requested subtree', () => {
		const workspaceRoot = createProject({
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

		const result = detectProject(mockSpec, resolve(workspaceRoot, 'apps'));

		expect(result.status).toBe('ready');
		expect(result.framework).toBe('sveltekit');
		expect(result.root).toBe(resolve(workspaceRoot, 'apps/docs'));
		expect(result.warnings).toContain(
			`Auto-selected nested sveltekit project at ${resolve(workspaceRoot, 'apps/docs')} because the provided path is not a Svelte/SvelteKit project.`
		);
		expect(result.warnings).not.toContain(
			`Found 2 nested Svelte/SvelteKit projects below ${workspaceRoot}; rerun against the intended app directory.`
		);
	});

	test('prefers a nested SvelteKit app over plain Svelte packages', () => {
		const workspaceRoot = createProject({
			'package.json': JSON.stringify({
				dependencies: {
					react: '^18.0.0'
				}
			}),
			'apps/web/package.json': JSON.stringify({
				dependencies: {
					'@sveltejs/kit': '^2.0.0',
					svelte: '^5.0.0',
					'@dryui/ui': 'workspace:*'
				},
				devDependencies: {
					'@dryui/lint': 'workspace:*'
				}
			}),
			'apps/web/bun.lock': '',
			'apps/web/svelte.config.js': LINT_WIRED_SVELTE_CONFIG,
			'apps/web/vite.config.ts': LAYOUT_PLUGIN_VITE_CONFIG,
			'apps/web/src/app.html': '<html class="theme-auto"></html>',
			'apps/web/src/layout.css': '',
			'apps/web/src/routes/+layout.svelte': [
				'<script lang="ts">',
				"  import '@dryui/ui/themes/default.css';",
				"  import '@dryui/ui/themes/dark.css';",
				"  import '../layout.css';",
				'</script>'
			].join('\n'),
			'packages/ui/package.json': JSON.stringify({
				dependencies: {
					svelte: '^5.0.0'
				}
			})
		});

		const result = detectProject(mockSpec, workspaceRoot);

		expect(result.status).toBe('ready');
		expect(result.framework).toBe('sveltekit');
		expect(result.root).toBe(resolve(workspaceRoot, 'apps/web'));
		expect(result.warnings).toContain(
			`Auto-selected nested sveltekit project at ${resolve(workspaceRoot, 'apps/web')} because the provided path is not a Svelte/SvelteKit project.`
		);
	});

	test('flags missing lint preprocessor as partial', () => {
		const root = createProject({
			'package.json': JSON.stringify({
				dependencies: {
					'@sveltejs/kit': '^2.0.0',
					svelte: '^5.0.0',
					'@dryui/ui': 'workspace:*'
				}
			}),
			'bun.lock': '',
			'svelte.config.js': [
				"import adapter from '@sveltejs/adapter-auto';",
				'',
				'export default { kit: { adapter: adapter() } };'
			].join('\n'),
			'src/app.html': '<html class="theme-auto"></html>',
			'src/routes/+layout.svelte': [
				'<script lang="ts">',
				"  import '@dryui/ui/themes/default.css';",
				"  import '@dryui/ui/themes/dark.css';",
				'</script>'
			].join('\n')
		});

		const result = detectProject(mockSpec, root);

		expect(result.status).toBe('partial');
		expect(result.dependencies.lint).toBe(false);
		expect(result.lint.preprocessorWired).toBe(false);
		expect(result.files.svelteConfig).toBe(resolve(root, 'svelte.config.js'));
	});

	test('recognises dryuiLint wiring in svelte.config.ts', () => {
		const root = createProject({
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
			'svelte.config.ts': LINT_WIRED_SVELTE_CONFIG,
			'src/app.html': '<html class="theme-auto"></html>',
			'src/routes/+layout.svelte': [
				'<script lang="ts">',
				"  import '@dryui/ui/themes/default.css';",
				"  import '@dryui/ui/themes/dark.css';",
				'</script>'
			].join('\n')
		});

		const result = detectProject(mockSpec, root);

		expect(result.lint.preprocessorWired).toBe(true);
		expect(result.files.svelteConfig).toBe(resolve(root, 'svelte.config.ts'));
	});
});

describe('planInstall', () => {
	test('produces pending steps for a partial project', () => {
		const root = createProject({
			'package.json': JSON.stringify({
				dependencies: {
					'@sveltejs/kit': '^2.0.0',
					svelte: '^5.0.0'
				}
			}),
			'package-lock.json': '',
			'svelte.config.js': [
				"import adapter from '@sveltejs/adapter-auto';",
				'',
				'export default { kit: { adapter: adapter() } };'
			].join('\n'),
			'vite.config.ts': [
				"import { sveltekit } from '@sveltejs/kit/vite';",
				'',
				'export default { plugins: [sveltekit()] };'
			].join('\n'),
			'src/app.html': '<html></html>'
		});

		const plan = planInstall(mockSpec, root);

		expect(plan.detection.status).toBe('partial');
		expect(plan.steps.map((step) => step.title)).toEqual([
			'Install @dryui/ui',
			'Install @dryui/lint',
			'Create root layout with theme imports',
			'Create layout stylesheet',
			'Set html theme mode to auto',
			'Wire dryuiLint into svelte.config',
			'Wire dryuiLayoutCss into vite.config'
		]);
		expect(plan.steps[0]?.command).toBe('npm install @dryui/ui');
		expect(plan.steps[1]?.command).toBe('npm install -D @dryui/lint');
		expect(plan.steps.at(-2)?.path).toBe(resolve(root, 'svelte.config.js'));
		expect(plan.steps.at(-1)?.path).toBe(resolve(root, 'vite.config.ts'));
	});

	test('edits app.css when the root layout imports it', () => {
		const root = createProject({
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
			'svelte.config.js': LINT_WIRED_SVELTE_CONFIG,
			'vite.config.ts': LAYOUT_PLUGIN_VITE_CONFIG,
			'src/app.html': '<html class="theme-auto"></html>',
			'src/app.css': 'body { margin: 0; }',
			'src/routes/+layout.svelte': [
				'<script lang="ts">',
				"  import '../app.css';",
				'</script>'
			].join('\n')
		});

		const plan = planInstall(mockSpec, root);

		expect(plan.steps.map((step) => step.title)).toEqual([
			'Add theme imports to app.css',
			'Create layout stylesheet',
			'Import layout.css in the root layout'
		]);
		expect(plan.steps[0]?.path).toBe(resolve(root, 'src/app.css'));
	});

	test('scaffold plan creates layout.css and imports it last from the root layout', () => {
		const root = createProject({});
		const plan = planInstall(mockSpec, root, { packageManager: 'bun', strictTarget: true });
		const layoutCssStep = plan.steps.find((step) => step.path === resolve(root, 'src/layout.css'));
		const layoutStep = plan.steps.find(
			(step) => step.path === resolve(root, 'src/routes/+layout.svelte')
		);
		const pageStep = plan.steps.find(
			(step) => step.path === resolve(root, 'src/routes/+page.svelte')
		);

		expect(layoutCssStep?.kind).toBe('create-file');
		expect(layoutStep?.snippet).toContain("import '../layout.css';");
		expect(pageStep?.snippet).toContain(
			"import { Card, Container, Heading, Text } from '@dryui/ui';"
		);
		const viteStep = plan.steps.find((step) => step.path === resolve(root, 'vite.config.ts'));
		expect(viteStep?.snippet).toContain('dryuiLayoutCss()');
		const layout = layoutStep?.snippet ?? '';
		expect(layout.indexOf("'@dryui/ui/themes/default.css'")).toBeLessThan(
			layout.indexOf("'../app.css'")
		);
		expect(layout.indexOf("'../app.css'")).toBeLessThan(layout.indexOf("'../layout.css'"));
	});

	test('emits lint install + wiring steps when both are missing', () => {
		const root = createProject({
			'package.json': JSON.stringify({
				dependencies: {
					'@sveltejs/kit': '^2.0.0',
					svelte: '^5.0.0',
					'@dryui/ui': 'workspace:*'
				}
			}),
			'bun.lock': '',
			'svelte.config.js': [
				"import adapter from '@sveltejs/adapter-auto';",
				'',
				'export default { kit: { adapter: adapter() } };'
			].join('\n'),
			'vite.config.ts': [
				"import { sveltekit } from '@sveltejs/kit/vite';",
				'',
				'export default { plugins: [sveltekit()] };'
			].join('\n'),
			'src/app.html': '<html class="theme-auto"></html>',
			'src/routes/+layout.svelte': [
				'<script lang="ts">',
				"  import '@dryui/ui/themes/default.css';",
				"  import '@dryui/ui/themes/dark.css';",
				'</script>'
			].join('\n')
		});

		const plan = planInstall(mockSpec, root);

		const titles = plan.steps.map((step) => step.title);
		expect(titles).toContain('Install @dryui/lint');
		expect(titles).toContain('Wire dryuiLint into svelte.config');
		expect(titles).toContain('Wire dryuiLayoutCss into vite.config');

		const installStep = plan.steps.find((step) => step.title === 'Install @dryui/lint');
		expect(installStep?.command).toBe('bun add -d @dryui/lint');

		const wireStep = plan.steps.find((step) => step.title === 'Wire dryuiLint into svelte.config');
		expect(wireStep?.kind).toBe('edit-file');
		expect(wireStep?.path).toBe(resolve(root, 'svelte.config.js'));
		const viteStep = plan.steps.find(
			(step) => step.title === 'Wire dryuiLayoutCss into vite.config'
		);
		expect(viteStep?.kind).toBe('edit-file');
		expect(viteStep?.path).toBe(resolve(root, 'vite.config.ts'));
		expect(wireStep?.snippet).toContain("import { dryuiLint } from '@dryui/lint'");
	});

	test('blocks lint wiring when no svelte.config file exists', () => {
		const root = createProject({
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
			'src/app.html': '<html class="theme-auto"></html>',
			'src/routes/+layout.svelte': [
				'<script lang="ts">',
				"  import '@dryui/ui/themes/default.css';",
				"  import '@dryui/ui/themes/dark.css';",
				'</script>'
			].join('\n')
		});

		const plan = planInstall(mockSpec, root);

		const blocked = plan.steps.find((step) => step.title === 'svelte.config not found');
		expect(blocked?.status).toBe('blocked');
	});
});

describe('planAdd', () => {
	test('plans a component insertion into the root page when present', () => {
		const root = createProject({
			'package.json': JSON.stringify({
				dependencies: {
					'@sveltejs/kit': '^2.0.0',
					svelte: '^5.0.0'
				}
			}),
			'src/app.html': '<html></html>',
			'src/routes/+page.svelte': '<h1>Home</h1>'
		});

		const plan = planAdd(mockSpec, 'Card', { cwd: root, subpath: true });

		expect(plan.targetType).toBe('component');
		expect(plan.importStatement).toBe("import { Card } from '@dryui/ui/card';");
		expect(plan.target).toBe(resolve(root, 'src/routes/+page.svelte'));
		expect(plan.steps.at(-1)?.kind).toBe('edit-file');
	});

	test('throws for unknown component', () => {
		const root = createProject({
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
			'svelte.config.js': LINT_WIRED_SVELTE_CONFIG,
			'src/app.html': '<html class="theme-auto"></html>',
			'src/routes/+layout.svelte': [
				'<script lang="ts">',
				"  import '@dryui/ui/themes/default.css';",
				"  import '@dryui/ui/themes/dark.css';",
				'</script>'
			].join('\n')
		});

		expect(() => planAdd(mockSpec, 'NonExistent', { cwd: root })).toThrow('Unknown component');
	});
});
