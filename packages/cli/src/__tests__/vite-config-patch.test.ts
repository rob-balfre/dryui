import { afterEach, describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
	findViteConfig,
	patchViteConfigFeedbackNoExternal,
	viteConfigHasFeedbackNoExternal
} from '../commands/launch-utils.js';
import { cleanupTempDirs, createTempTree } from './helpers.js';

afterEach(cleanupTempDirs);

const DEFINE_CONFIG_BASE = [
	"import { sveltekit } from '@sveltejs/kit/vite';",
	"import { defineConfig } from 'vite';",
	'',
	'export default defineConfig({',
	'\tplugins: [sveltekit()]',
	'});',
	''
].join('\n');

describe('findViteConfig', () => {
	test('returns the path when vite.config.ts exists', () => {
		const root = createTempTree({ 'vite.config.ts': DEFINE_CONFIG_BASE });
		expect(findViteConfig(root)).toBe(resolve(root, 'vite.config.ts'));
	});

	test('falls through to vite.config.js', () => {
		const root = createTempTree({ 'vite.config.js': DEFINE_CONFIG_BASE });
		expect(findViteConfig(root)).toBe(resolve(root, 'vite.config.js'));
	});

	test('returns null when no config exists', () => {
		const root = createTempTree({ 'package.json': '{}' });
		expect(findViteConfig(root)).toBeNull();
	});
});

const FULL_NO_EXTERNAL = "['@dryui/ui', '@dryui/primitives', '@dryui/feedback', 'lucide-svelte']";

describe('viteConfigHasFeedbackNoExternal', () => {
	test('true when ui, primitives, feedback, and lucide-svelte are all listed', () => {
		const root = createTempTree({
			'vite.config.ts': [
				"import { defineConfig } from 'vite';",
				'',
				'export default defineConfig({',
				`\tssr: { noExternal: ${FULL_NO_EXTERNAL} }`,
				'});'
			].join('\n')
		});
		expect(viteConfigHasFeedbackNoExternal(resolve(root, 'vite.config.ts'))).toBe(true);
	});

	test('false when only @dryui/feedback is listed (lucide-svelte peer missing)', () => {
		const root = createTempTree({
			'vite.config.ts': [
				"import { defineConfig } from 'vite';",
				'',
				'export default defineConfig({',
				"\tssr: { noExternal: ['@dryui/feedback'] }",
				'});'
			].join('\n')
		});
		expect(viteConfigHasFeedbackNoExternal(resolve(root, 'vite.config.ts'))).toBe(false);
	});

	test('false when ssr.noExternal exists but does not list either required package', () => {
		const root = createTempTree({
			'vite.config.ts': [
				"import { defineConfig } from 'vite';",
				'',
				'export default defineConfig({',
				"\tssr: { noExternal: ['other'] }",
				'});'
			].join('\n')
		});
		expect(viteConfigHasFeedbackNoExternal(resolve(root, 'vite.config.ts'))).toBe(false);
	});

	test('false when the config has no ssr block', () => {
		const root = createTempTree({ 'vite.config.ts': DEFINE_CONFIG_BASE });
		expect(viteConfigHasFeedbackNoExternal(resolve(root, 'vite.config.ts'))).toBe(false);
	});
});

