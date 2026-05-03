/**
 * verify-dist — guard-rail for the publish pipeline.
 *
 * Given a package.json that has already been swap-published (i.e. publishConfig.exports
 * merged into the top level), walk every path the tarball promises and ensure it
 * exists on disk and is non-empty. Catches the class of failures where a package
 * ships with an empty or stale dist/ — the root cause behind prior broken npm
 * releases.
 *
 * Paths collected:
 *   - main, types, svelte (top level)
 *   - every bin target (bin: string | Record<string, string>)
 *   - every leaf under exports (types/svelte/default/import/require/node)
 *   - every entry in files[] (must exist as file or non-empty dir)
 *
 * External files (node_modules, absolute paths) are ignored — we only verify
 * package-local promises.
 */

import { readFileSync, statSync, readdirSync, existsSync } from 'node:fs';
import { resolve, dirname, isAbsolute } from 'node:path';

export interface VerifyIssue {
	pkgPath: string;
	field: string;
	target: string;
	reason: 'missing' | 'empty-dir' | 'not-file-or-dir';
}

const LEAF_KEYS = new Set([
	'types',
	'svelte',
	'default',
	'import',
	'require',
	'node',
	'browser',
	'module'
]);

function isPackageLocal(path: string): boolean {
	if (isAbsolute(path)) return false;
	if (path.startsWith('./')) return true;
	if (path.startsWith('../')) return false;
	return !path.includes('/') || path.startsWith('./') || /^[a-zA-Z0-9_-]/.test(path);
}

function collectExportLeaves(node: unknown, into: string[]): void {
	if (typeof node === 'string') {
		into.push(node);
		return;
	}
	if (!node || typeof node !== 'object') return;
	for (const [key, value] of Object.entries(node as Record<string, unknown>)) {
		if (LEAF_KEYS.has(key)) {
			if (typeof value === 'string') into.push(value);
			else if (value && typeof value === 'object') collectExportLeaves(value, into);
			continue;
		}
		collectExportLeaves(value, into);
	}
}

function collectPromisedPaths(
	pkg: Record<string, unknown>
): Array<{ field: string; target: string }> {
	const out: Array<{ field: string; target: string }> = [];

	for (const field of ['main', 'types', 'svelte', 'module', 'browser'] as const) {
		const value = pkg[field];
		if (typeof value === 'string') out.push({ field, target: value });
	}

	const bin = pkg.bin;
	if (typeof bin === 'string') {
		out.push({ field: 'bin', target: bin });
	} else if (bin && typeof bin === 'object') {
		for (const [name, target] of Object.entries(bin)) {
			if (typeof target === 'string') out.push({ field: `bin.${name}`, target });
		}
	}

	if (pkg.exports && typeof pkg.exports === 'object') {
		const leaves: string[] = [];
		collectExportLeaves(pkg.exports, leaves);
		for (const target of leaves) out.push({ field: 'exports', target });
	}

	if (Array.isArray(pkg.files)) {
		for (const entry of pkg.files) {
			if (typeof entry === 'string') out.push({ field: 'files', target: entry });
		}
	}

	return out;
}

function isNonEmptyDir(path: string): boolean {
	try {
		return readdirSync(path).length > 0;
	} catch {
		return false;
	}
}

export function verifyPackageDist(pkgJsonPath: string): VerifyIssue[] {
	const pkgDir = dirname(pkgJsonPath);
	const pkg = JSON.parse(readFileSync(pkgJsonPath, 'utf8')) as Record<string, unknown>;

	if (pkg.private === true) return [];

	const issues: VerifyIssue[] = [];
	const seen = new Set<string>();

	for (const { field, target } of collectPromisedPaths(pkg)) {
		if (!target) continue;
		if (target.includes('*')) continue;
		if (!isPackageLocal(target)) continue;

		const abs = resolve(pkgDir, target);
		const key = `${field}::${abs}`;
		if (seen.has(key)) continue;
		seen.add(key);

		if (!existsSync(abs)) {
			issues.push({ pkgPath: pkgJsonPath, field, target, reason: 'missing' });
			continue;
		}

		let stats;
		try {
			stats = statSync(abs);
		} catch {
			issues.push({ pkgPath: pkgJsonPath, field, target, reason: 'missing' });
			continue;
		}

		if (stats.isFile()) {
			// Empty files are allowed: TypeScript compiles types-only modules to
			// zero-byte .js. The `missing` check above is what catches the real
			// failure mode (entire files absent from the tarball).
			continue;
		}

		if (stats.isDirectory()) {
			if (!isNonEmptyDir(abs)) {
				issues.push({ pkgPath: pkgJsonPath, field, target, reason: 'empty-dir' });
			}
			continue;
		}

		issues.push({ pkgPath: pkgJsonPath, field, target, reason: 'not-file-or-dir' });
	}

	return issues;
}

export function formatIssues(issues: VerifyIssue[], repoRoot: string): string {
	const lines: string[] = [];
	const byPkg = new Map<string, VerifyIssue[]>();
	for (const issue of issues) {
		const list = byPkg.get(issue.pkgPath) ?? [];
		list.push(issue);
		byPkg.set(issue.pkgPath, list);
	}
	for (const [pkgPath, pkgIssues] of byPkg) {
		lines.push(`  ✗ ${pkgPath.replace(repoRoot + '/', '')}`);
		for (const issue of pkgIssues) {
			lines.push(`      ${issue.field} -> ${issue.target}  [${issue.reason}]`);
		}
	}
	return lines.join('\n');
}
