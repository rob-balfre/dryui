import { describe, expect, test } from 'bun:test';
import {
	DRYUI_SKILLS_INSTALL_COMMAND,
	getSetupDeprecationResult,
	runSetup
} from '../commands/setup.js';
import { captureAsyncCommandIO } from './helpers.js';

describe('setup command', () => {
	test('returns a deterministic deprecation message', () => {
		const result = getSetupDeprecationResult();

		expect(result).toEqual({
			output: [
				'dryui setup is deprecated.',
				'',
				'Setup is now owned by vercel-labs/skills.',
				`Install the DryUI skills with: ${DRYUI_SKILLS_INSTALL_COMMAND}`,
				'',
				'For feedback sessions, run: dryui feedback'
			].join('\n'),
			error: null,
			exitCode: 0
		});
	});

	test('ignores legacy setup flags and prints the same stub', async () => {
		const bare = await captureAsyncCommandIO(() => runSetup([]));
		const legacy = await captureAsyncCommandIO(() =>
			runSetup(['--editor', 'codex', '--install', '--open-feedback'])
		);

		expect(legacy.logs).toEqual(bare.logs);
		expect(legacy.errors).toEqual([]);
		expect(legacy.exitCode).toBe(0);
		expect(legacy.logs[0]).toContain('dryui setup is deprecated.');
		expect(legacy.logs[0]).toContain('npx skills add rob-balfre/dryui');
		expect(legacy.logs[0]).toContain('dryui feedback');
	});
});
