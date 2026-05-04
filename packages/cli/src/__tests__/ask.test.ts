import { afterEach, describe, expect, test } from 'bun:test';
import spec from '@dryui/mcp/spec.json';
import { getAskCommandResult, runAskCommand } from '../commands/ask.js';
import { captureCommandIO, cleanupTempDirs, createTempTree, withCwd } from './helpers.js';

afterEach(cleanupTempDirs);

describe('ask command', () => {
	test('returns component guidance for a component query', () => {
		const result = getAskCommandResult(['--scope', 'component', 'Button'], spec, 'toon');

		expect(result.exitCode).toBe(0);
		expect(result.error).toBeNull();
		expect(result.output).toContain('kind: component');
		expect(result.output).toContain('Button');
		expect(result.output).toContain('details:');
	});

	test('returns recipe guidance for a recipe query', () => {
		const result = getAskCommandResult(['--scope', 'recipe', 'app shell'], spec, 'toon');

		expect(result.exitCode).toBe(0);
		expect(result.error).toBeNull();
		expect(result.output).toContain('kind: recipe');
		expect(result.output).toContain('recipe:app-shell');
		expect(result.output).not.toContain('kind: component');
	});

	test('prints CLI-safe follow-up hints', () => {
		const result = getAskCommandResult(['--scope', 'component', 'Button'], spec, 'toon');

		expect(result.exitCode).toBe(0);
		expect(result.output).toContain('dryui ask --scope recipe "button"');
		expect(result.output).toContain('dryui check <file.svelte>');
		expect(result.output).not.toContain('\n  ask --scope');
		expect(result.output).not.toContain('\n  check <file.svelte>');
	});

	test('filters list output to tokens with kind', () => {
		const result = getAskCommandResult(['--scope', 'list', '--kind', 'token'], spec, 'toon');

		expect(result.exitCode).toBe(0);
		expect(result.error).toBeNull();
		expect(result.output).toContain('kind: list');
		expect(result.output).toContain('token,--dry-color-bg-base');
		expect(result.output).not.toContain('component,');
	});

	test('supports setup scope with an empty query', () => {
		const root = createTempTree({
			'package.json': JSON.stringify({
				dependencies: {
					'@sveltejs/kit': '^2.0.0',
					svelte: '^5.0.0'
				}
			})
		});

		const result = withCwd(root, () => getAskCommandResult(['--scope', 'setup', ''], spec, 'toon'));

		expect(result.exitCode).toBe(0);
		expect(result.error).toBeNull();
		expect(result.output).toContain('kind: setup-plan');
		expect(result.output).toContain('project: partial');
		expect(result.output).toContain(root);
	});

	test('rejects invalid scope', () => {
		const result = getAskCommandResult(['--scope', 'unknown', 'Button'], spec, 'toon');

		expect(result.exitCode).toBe(1);
		expect(result.output).toBe('');
		expect(result.error).toContain('invalid-scope');
		expect(result.error).toContain('component, recipe, list, setup');
	});

	test('help output includes examples', () => {
		const result = captureCommandIO(() => runAskCommand(['--help'], spec));
		const help = result.logs.join('\n');

		expect(result.exitCode).toBe(0);
		expect(help).toContain('Examples:');
		expect(help).toContain('dryui ask --scope component Button');
		expect(help).toContain('dryui ask --scope list "" --kind token');
		expect(help).toContain('dryui ask --scope setup ""');
	});
});
