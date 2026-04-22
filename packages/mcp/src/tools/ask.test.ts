import { afterEach, describe, expect, test } from 'bun:test';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import spec from '../spec.json' assert { type: 'json' };
import { runAsk } from './ask.js';

const tempDirs: string[] = [];

function createProject(files: Record<string, string>): string {
	const root = mkdtempSync(resolve(tmpdir(), 'dryui-ask-'));
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

describe('runAsk', () => {
	test('component scope surfaces anti-pattern guidance', () => {
		const output = runAsk(spec, { query: 'Input', scope: 'component' });

		expect(output).toContain('kind: component');
		expect(output).toContain('anti-patterns[');
		expect(output).toContain('<input');
	});

	test('component scope only returns anti-patterns for the exact component', () => {
		const output = runAsk(spec, { query: 'Button', scope: 'component' });

		expect(output).toContain('kind: component');
		// Button's own anti-patterns should be present
		expect(output).toContain('<button>');
		// Anti-patterns belonging to other components must NOT leak through the
		// fuzzy search used by `searchComposition`. Previously Button fuzz-matched
		// components like Select, Slider, and NumberInput and showed their
		// anti-patterns under Button's card.
		expect(output).not.toContain('<select>');
		expect(output).not.toContain('<input type="range">');
		expect(output).not.toContain('<input type="number">');
		expect(output).not.toContain('<input type="checkbox">');
	});

	test('recipe scope returns recipe-only guidance', () => {
		const output = runAsk(spec, { query: 'app shell', scope: 'recipe' });

		expect(output).toContain('kind: recipe');
		expect(output).toContain('recipe:app-shell');
		expect(output).not.toContain('kind: component');
	});

	test('recipe scope returns customize-tokens guidance', () => {
		const output = runAsk(spec, { query: 'customize tokens', scope: 'recipe' });

		expect(output).toContain('kind: recipe');
		expect(output).toContain('recipe:customize-tokens');
		// All three strategies (scoped wrapper, directive, .theme.css) should be
		// discoverable in the recipe payload.
		expect(output).toContain('@dryui-theme');
		expect(output).toContain('.theme.css');
	});

	test('list scope can filter to tokens', () => {
		const output = runAsk(spec, { query: '', scope: 'list', kind: 'token' });

		expect(output).toContain('kind: list');
		expect(output).toContain('token,--dry-color-bg-base');
		expect(output).not.toContain('component,');
	});

	test('setup scope returns install guidance for a partial project', () => {
		const root = createProject({
			'package.json': JSON.stringify({
				dependencies: {
					'@sveltejs/kit': '^2.0.0',
					svelte: '^5.0.0'
				}
			})
		});

		const output = runAsk(spec, { query: '', scope: 'setup' }, { cwd: root });

		expect(output).toContain('kind: setup-plan');
		expect(output).toContain('project: partial');
		expect(output).toContain('next[2]:');
		// Plan paths must resolve against the supplied cwd, not the MCP server's
		// process cwd. In a monorepo the fallback would point at the wrong workspace.
		expect(output).toContain(root);
	});

	test('component scope install plan honors the supplied cwd', () => {
		const root = createProject({
			'package.json': JSON.stringify({
				dependencies: {
					'@sveltejs/kit': '^2.0.0',
					svelte: '^5.0.0'
				}
			})
		});

		const output = runAsk(spec, { query: 'Button', scope: 'component' }, { cwd: root });

		expect(output).toContain('kind: component');
		expect(output).toContain('install-plan');
		expect(output).toContain(root);
	});

	test('Heading component scope surfaces the display-font note', () => {
		const output = runAsk(spec, { query: 'Heading', scope: 'component' });

		expect(output).toContain('kind: component');
		// Prop notes block must be rendered so the display font guidance is
		// discoverable without needing to open spec.json by hand.
		expect(output).toContain('prop-notes[');
		expect(output).toContain('--dry-font-display');
		// maxMeasure note should land in the same block.
		expect(output).toContain('maxMeasure');
		expect(output).toContain('22ch');
	});

	test('recipe scope returns narrow-headline guidance', () => {
		const output = runAsk(spec, { query: 'narrow headline', scope: 'recipe' });

		expect(output).toContain('kind: recipe');
		expect(output).toContain('recipe:narrow-headline');
		expect(output).toContain('maxMeasure="narrow"');
	});

	test('recipe scope returns serif-display guidance', () => {
		const output = runAsk(spec, { query: 'serif display', scope: 'recipe' });

		expect(output).toContain('kind: recipe');
		expect(output).toContain('recipe:serif-display');
		expect(output).toContain('--dry-font-display');
		// Description (not just snippet) must warn about :root so readers see
		// the theme-checker gotcha even if the snippet gets truncated.
		expect(output).toContain('never :root');
	});
});
