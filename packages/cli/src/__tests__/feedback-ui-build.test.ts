import { afterEach, describe, expect, test } from 'bun:test';
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { ensureFeedbackUiBuilt } from '../commands/feedback-ui-build.js';
import { cleanupTempDirs, createTempTree } from './helpers.js';

afterEach(cleanupTempDirs);

describe('ensureFeedbackUiBuilt', () => {
	test('builds the workspace dashboard when packaged assets are unavailable', () => {
		const workspaceRoot = createTempTree({
			'packages/feedback-server/package.json': '{"name":"@dryui/feedback-server"}'
		});
		let buildCalls = 0;

		const result = ensureFeedbackUiBuilt({
			workspaceRoot,
			runtime: {
				resolvePackagedServerEntry: () => null,
				buildWorkspace(root) {
					buildCalls += 1;
					const uiDir = resolve(root, 'packages/feedback-server/dist/ui');
					mkdirSync(uiDir, { recursive: true });
					writeFileSync(resolve(uiDir, 'index.html'), '<html></html>');
					return {
						status: 0,
						stdout: '',
						stderr: ''
					};
				},
				exists: existsSync
			}
		});

		expect(result).toBeNull();
		expect(buildCalls).toBe(1);
	});

	test('returns an error when the workspace build does not produce dashboard assets', () => {
		const workspaceRoot = createTempTree({
			'packages/feedback-server/package.json': '{"name":"@dryui/feedback-server"}'
		});

		const result = ensureFeedbackUiBuilt({
			workspaceRoot,
			runtime: {
				resolvePackagedServerEntry: () => null,
				buildWorkspace: () => ({
					status: 1,
					stdout: '',
					stderr: 'build failed'
				}),
				exists: existsSync
			}
		});

		expect(result).not.toBeNull();
		expect(result?.error).toContain('Unable to build the feedback dashboard.');
		expect(result?.error).toContain('build failed');
	});
});
