import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { DISPATCH_DOCS_AGENT_IDS } from '../../packages/feedback-server/src/dispatch/agents.ts';

/**
 * `apps/docs/src/lib/ai-setup.ts` ships per-agent editor-setup cards.
 * `DISPATCH_DOCS_AGENT_IDS` is the canonical list. These parity tests fail
 * loudly when ai-setup.ts drifts away from that list.
 */

const aiSetupPath = resolve(import.meta.dir, '../../apps/docs/src/lib/ai-setup.ts');
const aiSetupSource = readFileSync(aiSetupPath, 'utf8');

describe('ai-setup ↔ dispatch docs agents parity', () => {
	test('every canonical AGENT_ID has an aiAgentSetups entry', () => {
		for (const id of DISPATCH_DOCS_AGENT_IDS) {
			const marker = `id: '${id}'`;
			expect(
				aiSetupSource.includes(marker),
				`ai-setup.ts is missing an entry for agent "${id}". Add it, or drop the agent from DISPATCH_DOCS_AGENT_IDS.`
			).toBe(true);
		}
	});

	test('ai-setup.ts does not reference agent IDs that are not canonical', () => {
		const canonicalSet = new Set<string>(DISPATCH_DOCS_AGENT_IDS);
		const idRegex = /id:\s*'([a-z][a-z0-9-]*)'/g;
		const unknown = new Set<string>();
		for (const match of aiSetupSource.matchAll(idRegex)) {
			const id = match[1];
			if (!canonicalSet.has(id)) unknown.add(id);
		}
		const unknownAgents = [...unknown].filter(
			(id) => id.length <= 20 && !['setup', 'install', 'run'].includes(id)
		);
		const surprises = unknownAgents.filter(
			(id) => aiSetupSource.includes(`id: '${id}'`) && /[a-z]+-[a-z]+/.test(id)
		);
		expect(surprises, `ai-setup.ts names unknown agent IDs: ${surprises.join(', ')}`).toEqual([]);
	});
});
