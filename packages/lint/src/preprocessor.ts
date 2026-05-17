import { readFileSync } from 'node:fs';
import { dirname } from 'node:path';
import type { PreprocessorGroup } from 'svelte/compiler';
import { checkScript, checkMarkup, checkStyle, type Violation } from './rules.js';
import { lintRuleSeverity } from './lint-policy.js';
import {
	appendViolationLog,
	formatViolationReport,
	type ViolationLogFile
} from './violation-report.js';

export interface DryuiLintOptions {
	strict?: boolean;
	/**
	 * Substring patterns that opt files into linting. When set, files that do
	 * not match one of these patterns are skipped before package detection.
	 */
	include?: string[];
	exclude?: string[];
	/**
	 * By default, linked @dryui/* package source is skipped so consumer apps do
	 * not lint upstream packages resolved through DRYUI_DEV or workspace links.
	 * Set this for first-party @dryui packages that intentionally lint their own
	 * source during local builds.
	 */
	includeDryuiPackages?: boolean;
	/**
	 * Append violation reports to a log file. Pass true for .dryui/lint.log,
	 * or pass a custom path. Relative paths resolve from process.cwd().
	 */
	logFile?: ViolationLogFile;
}

function report(
	filename: string,
	source: string,
	violations: Violation[],
	strict: boolean,
	logFile: ViolationLogFile
): void {
	if (violations.length === 0) return;

	const blocking = violations.filter((v) => lintRuleSeverity(v.rule) === 'error');
	const nonBlocking = violations.filter((v) => lintRuleSeverity(v.rule) !== 'error');

	for (const v of nonBlocking) {
		const message = formatViolationReport(filename, [v], source);
		appendViolationLog(logFile, message, { label: 'preprocessor' });
		console.warn(message);
	}

	if (strict && blocking.length > 0) {
		const messages = formatViolationReport(filename, blocking, source);
		const report = `DryUI lint violations:\n${messages}`;
		appendViolationLog(logFile, report, { label: 'preprocessor' });
		throw new Error(report);
	}

	if (!strict) {
		for (const v of blocking) {
			const message = formatViolationReport(filename, [v], source);
			appendViolationLog(logFile, message, { label: 'preprocessor' });
			console.warn(message);
		}
	}
}

/**
 * Walks up from `filePath` looking for the nearest `package.json` and returns
 * its `name` field. Used to identify the package a Svelte file belongs to so
 * the lint preprocessor can skip files that are part of an upstream
 * `@dryui/*` package (e.g. when the consumer has linked the workspace via
 * `DRYUI_DEV=1`). Cached per directory because Vite calls the preprocessor
 * once per file across the dev session.
 */
const packageNameCache = new Map<string, string | null>();

function findNearestPackageName(filePath: string): string | null {
	let dir = dirname(filePath);
	const visited: string[] = [];
	while (true) {
		const cached = packageNameCache.get(dir);
		if (cached !== undefined) {
			for (const v of visited) packageNameCache.set(v, cached);
			return cached;
		}
		visited.push(dir);
		try {
			const pkg = JSON.parse(readFileSync(`${dir}/package.json`, 'utf-8')) as { name?: unknown };
			const name = typeof pkg.name === 'string' ? pkg.name : null;
			for (const v of visited) packageNameCache.set(v, name);
			return name;
		} catch {
			// no package.json — keep walking
		}
		const parent = dirname(dir);
		if (parent === dir) {
			for (const v of visited) packageNameCache.set(v, null);
			return null;
		}
		dir = parent;
	}
}

function matchesPattern(filename: string, patterns: string[]): boolean {
	return patterns.some((p) => filename.includes(p));
}

function isAbsolutePath(filename: string): boolean {
	return filename.startsWith('/') || /^[A-Za-z]:[\\/]/.test(filename);
}

function isExcluded(
	filename: string,
	include: string[],
	exclude: string[],
	includeDryuiPackages: boolean
): boolean {
	if (include.length > 0 && !matchesPattern(filename, include)) return true;
	if (filename.includes('/node_modules/')) return true;
	// SvelteKit's generated files (root.svelte etc.) live in .svelte-kit/ and
	// contain framework-authored markup like inline-styled <div>s for the
	// announcer. They are not consumer code; do not lint them.
	if (filename.includes('/.svelte-kit/')) return true;
	// Files belonging to an upstream `@dryui/*` package — for example when a
	// consumer has linked the workspace under `DRYUI_DEV=1` and the package
	// resolves to its real path instead of `node_modules/...` — should not be
	// linted with the consumer's strict rules.
	if (!includeDryuiPackages && isAbsolutePath(filename)) {
		const pkgName = findNearestPackageName(filename);
		if (pkgName !== null && pkgName.startsWith('@dryui/')) return true;
	}
	return matchesPattern(filename, exclude);
}

export function dryuiLint(options?: DryuiLintOptions): PreprocessorGroup {
	const strict = options?.strict ?? false;
	const include = options?.include ?? [];
	const exclude = options?.exclude ?? [];
	const includeDryuiPackages = options?.includeDryuiPackages ?? false;
	const logFile = options?.logFile;

	return {
		name: 'dryui-lint',

		script({ content, filename }) {
			const f = filename ?? 'unknown';
			if (isExcluded(f, include, exclude, includeDryuiPackages)) return;
			const violations = checkScript(content);
			report(f, content, violations, strict, logFile);
		},

		markup({ content, filename }: { content: string; filename?: string }) {
			const f = filename ?? 'unknown';
			if (isExcluded(f, include, exclude, includeDryuiPackages)) return;
			const violations = checkMarkup(content, f);
			report(f, content, violations, strict, logFile);
		},

		style({ content, filename }: { content: string; filename?: string }) {
			const f = filename ?? 'unknown';
			if (isExcluded(f, include, exclude, includeDryuiPackages)) return;
			const violations = checkStyle(content, {}, f);
			report(f, content, violations, strict, logFile);
		}
	};
}
