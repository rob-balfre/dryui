import type { PreprocessorGroup } from 'svelte/compiler';
import { checkScript, checkMarkup, checkStyle, type Violation } from './rules.js';
import { RULE_CATALOG, type RuleSeverity } from './rule-catalog.js';

export interface DryuiLintOptions {
	strict?: boolean;
	exclude?: string[];
}

function formatViolation(filename: string, v: Violation): string {
	return `[${v.rule}] ${filename}:${v.line} — ${v.message}`;
}

const SEVERITY_BY_ID = RULE_CATALOG as Record<string, { severity: RuleSeverity }>;

function severityOf(rule: string): RuleSeverity {
	const entry = SEVERITY_BY_ID[rule];
	if (entry) return entry.severity;
	return 'error';
}

function report(filename: string, violations: Violation[], strict: boolean): void {
	if (violations.length === 0) return;

	const blocking = violations.filter((v) => severityOf(v.rule) === 'error');
	const nonBlocking = violations.filter((v) => severityOf(v.rule) !== 'error');

	for (const v of nonBlocking) {
		console.warn(formatViolation(filename, v));
	}

	if (strict && blocking.length > 0) {
		const messages = blocking.map((v) => formatViolation(filename, v)).join('\n');
		throw new Error(`DryUI lint violations:\n${messages}`);
	}

	if (!strict) {
		for (const v of blocking) {
			console.warn(formatViolation(filename, v));
		}
	}
}

function isExcluded(filename: string, patterns: string[]): boolean {
	return patterns.some((p) => filename.includes(p));
}

export function dryuiLint(options?: DryuiLintOptions): PreprocessorGroup {
	const strict = options?.strict ?? false;
	const exclude = options?.exclude ?? [];

	return {
		name: 'dryui-lint',

		script({ content, filename }) {
			const f = filename ?? 'unknown';
			if (isExcluded(f, exclude)) return;
			const violations = checkScript(content);
			report(f, violations, strict);
		},

		markup({ content, filename }: { content: string; filename?: string }) {
			const f = filename ?? 'unknown';
			if (isExcluded(f, exclude)) return;
			const violations = checkMarkup(content, f);
			report(f, violations, strict);
		},

		style({ content, filename }: { content: string; filename?: string }) {
			const f = filename ?? 'unknown';
			if (isExcluded(f, exclude)) return;
			const violations = checkStyle(content);
			report(f, violations, strict);
		}
	};
}
