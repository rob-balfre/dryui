import { afterEach, describe, expect, test } from 'bun:test';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import spec from '../spec.json' assert { type: 'json' };
import { runCheck } from './check.js';

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

	test('a .css path triggers theme diagnosis', () => {
		const root = createProject({
			'theme.css': ':root { --dry-color-fill-brand: 16px; }'
		});

		const output = runCheck(spec, { path: 'theme.css' }, { cwd: root });

		expect(output).toContain('kind: theme');
		expect(output).toContain('coverage:');
		expect(output).toContain('wrong-type');
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
});
