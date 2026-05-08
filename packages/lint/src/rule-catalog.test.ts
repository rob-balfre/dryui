import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { RULE_CATALOG, serializeRuleCatalog } from './rule-catalog.js';

const snapshotPath = resolve(import.meta.dir, '__snapshots__', 'rule-catalog.txt');

describe('rule catalog', () => {
	test('every entry has a message and severity', () => {
		for (const [id, entry] of Object.entries(RULE_CATALOG)) {
			expect(entry.id).toBe(id);
			expect(entry.message.length).toBeGreaterThan(0);
			expect(['error', 'warning', 'suggestion']).toContain(entry.severity);
		}
	});

	test('contains no duplicate ids', () => {
		const ids = Object.values(RULE_CATALOG).map((entry) => entry.id);
		expect(new Set(ids).size).toBe(ids.length);
	});

	test('matches the golden snapshot byte-for-byte', () => {
		const expected = readFileSync(snapshotPath, 'utf-8');
		expect(`${serializeRuleCatalog()}\n`).toBe(expected);
	});

	test('high-risk allow-comment messages define the narrow escape hatch', () => {
		for (const ruleId of ['dryui/no-svelte-element', 'dryui/no-flex', 'dryui/no-width'] as const) {
			const message = RULE_CATALOG[ruleId].message;
			expect(message).toContain('escape hatch is ONLY');
			expect(message).toContain('Do NOT silence this rule');
			expect(message).not.toContain('intentional cases');
		}
	});
});
