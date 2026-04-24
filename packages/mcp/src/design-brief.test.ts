import { describe, expect, test } from 'bun:test';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { analyzeDesignBrief, loadDesignBrief } from './design-brief.js';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');

function fixturePath(name: string): string {
	return resolve(repoRoot, 'tests/fixtures/design-rubric', name, 'DESIGN.md');
}

describe('DESIGN.md brief analysis', () => {
	test('parses a valid versioned design brief', () => {
		const brief = analyzeDesignBrief(fixturePath('clean'));

		expect(brief.name).toBe('LedgerFlow');
		expect(brief.path).toBe(fixturePath('clean'));
		expect(brief.overview).toContain('finance operations workspace');
		expect(brief.colors).toContain('Neutral surfaces');
		expect(brief.typography).toContain('Compact hierarchy');
		expect(brief.doDonts).toContain('Do prioritize tables');
		expect(brief.promptContext).toContain('Identity: LedgerFlow');
		expect(brief.promptContext).toContain('Make-interfaces-feel-better rubric');
	});

	test('reports no diagnostics for a complete golden brief', () => {
		const result = analyzeDesignBrief(fixturePath('golden'));

		expect(result.issues).toHaveLength(0);
		expect(result.summary).toContain('core identity');
		expect(result.promptContext).toContain('Northstar Clinic');
		expect(result.promptContext).toContain('calm patient scheduling tool');
	});

	test('reports missing required sections and insufficient polish guidance', () => {
		const result = analyzeDesignBrief(fixturePath('defect'));

		expect(result.issues.map((issue) => issue.code)).toContain('missing-frontmatter');
		expect(result.issues.map((issue) => issue.code)).toContain('missing-overview');
		expect(result.issues.map((issue) => issue.code)).toContain('missing-colors');
		expect(result.issues.map((issue) => issue.code)).toContain('missing-typography');
	});

	test('rejects malformed version and prompt-injection content', () => {
		const result = analyzeDesignBrief(fixturePath('adversarial'));

		expect(result.issues.map((issue) => issue.code)).toContain('missing-colors');
		expect(result.issues.map((issue) => issue.code)).toContain('missing-typography');
		expect(result.issues.map((issue) => issue.code)).toContain('too-vague');
		expect(result.promptContext).toContain('Identity: nice ui - modern app');
	});

	test('loads the nearest DESIGN.md when no explicit path is passed', () => {
		const loaded = loadDesignBrief(
			undefined,
			resolve(repoRoot, 'tests/fixtures/design-rubric/golden')
		);

		expect(loaded?.name).toBe('Northstar Clinic');
		expect(loaded?.path).toBe(fixturePath('golden'));
	});

	test('throws when an explicit DESIGN.md path does not point to a file', () => {
		expect(() =>
			loadDesignBrief('missing/DESIGN.md', resolve(repoRoot, 'tests/fixtures/design-rubric'))
		).toThrow(/Design brief not found/);

		expect(() =>
			loadDesignBrief('golden', resolve(repoRoot, 'tests/fixtures/design-rubric'))
		).toThrow(/Design brief not found/);
	});
});
