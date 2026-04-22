import { describe, expect, test } from 'bun:test';
import { enrichDiagnostic, knownHintCodes } from './enrich-diagnostics.ts';

describe('enrichDiagnostic', () => {
	test('attaches a prescriptive hint for known lint rules', () => {
		const enriched = enrichDiagnostic({
			source: 'lint',
			code: 'dryui/no-flex',
			severity: 'error',
			message: 'No flex allowed',
			file: 'App.svelte',
			line: 12
		});
		expect(enriched.code).toBe('lint/dryui/no-flex');
		expect(enriched.hint).toMatch(/grid/i);
		expect(enriched.docsRef).toMatch(/^https:\/\/dryui\.dev/);
	});

	test('normalises theme codes into the `theme/` namespace', () => {
		const enriched = enrichDiagnostic({
			source: 'theme',
			code: 'missing-token',
			severity: 'error',
			message: 'Missing --dry-color-bg-base'
		});
		expect(enriched.code).toBe('theme/missing-token');
		expect(enriched.hint).toBeDefined();
	});

	test('preserves namespaced codes that already match the source', () => {
		const enriched = enrichDiagnostic({
			source: 'lint',
			code: 'lint/project/theme-import-order',
			severity: 'error',
			message: 'Import order is wrong'
		});
		expect(enriched.code).toBe('lint/project/theme-import-order');
		expect(enriched.hint).toMatch(/theme\.css/i);
	});

	test('round-trips unknown codes without a hint, no throw', () => {
		const enriched = enrichDiagnostic({
			source: 'lint',
			code: 'dryui/not-a-real-rule',
			severity: 'warning',
			message: 'Experimental rule'
		});
		expect(enriched.code).toBe('lint/dryui/not-a-real-rule');
		expect(enriched.hint).toBeUndefined();
		expect(enriched.docsRef).toBeUndefined();
	});

	test('marks autoFixable when a fix pair is provided', () => {
		const enriched = enrichDiagnostic({
			source: 'lint',
			code: 'dryui/no-flex',
			severity: 'error',
			message: '',
			fix: { before: 'display: flex;', after: 'display: grid;' }
		});
		expect(enriched.autoFixable).toBe(true);
		expect(enriched.fix).toEqual({ before: 'display: flex;', after: 'display: grid;' });
	});

	test('defaults autoFixable to false when no fix pair is attached', () => {
		const enriched = enrichDiagnostic({
			source: 'lint',
			code: 'dryui/no-flex',
			severity: 'error',
			message: ''
		});
		expect(enriched.autoFixable).toBe(false);
		expect(enriched.fix).toBeUndefined();
	});

	test('knownHintCodes is sorted and non-empty', () => {
		const codes = knownHintCodes();
		expect(codes.length).toBeGreaterThan(15);
		const sorted = [...codes].sort();
		expect(codes).toEqual(sorted);
	});
});
