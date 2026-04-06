// Plain text formatting utilities shared across CLI commands.
// pad and indent are re-exported from @dryui/mcp/spec-formatters for backward compatibility.

export { pad, indent } from '@dryui/mcp/spec-formatters';

import type { WorkspaceFinding } from '../../mcp/src/workspace-audit.js';

/**
 * Severity labels used in review and diagnose output.
 */
const SEVERITY_LABELS: Record<string, string> = {
	error: 'ERROR',
	warning: 'WARN ',
	suggestion: 'HINT ',
	info: 'INFO '
};

/**
 * Format a severity string to a fixed-width label.
 */
export function severityLabel(severity: string): string {
	return SEVERITY_LABELS[severity] ?? severity.toUpperCase();
}

/**
 * Format a list of CSS variable names into a comma-separated string,
 * wrapping at ~80 chars. Continuation lines are indented with 2 spaces.
 */
export function formatCssVarList(vars: string[], maxWidth = 80): string {
	if (vars.length === 0) return '(none)';
	if (vars.length === 1) return vars[0] ?? '(none)';

	const indentStr = '  ';
	const lines: string[] = [];
	let current = '';

	for (let i = 0; i < vars.length; i++) {
		const v = vars[i];
		if (!v) continue;
		const isLast = i === vars.length - 1;
		const token = isLast ? v : v + ',';
		const separator = current === '' ? '' : ' ';

		if (current === '') {
			// Start a new line (first line has no indent, continuation lines do)
			current = lines.length === 0 ? token : indentStr + token;
		} else {
			const candidate = current + separator + token;
			if (candidate.length > maxWidth) {
				lines.push(current);
				current = indentStr + token;
			} else {
				current = candidate;
			}
		}
	}

	if (current !== '') lines.push(current);
	return lines.join('\n');
}

/**
 * Format a single workspace finding into display lines.
 */
export function formatFinding(finding: WorkspaceFinding): string[] {
	const location = finding.line === null ? finding.file : `${finding.file}:${finding.line}`;
	const lines = [
		`${severityLabel(finding.severity)} [${finding.ruleId}] ${location}: ${finding.message}`
	];
	for (const fix of finding.suggestedFixes) {
		lines.push(`  Fix: ${fix.description}${fix.replacement ? ` -> ${fix.replacement}` : ''}`);
	}
	return lines;
}

interface WorkspaceReportShape {
	root: string;
	scope: { include: readonly string[]; exclude: readonly string[]; changed: boolean };
	scannedFiles: number;
	skippedFiles?: number;
	summary: { error: number; warning: number; info: number };
	warnings: readonly string[];
	findings: readonly WorkspaceFinding[];
}

/**
 * Format the shared header/body of a workspace report (used by lint and doctor).
 */
export function formatWorkspaceReport(
	report: WorkspaceReportShape,
	options: { title: string; showSkipped?: boolean; summaryLabel?: string }
): string {
	const lines = [
		options.title,
		'',
		`Root: ${report.root}`,
		`Scope include: ${report.scope.include.length > 0 ? report.scope.include.join(', ') : '(none)'}`,
		`Scope exclude: ${report.scope.exclude.length > 0 ? report.scope.exclude.join(', ') : '(none)'}`,
		`Changed files only: ${report.scope.changed ? 'yes' : 'no'}`,
		`Scanned files: ${report.scannedFiles}`
	];

	if (options.showSkipped && report.skippedFiles !== undefined) {
		lines.push(`Skipped files: ${report.skippedFiles}`);
	}

	const label = options.summaryLabel ?? 'Issues';
	lines.push(
		`${label}: ${report.summary.error} error, ${report.summary.warning} warning, ${report.summary.info} info`
	);

	if (report.warnings.length > 0) {
		lines.push('', 'Warnings:');
		for (const warning of report.warnings) {
			lines.push(`  - ${warning}`);
		}
	}

	if (report.findings.length === 0) {
		lines.push('', 'No workspace issues found.');
		return lines.join('\n');
	}

	lines.push('', 'Findings:');
	for (const finding of report.findings) {
		lines.push(...formatFinding(finding), '');
	}

	return lines.slice(0, -1).join('\n');
}
