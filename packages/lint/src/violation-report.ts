import { appendFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import type { Violation } from './lint-policy.js';

export type ViolationLogFile = string | true | false | null | undefined;

const DEFAULT_LOG_FILE = '.dryui/lint.log';

export function formatViolation(filename: string, violation: Violation): string {
	return `[${violation.rule}] ${filename}:${violation.line} - ${violation.message}`;
}

function isAbsolutePath(path: string): boolean {
	return path.startsWith('/') || /^[A-Za-z]:[\\/]/.test(path);
}

function resolveLogFile(logFile: ViolationLogFile, root?: string): string | null {
	if (!logFile) return null;
	const file = logFile === true ? DEFAULT_LOG_FILE : logFile;
	return isAbsolutePath(file) ? file : resolve(root ?? process.cwd(), file);
}

function errorMessage(error: unknown): string {
	return error instanceof Error ? error.message : String(error);
}

function targetLines(violations: readonly Violation[], lineCount: number): Set<number> {
	const lines = new Set<number>();
	for (const violation of violations) {
		if (violation.line >= 1 && violation.line <= lineCount) lines.add(violation.line);
	}
	return lines;
}

function mergeRanges(
	ranges: Array<{ start: number; end: number }>
): Array<{ start: number; end: number }> {
	const sorted = ranges.sort((left, right) => left.start - right.start || left.end - right.end);
	const merged: Array<{ start: number; end: number }> = [];

	for (const range of sorted) {
		const previous = merged.at(-1);
		if (previous && range.start <= previous.end + 1) {
			previous.end = Math.max(previous.end, range.end);
			continue;
		}
		merged.push({ ...range });
	}

	return merged;
}

export function formatSourceContext(
	source: string,
	violations: readonly Violation[],
	contextRadius = 1
): string {
	const lines = source.split(/\r?\n/);
	const targets = targetLines(violations, lines.length);
	if (targets.size === 0) return '';

	const ranges = mergeRanges(
		[...targets].map((line) => ({
			start: Math.max(1, line - contextRadius),
			end: Math.min(lines.length, line + contextRadius)
		}))
	);
	const width = String(Math.max(...ranges.map((range) => range.end))).length;
	const output: string[] = [];

	for (const [index, range] of ranges.entries()) {
		if (index > 0) output.push('  ...');
		for (let line = range.start; line <= range.end; line += 1) {
			const marker = targets.has(line) ? '>' : ' ';
			const number = String(line).padStart(width, ' ');
			output.push(`${marker} ${number} | ${lines[line - 1] ?? ''}`);
		}
	}

	return output.join('\n');
}

export function formatViolationReport(
	filename: string,
	violations: readonly Violation[],
	source?: string
): string {
	const messages = violations.map((violation) => formatViolation(filename, violation)).join('\n');
	if (source === undefined) return messages;

	const context = formatSourceContext(source, violations);
	if (!context) return messages;
	return `${messages}\n\nSource context:\n${context}`;
}

export function appendViolationLog(
	logFile: ViolationLogFile,
	report: string,
	options: { readonly root?: string; readonly label?: string } = {}
): void {
	const target = resolveLogFile(logFile, options.root);
	if (!target) return;

	try {
		mkdirSync(dirname(target), { recursive: true });
		const label = options.label ? ` ${options.label}` : '';
		appendFileSync(
			target,
			`--- DryUI lint${label} ${new Date().toISOString()} ---\n${report}\n\n`,
			'utf-8'
		);
	} catch (error) {
		console.warn(`[dryui/lint] could not write ${target}: ${errorMessage(error)}`);
	}
}
