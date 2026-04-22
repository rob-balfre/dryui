import { afterEach, describe, expect, test } from 'bun:test';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { scanWorkspace } from './workspace-audit.js';

const tempDirs: string[] = [];

const mockSpec = {
	themeImports: {
		default: '@dryui/ui/themes/default.css',
		dark: '@dryui/ui/themes/dark.css'
	},
	components: {
		Card: {
			compound: true,
			parts: {
				Root: { props: { as: { type: "'div' | 'button' | 'a'", required: false } } },
				Content: { props: {} }
			},
			cssVars: {
				'--dry-card-bg': 'Card background'
			}
		},
		Avatar: {
			compound: false,
			props: {},
			cssVars: {}
		}
	}
} as const;

function createProject(files: Record<string, string>): string {
	const root = mkdtempSync(resolve(tmpdir(), 'dryui-audit-'));
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

describe('scanWorkspace', () => {
	test('collects project, component, and theme findings', () => {
		const root = createProject({
			'package.json': JSON.stringify({
				dependencies: {
					'@sveltejs/kit': '^2.0.0',
					svelte: '^5.0.0',
					'@dryui/ui': 'workspace:*'
				}
			}),
			'src/app.html': '<html></html>',
			'src/routes/+layout.svelte': [
				'<script lang="ts">',
				"  import '@dryui/ui/themes/default.css';",
				'</script>'
			].join('\n'),
			'src/routes/+page.svelte': [
				'<script lang="ts">',
				"  import { Card } from '@dryui/ui';",
				'</script>',
				'',
				'<Card>',
				'  <Card.Content>Body</Card.Content>',
				'</Card>'
			].join('\n'),
			'src/app.css': ':root { --dry-color-bg-base: 4px; }'
		});

		const report = scanWorkspace(mockSpec, { cwd: root });

		expect(report.projects).toHaveLength(1);
		expect(report.findings.length).toBeGreaterThan(0);
		expect(
			report.findings.some((finding) => finding.ruleId === 'project/missing-theme-import')
		).toBe(true);
		expect(report.findings.some((finding) => finding.ruleId === 'project/missing-theme-auto')).toBe(
			true
		);
		expect(report.findings.some((finding) => finding.ruleId === 'component/bare-compound')).toBe(
			true
		);
		expect(report.findings.some((finding) => finding.ruleId === 'theme/wrong-type')).toBe(true);
	});

	test('filters findings by maxSeverity', () => {
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
			'src/routes/+page.svelte': '<Avatar />',
			'src/app.css': ':root { --dry-color-bg-base: 4px; }'
		});

		const report = scanWorkspace(mockSpec, { cwd: root, maxSeverity: 'error' });

		expect(report.findings.every((finding) => finding.severity === 'error')).toBe(true);
	});

	test('requires git when changed mode is requested', () => {
		const root = createProject({
			'package.json': JSON.stringify({
				dependencies: {
					'@sveltejs/kit': '^2.0.0',
					svelte: '^5.0.0'
				}
			})
		});

		expect(() => scanWorkspace(mockSpec, { cwd: root, changed: true })).toThrow(
			'The --changed option requires a Git repository with an existing HEAD commit.'
		);
	});

	test('surfaces reviewer-backed interactive card wrapper findings in lint output', () => {
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
			'src/routes/+page.svelte': [
				'<script lang="ts">',
				"  import { Card } from '@dryui/ui';",
				'</script>',
				'<div class="submission-card">',
				'  <Card.Root as="button">',
				'    <Card.Content>Open</Card.Content>',
				'  </Card.Root>',
				'</div>',
				'<style>',
				'  .submission-card {',
				'    text-align: left;',
				'  }',
				'</style>'
			].join('\n')
		});

		const report = scanWorkspace(mockSpec, { cwd: root });

		expect(
			report.findings.some((finding) => finding.ruleId === 'component/interactive-card-wrapper')
		).toBe(true);
	});

	test('surfaces lint-backed component findings in workspace output', () => {
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
			'src/routes/+page.svelte': '<div style="color: red">hello</div>'
		});

		const report = scanWorkspace(mockSpec, { cwd: root });

		expect(
			report.findings.some((finding) => finding.ruleId === 'component/dryui/no-inline-style')
		).toBe(true);
	});

	test('surfaces theme-import-order in a +layout.svelte with wrong order', () => {
		const root = createProject({
			'package.json': JSON.stringify({
				dependencies: {
					'@sveltejs/kit': '^2.0.0',
					svelte: '^5.0.0',
					'@dryui/ui': 'workspace:*'
				}
			}),
			'src/app.html': '<html class="theme-auto"></html>',
			'src/app.css': ':root { --dry-color-bg-base: #111; }',
			// Wrong order: local CSS imported before theme CSS.
			'src/routes/+layout.svelte': [
				'<script lang="ts">',
				"  import '../app.css';",
				"  import '@dryui/ui/themes/default.css';",
				"  import '@dryui/ui/themes/dark.css';",
				'</script>',
				'<main>hello</main>'
			].join('\n')
		});

		const report = scanWorkspace(mockSpec, { cwd: root });
		const order = report.findings.filter(
			(finding) => finding.ruleId === 'project/theme-import-order'
		);
		expect(order.length).toBeGreaterThan(0);
		// Autofix should be attached.
		expect(order[0]!.fixable).toBe(true);
		expect(order[0]!.suggestedFixes.length).toBeGreaterThan(0);
		expect(order[0]!.suggestedFixes[0]!.replacement).toContain('@dryui/ui/themes/default.css');
	});

	test('surfaces theme-import-order in a .ts module file with wrong order', () => {
		const root = createProject({
			'package.json': JSON.stringify({
				dependencies: {
					'@sveltejs/kit': '^2.0.0',
					svelte: '^5.0.0',
					'@dryui/ui': 'workspace:*'
				}
			}),
			'src/app.html': '<html class="theme-auto"></html>',
			'src/app.css': ':root { --dry-color-bg-base: #111; }',
			// Wrong order inside a .ts entry file (e.g. a Vite entry).
			'src/entry.ts': ["import '../app.css';", "import '@dryui/ui/themes/default.css';"].join('\n'),
			'src/routes/+layout.svelte': [
				'<script lang="ts">',
				"  import '@dryui/ui/themes/default.css';",
				"  import '@dryui/ui/themes/dark.css';",
				"  import '../app.css';",
				'</script>'
			].join('\n')
		});

		const report = scanWorkspace(mockSpec, { cwd: root });
		const order = report.findings.filter(
			(finding) => finding.ruleId === 'project/theme-import-order'
		);
		expect(order.length).toBe(1);
		expect(order[0]!.file).toContain('src/entry.ts');
	});
});