describe('patchViteConfigFeedbackNoExternal', () => {
	test('injects ssr.noExternal with the full DryUI set into a defineConfig object that has none', () => {
		const root = createTempTree({ 'vite.config.ts': DEFINE_CONFIG_BASE });
		const configPath = resolve(root, 'vite.config.ts');

		expect(patchViteConfigFeedbackNoExternal(configPath)).toBe(true);

		const updated = readFileSync(configPath, 'utf-8');
		expect(updated).toContain(`ssr: { noExternal: ${FULL_NO_EXTERNAL} }`);
		expect(viteConfigHasFeedbackNoExternal(configPath)).toBe(true);
	});

	test('appends every required package to an existing noExternal array', () => {
		const root = createTempTree({
			'vite.config.ts': [
				"import { defineConfig } from 'vite';",
				'',
				'export default defineConfig({',
				'\tssr: {',
				"\t\tnoExternal: ['other-lib']",
				'\t}',
				'});'
			].join('\n')
		});
		const configPath = resolve(root, 'vite.config.ts');

		expect(patchViteConfigFeedbackNoExternal(configPath)).toBe(true);

		const updated = readFileSync(configPath, 'utf-8');
		expect(updated).toContain("'other-lib'");
		expect(updated).toContain("'@dryui/ui'");
		expect(updated).toContain("'@dryui/primitives'");
		expect(updated).toContain("'@dryui/feedback'");
		expect(updated).toContain("'lucide-svelte'");
	});

	test('only adds the missing entries when some are already listed', () => {
		const root = createTempTree({
			'vite.config.ts': [
				"import { defineConfig } from 'vite';",
				'',
				'export default defineConfig({',
				"\tssr: { noExternal: ['@dryui/feedback'] }",
				'});'
			].join('\n')
		});
		const configPath = resolve(root, 'vite.config.ts');

		expect(patchViteConfigFeedbackNoExternal(configPath)).toBe(true);

		const updated = readFileSync(configPath, 'utf-8');
		expect(updated).toContain("'@dryui/ui'");
		expect(updated).toContain("'@dryui/primitives'");
		expect(updated).toContain("'@dryui/feedback'");
		expect(updated).toContain("'lucide-svelte'");
		// The pre-existing entry is not duplicated.
		expect(updated.match(/@dryui\/feedback/g)?.length).toBe(1);
	});

	test('adds noExternal with the full DryUI set inside an existing ssr object with other fields', () => {
		const root = createTempTree({
			'vite.config.ts': [
				"import { defineConfig } from 'vite';",
				'',
				'export default defineConfig({',
				'\tssr: {',
				'\t\ttarget: "node"',
				'\t}',
				'});'
			].join('\n')
		});
		const configPath = resolve(root, 'vite.config.ts');

		expect(patchViteConfigFeedbackNoExternal(configPath)).toBe(true);

		const updated = readFileSync(configPath, 'utf-8');
		expect(updated).toContain(`noExternal: ${FULL_NO_EXTERNAL}`);
		expect(updated).toContain('target: "node"');
	});

	test('is idempotent when every required package is already listed', () => {
		const original = [
			"import { defineConfig } from 'vite';",
			'',
			'export default defineConfig({',
			`\tssr: { noExternal: ${FULL_NO_EXTERNAL} }`,
			'});'
		].join('\n');
		const root = createTempTree({ 'vite.config.ts': original });
		const configPath = resolve(root, 'vite.config.ts');

		expect(patchViteConfigFeedbackNoExternal(configPath)).toBe(true);
		expect(readFileSync(configPath, 'utf-8')).toBe(original);
	});

	test('creates a minimal vite.config.ts when none exists', () => {
		const root = createTempTree({ 'package.json': '{}' });
		const configPath = resolve(root, 'vite.config.ts');

		expect(patchViteConfigFeedbackNoExternal(configPath)).toBe(true);

		const written = readFileSync(configPath, 'utf-8');
		expect(written).toContain("import { sveltekit } from '@sveltejs/kit/vite';");
		expect(written).toContain(`noExternal: ${FULL_NO_EXTERNAL}`);
		expect(viteConfigHasFeedbackNoExternal(configPath)).toBe(true);
	});

	test('patches a bare export default object with the full DryUI set', () => {
		const root = createTempTree({
			'vite.config.js': ['export default {', '\tplugins: []', '};'].join('\n')
		});
		const configPath = resolve(root, 'vite.config.js');

		expect(patchViteConfigFeedbackNoExternal(configPath)).toBe(true);

		const updated = readFileSync(configPath, 'utf-8');
		expect(updated).toContain(`ssr: { noExternal: ${FULL_NO_EXTERNAL} }`);
	});
});
