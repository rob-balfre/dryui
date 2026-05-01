import { readFileSync } from 'node:fs';
import { dirname } from 'node:path';
import type { PreprocessorGroup } from 'svelte/compiler';
import { checkScript, checkMarkup, checkStyle, type Violation } from './rules.js';
import { RULE_CATALOG, type RuleSeverity } from './rule-catalog.js';

export interface DryuiLintOptions {
	strict?: boolean;
	/**
	 * Substring patterns that opt files into linting. When set, files that do
	 * not match one of these patterns are skipped before package detection.
	 */
	include?: string[];
	exclude?: string[];
	/**
	 * Experimental migration rule. When enabled, raw CSS grid declarations are
	 * flagged so layout moves into a sanctioned layout primitive or scoped
	 * layout CSS.
	 */
	forbidRawGrid?: boolean;
	/**
	 * Experimental migration rule. When enabled, markup may only use Svelte/DryUI
	 * component tags and Svelte special elements; raw native tags such as <div>
	 * and <span> are flagged.
	 */
	componentsOnly?: boolean;
	/**
	 * By default, linked @dryui/* package source is skipped so consumer apps do
	 * not lint upstream packages resolved through DRYUI_DEV or workspace links.
	 * Set this for first-party @dryui packages that intentionally lint their own
	 * source during local builds.
	 */
	includeDryuiPackages?: boolean;
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
	const forbidRawGrid = options?.forbidRawGrid ?? false;
	const componentsOnly = options?.componentsOnly ?? false;
	const includeDryuiPackages = options?.includeDryuiPackages ?? false;

	return {
		name: 'dryui-lint',

		script({ content, filename }) {
			const f = filename ?? 'unknown';
			if (isExcluded(f, include, exclude, includeDryuiPackages)) return;
			const violations = checkScript(content);
			report(f, violations, strict);
		},

		markup({ content, filename }: { content: string; filename?: string }) {
			const f = filename ?? 'unknown';
			if (isExcluded(f, include, exclude, includeDryuiPackages)) return;
			const violations = checkMarkup(content, f, { componentsOnly });
			report(f, violations, strict);
		},

		style({ content, filename }: { content: string; filename?: string }) {
			const f = filename ?? 'unknown';
			if (isExcluded(f, include, exclude, includeDryuiPackages)) return;
			const violations = checkStyle(content, { forbidRawGrid }, f);
			report(f, violations, strict);
		}
	};
}
