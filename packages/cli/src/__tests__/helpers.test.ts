import { afterEach, describe, expect, test } from 'bun:test';
import { existsSync, readFileSync, realpathSync } from 'node:fs';
import { resolve } from 'node:path';
import { captureCommandIO, cleanupTempDirs, createTempTree, withCwd } from './helpers.js';

afterEach(cleanupTempDirs);

describe('createTempTree', () => {
	test('writes files and can initialize a git repository', () => {
		const root = createTempTree(
			{
				'src/example.txt': 'hello'
			},
			{ git: true }
		);

		expect(readFileSync(resolve(root, 'src/example.txt'), 'utf-8')).toBe('hello');
		expect(existsSync(resolve(root, '.git'))).toBe(true);
	});
});

describe('captureCommandIO', () => {
	test('captures stdout, stderr, and exit code', () => {
		const result = captureCommandIO(() => {
			console.log('ok');
			console.error('bad');
			process.exit(3);
		});

		expect(result.logs).toEqual(['ok']);
		expect(result.errors).toEqual(['bad']);
		expect(result.exitCode).toBe(3);
	});
});

describe('withCwd', () => {
	test('runs a callback in a temporary working directory', () => {
		const root = createTempTree({
			'package.json': '{}'
		});
		const originalCwd = process.cwd();

		const result = withCwd(root, () => process.cwd());

		expect(result).toBe(realpathSync(root));
		expect(process.cwd()).toBe(originalCwd);
	});
});
