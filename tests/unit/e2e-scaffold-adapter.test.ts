import { afterEach, describe, expect, test } from 'bun:test';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';

import {
	DRYUI_INIT_SKILL_CONTRACT,
	REQUIRED_DRYUI_PACKAGES,
	scaffoldDryuiConsumerProject
} from '../../scripts/e2e/scaffold-adapter.ts';

const tempDirs = new Set<string>();
const repoRoot = resolve(import.meta.dir, '../..');

afterEach(() => {
	for (const dir of tempDirs) {
		rmSync(dir, { recursive: true, force: true });
	}
	tempDirs.clear();
});

function tempDir(name: string): string {
	const dir = resolve(tmpdir(), `dryui-${name}-${crypto.randomUUID()}`);
	mkdirSync(dir, { recursive: true });
	tempDirs.add(dir);
	return dir;
}

function createManifest(
	tarballsDir: string,
	names: readonly string[] = REQUIRED_DRYUI_PACKAGES
): void {
	const packages: Record<string, { version: string; tarball: string }> = {};
	for (const name of names) {
		const tarball = resolve(tarballsDir, `${name.replace('@', '').replace('/', '-')}-1.0.0.tgz`);
		writeFileSync(tarball, '');
		packages[name] = { version: '1.0.0', tarball };
	}
	writeFileSync(
		resolve(tarballsDir, 'manifest.json'),
		JSON.stringify({ generatedAt: '2026-05-05T00:00:00.000Z', packages }, null, 2) + '\n'
	);
}

function read(projectDir: string, path: string): string {
	return readFileSync(resolve(projectDir, path), 'utf8');
}

describe('E2E scaffold Adapter', () => {
	test('stays anchored to the dryui-init golden consumer setup contract', () => {
		const skill = readFileSync(resolve(repoRoot, DRYUI_INIT_SKILL_CONTRACT.sourcePath), 'utf8');

		for (const marker of DRYUI_INIT_SKILL_CONTRACT.requiredSkillMarkers) {
			expect(skill).toContain(marker);
		}
	});

	test('creates a minimal SvelteKit + DryUI consumer from the tarball manifest', () => {
		const projectDir = tempDir('adapter-project');
		const tarballsDir = tempDir('adapter-tarballs');
		const logPath = resolve(tempDir('adapter-logs'), 'scaffold.log');
		createManifest(tarballsDir);

		const result = scaffoldDryuiConsumerProject({
			projectDir,
			tarballsDir,
			logPath,
			install: false
		});

		expect(result.installed).toBe(false);
		expect(result.contractSourcePath).toBe('skills/dryui-init/SKILL.md');
		expect(result.contractAnchor).toBe('golden-consumer-setup-contract');
		expect(result.filesWritten).toContain('src/routes/+layout.svelte');
		expect(result.filesWritten).toContain('src/layout.css');
		expect(existsSync(logPath)).toBe(true);
		expect(readFileSync(logPath, 'utf8')).toContain(
			'contract: skills/dryui-init/SKILL.md#golden-consumer-setup-contract'
		);

		const packageJson = JSON.parse(read(projectDir, 'package.json')) as {
			scripts: Record<string, string>;
			dependencies: Record<string, string>;
			devDependencies: Record<string, string>;
			overrides: Record<string, string>;
		};
		expect(packageJson.scripts).toMatchObject({
			dev: 'vite dev',
			build: 'vite build',
			check: 'svelte-kit sync && svelte-check --tsconfig ./tsconfig.json'
		});
		expect(packageJson.dependencies['@dryui/ui']?.startsWith('file:')).toBe(true);
		expect(packageJson.devDependencies['@dryui/primitives']?.startsWith('file:')).toBe(true);
		expect(packageJson.devDependencies['@dryui/feedback']?.startsWith('file:')).toBe(true);
		expect(packageJson.devDependencies['@dryui/lint']?.startsWith('file:')).toBe(true);
		expect(packageJson.devDependencies['@dryui/feedback-server']?.startsWith('file:')).toBe(true);
		expect(packageJson.overrides['@dryui/ui']).toBe(packageJson.dependencies['@dryui/ui']);
		expect(packageJson.overrides['@dryui/feedback-server']).toBe(
			packageJson.devDependencies['@dryui/feedback-server']
		);

		const svelteConfig = read(projectDir, 'svelte.config.js');
		expect(svelteConfig).toContain("import { dryuiLint } from '@dryui/lint';");
		expect(svelteConfig).toContain(
			"preprocess: [dryuiLint({ strict: true, exclude: ['/.svelte-kit/'] }), vitePreprocess()]"
		);
		expect(svelteConfig).not.toContain('init');

		const viteConfig = read(projectDir, 'vite.config.ts');
		expect(viteConfig).toContain("import { dryuiLayoutCss } from '@dryui/lint';");
		expect(viteConfig.indexOf('dryuiLayoutCss()')).toBeLessThan(viteConfig.indexOf('sveltekit()'));

		const rootLayout = read(projectDir, 'src/routes/+layout.svelte');
		expect(rootLayout).toContain(
			[
				"import '@dryui/ui/themes/default.css';",
				"import '@dryui/ui/themes/dark.css';",
				"import '../app.css';",
				"import '../layout.css';"
			].join('\n\t')
		);
		expect(rootLayout).not.toContain('@dryui/feedback');
		expect(rootLayout).not.toContain('<Feedback');
		expect(read(projectDir, 'src/app.css')).toContain('container-type: inline-size;');
		expect(read(projectDir, 'src/app.css')).toContain('container-name: page;');
		expect(read(projectDir, 'src/routes/+page.svelte')).toContain('@dryui/ui/heading');
	});

	test('fails fast when the manifest does not contain every local DryUI package', () => {
		const projectDir = tempDir('adapter-project');
		const tarballsDir = tempDir('adapter-tarballs');
		createManifest(tarballsDir, ['@dryui/ui', '@dryui/primitives', '@dryui/feedback']);

		expect(() => scaffoldDryuiConsumerProject({ projectDir, tarballsDir, install: false })).toThrow(
			'tarballs manifest is missing @dryui/feedback-server'
		);
	});

	test('refuses to overwrite a non-empty target directory', () => {
		const projectDir = tempDir('adapter-project');
		const tarballsDir = tempDir('adapter-tarballs');
		createManifest(tarballsDir);
		writeFileSync(resolve(projectDir, 'existing.txt'), 'keep me');

		expect(() => scaffoldDryuiConsumerProject({ projectDir, tarballsDir, install: false })).toThrow(
			'E2E scaffold target must be empty'
		);
		expect(read(projectDir, 'existing.txt')).toBe('keep me');
	});
});
