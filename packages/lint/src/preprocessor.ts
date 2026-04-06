import type { PreprocessorGroup } from 'svelte/compiler';
import { checkScript, checkMarkup, checkStyle, type Violation } from './rules.js';

export interface DryuiLintOptions {
	strict?: boolean;
	exclude?: string[];
}

function formatViolation(filename: string, v: Violation): string {
	return `[${v.rule}] ${filename}:${v.line} — ${v.message}`;
}

function report(filename: string, violations: Violation[], strict: boolean): void {
	if (violations.length === 0) return;

	if (strict) {
		const messages = violations.map((v) => formatViolation(filename, v)).join('\n');
		throw new Error(`DryUI lint violations:\n${messages}`);
	}

	for (const v of violations) {
		console.warn(formatViolation(filename, v));
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
			const violations = checkMarkup(content);
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
