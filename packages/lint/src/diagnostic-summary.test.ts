import { describe, expect, test } from 'bun:test';
import { summarizeDiagnostics, type Diagnostic } from './diagnostic-summary.js';

function diag(
	severity: Diagnostic['severity'],
	line: number,
	code = 'r',
	message = 'm'
): Diagnostic {
	return { severity, line, code, message, fix: null };
}

describe('summarizeDiagnostics', () => {
	test('empty input yields the canonical empty-state summary', () => {
		expect(summarizeDiagnostics([])).toEqual({ issues: [], summary: 'No issues found' });
	});

	test('always lists all three severities, even when zero', () => {
		expect(summarizeDiagnostics([diag('error', 1)]).summary).toBe(
			'1 error, 0 warnings, 0 suggestions'
		);
		expect(summarizeDiagnostics([diag('suggestion', 1)]).summary).toBe(
			'0 errors, 0 warnings, 1 suggestion'
		);
	});

	test('pluralizes per severity independently', () => {
		const summary = summarizeDiagnostics([
			diag('error', 1),
			diag('error', 2),
			diag('warning', 3),
			diag('suggestion', 4),
			diag('suggestion', 5),
			diag('suggestion', 6)
		]).summary;
		expect(summary).toBe('2 errors, 1 warning, 3 suggestions');
	});

	test('sorts severity desc primary (error > warning > suggestion)', () => {
		const result = summarizeDiagnostics([
			diag('suggestion', 1),
			diag('warning', 2),
			diag('error', 3)
		]);
		expect(result.issues.map((i) => i.severity)).toEqual(['error', 'warning', 'suggestion']);
	});

	test('sorts line asc as severity tiebreaker', () => {
		const result = summarizeDiagnostics([diag('error', 30), diag('error', 10), diag('error', 20)]);
		expect(result.issues.map((i) => i.line)).toEqual([10, 20, 30]);
	});

	test('does not mutate the input', () => {
		const input = [diag('suggestion', 1), diag('error', 2)] as const;
		const before = [...input];
		summarizeDiagnostics(input);
		expect(input).toEqual(before);
	});

	test('preserves caller-specific fields on extended diagnostics', () => {
		interface ThemeIssue extends Diagnostic {
			readonly variable: string;
		}
		const issues: ThemeIssue[] = [
			{ severity: 'warning', code: 'w', line: 5, message: 'm', fix: null, variable: '--dry-x' }
		];
		const result = summarizeDiagnostics(issues);
		expect(result.issues[0]?.variable).toBe('--dry-x');
	});
});
