import { afterEach, describe, expect, test } from 'bun:test';
import { readFileSync, utimesSync } from 'node:fs';
import { resolve } from 'node:path';
import { ensureClaudeAgents } from '../commands/launch-utils.js';
import { cleanupTempDirs, createTempTree } from './helpers.js';

afterEach(cleanupTempDirs);

describe('ensureClaudeAgents', () => {
	test('refreshes stale copied Claude agents even when the project copy is newer', () => {
		const root = createTempTree({
			'.claude/agents/dryui-layout.md': [
				'---',
				'name: dryui-layout',
				'---',
				'Read the canonical skill at `skills/dryui-layout/SKILL.md`.'
			].join('\n')
		});
		const agentPath = resolve(root, '.claude/agents/dryui-layout.md');
		const future = new Date(Date.now() + 60_000);
		utimesSync(agentPath, future, future);

		const result = ensureClaudeAgents(root);

		expect(result.updated).toContain('dryui-layout.md');
		const content = readFileSync(agentPath, 'utf8');
		expect(content).not.toContain('AreaGrid');
		expect(content).toContain('.claude/skills/dryui-layout/SKILL.md');
		expect(content).not.toContain('packages/ui/skills/dryui-layout/SKILL.md');
	});
});
