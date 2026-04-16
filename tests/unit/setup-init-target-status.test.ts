import { afterEach, describe, expect, test } from 'bun:test';
import { mkdirSync, realpathSync } from 'node:fs';
import { resolve } from 'node:path';

import { getInitTargetStatus } from '../../packages/cli/src/commands/setup.js';
import {
	cleanupTempDirs,
	createTempTree,
	withCwd
} from '../../packages/cli/src/__tests__/helpers.js';

afterEach(cleanupTempDirs);

describe('getInitTargetStatus', () => {
	test('returns an error for existing file targets', () => {
		const root = createTempTree({
			'package.json': '{}',
			'existing.txt': 'hello'
		});

		const status = withCwd(root, () => getInitTargetStatus('existing.txt'));
		const targetPath = realpathSync(resolve(root, 'existing.txt'));

		expect(status).toEqual({
			kind: 'error',
			message: `Target ${targetPath} already exists as a file. Choose a new directory path.`
		});
	});

	test('returns a confirmation for non-empty directories', () => {
		const root = createTempTree({
			'package.json': '{}',
			'app/package.json': '{}'
		});

		const status = withCwd(root, () => getInitTargetStatus('app'));
		const targetPath = realpathSync(resolve(root, 'app'));

		expect(status).toEqual({
			kind: 'confirm',
			message: `Target ${targetPath} already exists and is not empty. Continue?`
		});
	});

	test('returns no status for empty directories', () => {
		const root = createTempTree({
			'package.json': '{}'
		});

		const status = withCwd(root, () => {
			const target = resolve(root, 'empty-dir');
			mkdirSync(target, { recursive: true });
			return getInitTargetStatus('empty-dir');
		});

		expect(status).toBeNull();
	});
});
