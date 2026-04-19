import {
	RULE_CATALOG,
	ruleSuggestedFix,
	type RuleCatalogId,
	type RuleSeverity
} from '@dryui/lint/rule-catalog';
import { checkSvelteFile, type Violation } from '@dryui/lint/rules';
import { reviewComponent, type ComponentDef } from './reviewer.js';

export interface ComponentIssue {
	readonly severity: RuleSeverity;
	readonly code: string;
	readonly line: number;
	readonly message: string;
	readonly fix: string | null;
}

export interface ComponentCheckResult {
	readonly issues: ComponentIssue[];
	readonly summary: string;
	readonly filename?: string;
}

function isRuleCatalogId(value: string): value is RuleCatalogId {
	return value in RULE_CATALOG;
}

function lintViolationToIssue(violation: Violation): ComponentIssue {
	if (isRuleCatalogId(violation.rule)) {
		return {
			severity: RULE_CATALOG[violation.rule].severity,
			code: violation.rule,
			line: violation.line,
			message: violation.message,
			fix: ruleSuggestedFix(violation.rule)
		};
	}

	return {
		severity: 'error',
		code: violation.rule,
		line: violation.line,
		message: violation.message,
		fix: null
	};
}

function dedupeIssues(issues: ComponentIssue[]): ComponentIssue[] {
	const seen = new Set<string>();
	return issues.filter((issue) => {
		const key = `${issue.code}:${issue.line}:${issue.message}`;
		if (seen.has(key)) return false;
		seen.add(key);
		return true;
	});
}

function summarizeIssues(issues: readonly ComponentIssue[]): string {
	if (issues.length === 0) return 'No issues found';

	let errors = 0;
	let warnings = 0;
	let suggestions = 0;
	let info = 0;

	for (const issue of issues) {
		if (issue.severity === 'error') errors += 1;
		else if (issue.severity === 'warning') warnings += 1;
		else if (issue.severity === 'suggestion') suggestions += 1;
		else info += 1;
	}

	let summary = `${errors} error${errors !== 1 ? 's' : ''}, ${warnings} warning${warnings !== 1 ? 's' : ''}, ${suggestions} suggestion${suggestions !== 1 ? 's' : ''}`;
	if (info > 0) {
		summary += `, ${info} info`;
	}
	return summary;
}

export function checkComponent(
	code: string,
	spec: { components: Record<string, ComponentDef> },
	filename?: string
): ComponentCheckResult {
	const review = reviewComponent(code, spec, filename);
	const lintIssues = checkSvelteFile(code, filename).map(lintViolationToIssue);
	const issues = dedupeIssues([...review.issues, ...lintIssues]).sort((left, right) => {
		if (left.line !== right.line) return left.line - right.line;
		if (left.severity !== right.severity) {
			const rank = { error: 3, warning: 2, suggestion: 1, info: 0 } as const;
			return rank[right.severity] - rank[left.severity];
		}
		if (left.code !== right.code) return left.code.localeCompare(right.code);
		return left.message.localeCompare(right.message);
	});

	return {
		issues,
		summary: summarizeIssues(issues),
		...(filename ? { filename } : {})
	};
}
