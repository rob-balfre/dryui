import { afterEach, describe, expect, test } from 'bun:test';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import spec from '../spec.json' assert { type: 'json' };
import { runCheck, runCheckStructured } from './check.js';

const tempDirs: string[] = [];

function createProject(files: Record<string, string>): string {
	const root = mkdtempSync(resolve(tmpdir(), 'dryui-check-'));
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

describe('runCheck', () => {
	test('without a path it scans the workspace', () => {
		const root = createProject({
			'package.json': JSON.stringify({
				dependencies: {
					'@sveltejs/kit': '^2.0.0',
					svelte: '^5.0.0',
					'@dryui/ui': 'workspace:*'
				}
			}),
			'src/routes/+page.svelte': '<Card></Card>'
		});

		const output = runCheck(spec, {}, { cwd: root });

		expect(output).toContain('kind: workspace');
		expect(output).toContain('project/missing-theme-import');
	});

	test('a .svelte path triggers component review', () => {
		const root = createProject({
			'Example.svelte': [
				'<script>',
				"  import { Card } from '@dryui/ui';",
				'</script>',
				'<Card>',
				'  <Card.Content>Body</Card.Content>',
				'</Card>'
			].join('\n')
		});

		const output = runCheck(spec, { path: 'Example.svelte' }, { cwd: root });

		expect(output).toContain('kind: component');
		expect(output).toContain('bare-compound');
	});

	test('a .svelte path accepts BorderBeam from the generated spec', () => {
		const root = createProject({
			'Example.svelte': [
				'<script>',
				"  import { BorderBeam } from '@dryui/ui';",
				'</script>',
				'<BorderBeam size="sm" colorVariant="colorful" borderRadius={8}>Content</BorderBeam>'
			].join('\n')
		});

		const output = runCheck(spec, { path: 'Example.svelte' }, { cwd: root });

		expect(output).toContain('kind: component');
		expect(output).not.toContain('unknown-component');
		expect(output).not.toContain('BorderBeam> is not a known DryUI component');
	});

	test('a .svelte path includes lint-backed component violations', () => {
		const root = createProject({
			'Example.svelte': '<div style="color: red">hello</div>'
		});

		const output = runCheck(spec, { path: 'Example.svelte' }, { cwd: root });

		expect(output).toContain('kind: component');
		expect(output).toContain('dryui/no-inline-style');
	});

	test('a .css path triggers theme diagnosis', () => {
		const root = createProject({
			'theme.css': ':root { --dry-color-fill-brand: 16px; }'
		});

		const output = runCheck(spec, { path: 'theme.css' }, { cwd: root });

		expect(output).toContain('kind: theme');
		expect(output).toContain('coverage:');
		expect(output).toContain('wrong-type');
	});

	test('src/layout.css runs layout lint instead of theme token diagnosis', () => {
		const root = createProject({
			'src/layout.css': '[data-layout] { display: flex; --dry-color-bg-base: 4px; }'
		});

		const output = runCheck(spec, { path: 'src/layout.css' }, { cwd: root });

		expect(output).toContain('kind: layout-css');
		expect(output).toContain('dryui/layout-css-property');
		expect(output).not.toContain('kind: theme');
		expect(output).not.toContain('wrong-type');
	});

	test('runCheckStructured emits enriched diagnostics for component violations', () => {
		const root = createProject({
			'Example.svelte': '<div style="color: red">hello</div>'
		});

		const result = runCheckStructured(spec, { path: 'Example.svelte' }, { cwd: root });

		expect(result.text).toContain('dryui/no-inline-style');
		const inline = result.diagnostics.find((d) => d.code === 'lint/dryui/no-inline-style');
		expect(inline).toBeDefined();
		expect(inline?.source).toBe('lint');
		expect(inline?.severity).toBe('error');
		expect(inline?.file).toMatch(/Example\.svelte$/);
		expect(inline?.hint).toMatch(/custom property/i);
		expect(inline?.docsRef).toMatch(/^https:\/\/dryui\.dev/);
	});

	test('runCheckStructured emits enriched diagnostics for theme violations', () => {
		const root = createProject({
			'theme.css': ':root { --dry-color-fill-brand: 16px; }'
		});

		const result = runCheckStructured(spec, { path: 'theme.css' }, { cwd: root });

		const wrongType = result.diagnostics.find((d) => d.code === 'theme/wrong-type');
		expect(wrongType).toBeDefined();
		expect(wrongType?.source).toBe('theme');
		expect(wrongType?.hint).toBeDefined();
	});

	test('a directory path scopes the workspace scan', () => {
		const root = createProject({
			'package.json': JSON.stringify({
				dependencies: {
					'@sveltejs/kit': '^2.0.0',
					svelte: '^5.0.0',
					'@dryui/ui': 'workspace:*'
				}
			}),
			'apps/example/src/routes/+page.svelte': '<Card></Card>'
		});

		const output = runCheck(spec, { path: 'apps/example' }, { cwd: root });

		expect(output).toContain('kind: workspace');
		expect(output).toContain(`target: ${resolve(root, 'apps/example')}`);
	});

	test('workspace-scope component violations keep hint and docsRef', () => {
		// workspace-audit prefixes component rule ids with `component/`, which
		// must be stripped before enrichDiagnostic so the namespaced code lands
		// on a HINTS key (`lint/dryui/*`).
		const root = createProject({
			'packages/ui/src/thing.svelte': [
				'<div class="thing"></div>',
				'<style>',
				'  .thing { display: flex; }',
				'</style>'
			].join('\n')
		});

		const result = runCheckStructured(spec, {}, { cwd: root });

		const flex = result.diagnostics.find((d) => d.code === 'lint/dryui/no-flex');
		expect(flex).toBeDefined();
		expect(flex?.source).toBe('lint');
		expect(flex?.code).toBe('lint/dryui/no-flex');
		expect(flex?.hint).toBeDefined();
		expect(flex?.hint?.length ?? 0).toBeGreaterThan(0);
		expect(flex?.docsRef).toMatch(/^https:\/\/dryui\.dev/);
	});

	test('runCheckStructured exposes a summary that matches the TOON header', () => {
		const root = createProject({
			'Example.svelte': '<div style="color: red">hello</div>'
		});

		const result = runCheckStructured(spec, { path: 'Example.svelte' }, { cwd: root });

		// JSON summary must match TOON header exactly so the self-correction
		// recipe's stop condition ("diagnostics empty AND hasBlockers=false")
		// reads the same truth from either transport.
		expect(result.summary.hasBlockers).toBe(result.diagnostics.some((d) => d.severity === 'error'));
		expect(result.summary.autoFixable).toBe(
			result.diagnostics.filter((d) => d.autoFixable === true).length
		);

		const toonLine = result.text.split('\n').find((line) => line.startsWith('hasBlockers:'));
		expect(toonLine).toBe(
			`hasBlockers: ${result.summary.hasBlockers} | autoFixable: ${result.summary.autoFixable}`
		);

		// makeFixPair is currently a stub. The honest signal is that no
		// enriched diagnostic ships a structured fix, so autoFixable is 0.
		expect(result.summary.autoFixable).toBe(0);

		expect(result.summary.counts.total).toBe(result.diagnostics.length);
		const expectedErrorCount = result.diagnostics.filter((d) => d.severity === 'error').length;
		expect(result.summary.counts.error).toBe(expectedErrorCount);
	});
});
