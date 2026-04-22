import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { AGENT_IDS } from '../../packages/mcp/src/docs-surface.ts';

/**
 * `apps/docs/src/lib/ai-setup.ts` ships per-agent editor-setup cards. The
 * canonical agent ID list lives in `@dryui/mcp/docs-surface`. This parity
 * test fails loudly if ai-setup.ts drops an agent the docs-surface promises,
 * or adds a new agent without updating the shared list.
 */

const aiSetupPath = resolve(import.meta.dir, '../../apps/docs/src/lib/ai-setup.ts');
const aiSetupSource = readFileSync(aiSetupPath, 'utf8');

describe('ai-setup ↔ docs-surface parity', () => {
	test('every canonical AGENT_ID has an aiAgentSetups entry', () => {
		for (const id of AGENT_IDS) {
			const marker = `id: '${id}'`;
			expect(
				aiSetupSource.includes(marker),
				`ai-setup.ts is missing an entry for agent "${id}". Add it, or drop the agent from docs-surface.ts AGENT_IDS.`
			).toBe(true);
		}
	});

	test('ai-setup.ts does not reference agent IDs that are not in docs-surface', () => {
		const canonicalSet = new Set<string>(AGENT_IDS);
		const idRegex = /id:\s*'([a-z][a-z0-9-]*)'/g;
		const unknown = new Set<string>();
		for (const match of aiSetupSource.matchAll(idRegex)) {
			const id = match[1];
			if (!canonicalSet.has(id)) unknown.add(id);
		}
		// Not every 'id:' in ai-setup is an agent (some are install steps), so
		// filter out obvious non-agent IDs by length/shape.
		const unknownAgents = [...unknown].filter(
			(id) => id.length <= 20 && !['setup', 'install', 'run'].includes(id)
		);
		// If this fails, ai-setup is naming an agent docs-surface doesn't know
		// about. Either update docs-surface.AGENT_IDS or rename the entry.
		const surprises = unknownAgents.filter(
			(id) => aiSetupSource.includes(`id: '${id}'`) && /[a-z]+-[a-z]+/.test(id)
		);
		expect(surprises, `ai-setup.ts names unknown agent IDs: ${surprises.join(', ')}`).toEqual([]);
	});
});
