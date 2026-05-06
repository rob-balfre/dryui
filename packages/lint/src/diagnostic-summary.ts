// Canonical sort + count for any DryUI checker output.
//
// Every checker (component-checker, theme-checker, future ones) produces a
// list of issues that share `{severity, code, line, message, fix}`. This
// module owns the severity vocabulary, the ordering rule (severity desc,
// line asc tiebreaker), and the human-readable count string. Checkers stay
// generic over their domain-specific extra fields; everything common lives
// here so a third checker reuses the seam instead of hand-rolling another
// sort and counter.

export type Severity = 'error' | 'warning' | 'suggestion';

export interface Diagnostic {
	readonly severity: Severity;
	readonly code: string;
	readonly line: number;
	readonly message: string;
	readonly fix: string | null;
}

export interface DiagnosticSummary<T extends Diagnostic> {
	readonly issues: T[];
	readonly summary: string;
}

const SEVERITY_RANK: Readonly<Record<Severity, number>> = {
	error: 0,
	warning: 1,
	suggestion: 2
};

function compareDiagnostics(a: Diagnostic, b: Diagnostic): number {
	const rank = SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity];
	if (rank !== 0) return rank;
	return a.line - b.line;
}

function pluralize(noun: string, count: number): string {
	return count === 1 ? noun : `${noun}s`;
}

function formatSummary(issues: readonly Diagnostic[]): string {
	if (issues.length === 0) return 'No issues found';
	let errors = 0;
	let warnings = 0;
	let suggestions = 0;
	for (const issue of issues) {
		if (issue.severity === 'error') errors += 1;
		else if (issue.severity === 'warning') warnings += 1;
		else suggestions += 1;
	}
	return (
		`${errors} ${pluralize('error', errors)}, ` +
		`${warnings} ${pluralize('warning', warnings)}, ` +
		`${suggestions} ${pluralize('suggestion', suggestions)}`
	);
}

export function summarizeDiagnostics<T extends Diagnostic>(
	issues: readonly T[]
): DiagnosticSummary<T> {
	const sorted = [...issues].sort(compareDiagnostics);
	return { issues: sorted, summary: formatSummary(sorted) };
}
