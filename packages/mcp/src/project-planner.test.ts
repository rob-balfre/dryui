import { afterEach, describe, expect, test } from 'bun:test';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
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
	},
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

describe('detectProject', () => {
	test('detects a configured SvelteKit project', () => {
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

		const result = detectProject(mockSpec, root);

		expect(result.status).toBe('ready');
		expect(result.framework).toBe('sveltekit');
		expect(result.packageManager).toBe('bun');
		expect(result.theme.themeAuto).toBe(true);
		expect(result.theme.defaultImported).toBe(true);
		expect(result.files.rootPage).toBe(resolve(root, 'src/routes/+page.svelte'));
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
				}
			}),
			'apps/docs/src/app.html': '<html class="theme-auto"></html>',
			'apps/docs/src/app.css': [
				"@import '@dryui/ui/themes/default.css';",
				"@import '@dryui/ui/themes/dark.css';"
			].join('\n'),
			'apps/docs/src/routes/+layout.svelte': [
				'<script lang="ts">',
				"  import '../app.css';",
				'</script>'
			].join('\n'),
			'apps/docs/src/routes/+page.svelte': '<h1>Home</h1>'
		});

		const result = detectProject(mockSpec, resolve(workspaceRoot, 'apps/docs'));

		expect(result.status).toBe('ready');
		expect(result.packageManager).toBe('bun');
		expect(result.theme.defaultImported).toBe(true);
		expect(result.theme.darkImported).toBe(true);
		expect(result.files.appCss).toBe(resolve(workspaceRoot, 'apps/docs/src/app.css'));
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
			'src/app.html': '<html></html>'
		});

		const plan = planInstall(mockSpec, root);

		expect(plan.detection.status).toBe('partial');
		expect(plan.steps.map((step) => step.title)).toEqual([
			'Install @dryui/ui',
			'Create root layout with theme imports',
			'Set html theme mode to auto'
		]);
		expect(plan.steps[0]?.command).toBe('npm install @dryui/ui');
	});

	test('edits app.css when the root layout imports it', () => {
		const root = createProject({
			'package.json': JSON.stringify({
				dependencies: {
					'@sveltejs/kit': '^2.0.0',
					svelte: '^5.0.0',
					'@dryui/ui': 'workspace:*'
				}
			}),
			'src/app.html': '<html class="theme-auto"></html>',
			'src/app.css': 'body { margin: 0; }',
			'src/routes/+layout.svelte': [
				'<script lang="ts">',
				"  import '../app.css';",
				'</script>'
			].join('\n')
		});

		const plan = planInstall(mockSpec, root);

		expect(plan.steps.map((step) => step.title)).toEqual(['Add theme imports to app.css']);
		expect(plan.steps[0]?.path).toBe(resolve(root, 'src/app.css'));
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

		expect(() => planAdd(mockSpec, 'NonExistent', { cwd: root })).toThrow('Unknown component');
	});
});
