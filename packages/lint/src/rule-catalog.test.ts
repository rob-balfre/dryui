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
			expect(['error', 'warning', 'suggestion', 'info']).toContain(entry.severity);
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
});
