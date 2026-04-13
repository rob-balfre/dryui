/**
 * Shared helper for the "swap publishConfig into top-level fields before pack/publish"
 * flow used by three scripts:
 *
 *   - scripts/prepack-exports.ts  (npm prepack hook for packages/ui + packages/primitives)
 *   - scripts/postpack-exports.ts (npm postpack hook, restores via on-disk backup)
 *   - scripts/publish.ts          (manual single-package publish wrapper)
 *
 * Why this exists:
 *   npm pack / npm publish do NOT honour `publishConfig.exports` (that's a pnpm/bun-only
 *   feature). The repo ships `exports` pointing at src/ for workspace consumers and
 *   `publishConfig.exports` pointing at dist/ for the published tarball. These helpers
 *   temporarily move `publishConfig.{exports,svelte,types}` into the top-level fields
 *   (plus resolve any `workspace:*` dependency ranges to concrete versions) and hand
 *   back an in-memory backup the caller can use to restore afterwards.
 *
 *   For the prepack/postpack two-process case, the in-memory backup is also written to
 *   disk via {@link writeBackupFile} / {@link readBackupFile}.
 */

import { readFileSync, writeFileSync, existsSync, unlinkSync } from 'node:fs';
import { resolve, dirname } from 'node:path';

export type PackageJson = Record<string, unknown> & {
	name: string;
	version: string;
	exports?: Record<string, unknown>;
	svelte?: string;
	types?: string;
	dependencies?: Record<string, string>;
	publishConfig?: {
		exports?: Record<string, unknown>;
		svelte?: string;
		types?: string;
		[key: string]: unknown;
	};
};

/**
 * Everything needed to restore a package.json to its pre-swap state.
 *
 * `originalText` is the raw UTF-8 contents of the package.json before any mutation.
 * Restore is a byte-for-byte overwrite, so key order and whitespace round-trip cleanly.
 *
 * `swapped` is `false` when the package didn't need any work (no publishConfig
 * overrides and no workspace:* deps). Callers can use it to skip logging /
 * writing a backup file.
 */
export type ExportSwapBackup = {
	swapped: boolean;
	originalText: string;
};

function readPkgText(pkgJsonPath: string): string {
	return readFileSync(pkgJsonPath, 'utf8');
}

function writePkg(pkgJsonPath: string, pkg: PackageJson): void {
	writeFileSync(pkgJsonPath, JSON.stringify(pkg, null, 2) + '\n');
}

/**
 * Resolve a workspace:* dep range to `^<version>` by reading the sibling package.
 *
 * Assumes the monorepo layout `packages/<name>` and dep names shaped like
 * `@dryui/<name>`. If either assumption breaks we return `null` and let the
 * caller decide how noisy to be.
 */
function resolveWorkspaceDep(
	depName: string,
	pkgJsonPath: string,
	logResolutions: (msg: string) => void
): string | null {
	// packages/<name>/package.json  →  <repo-root>
	const repoRoot = resolve(dirname(pkgJsonPath), '..', '..');
	const shortName = depName.replace(/^@dryui\//, '');
	const depPkgPath = resolve(repoRoot, 'packages', shortName, 'package.json');
	if (!existsSync(depPkgPath)) return null;
	const depPkg = JSON.parse(readFileSync(depPkgPath, 'utf8')) as PackageJson;
	const resolved = `^${depPkg.version}`;
	logResolutions(`  Resolved ${depName}: workspace:* -> ${resolved}`);
	return resolved;
}

/**
 * Swap `publishConfig.{exports,svelte,types}` into top-level fields and rewrite any
 * `workspace:*` dependency ranges to concrete versions. Writes the mutated package.json
 * back to disk. Returns an in-memory backup the caller passes to {@link restoreExports}.
 *
 * If the package has neither publishConfig overrides nor workspace:* deps the function
 * is a no-op: it still returns a valid backup (with `swapped: false`) so callers can
 * unconditionally call restore later without branching.
 *
 * Callers that need to survive across a separate child process (prepack → npm pack
 * → postpack) should also persist the returned backup to disk via {@link writeBackupFile}.
 */
export function swapExportsForPublish(
	pkgJsonPath: string,
	options: { silent?: boolean } = {}
): ExportSwapBackup {
	const log = options.silent ? () => {} : (msg: string) => console.log(msg);
	const originalText = readPkgText(pkgJsonPath);
	const pkg = JSON.parse(originalText) as PackageJson;

	const needsSwap = !!(
		pkg.publishConfig?.exports ||
		pkg.publishConfig?.svelte ||
		pkg.publishConfig?.types
	);
	const hasWorkspaceDeps = Object.values(pkg.dependencies || {}).some((v) =>
		String(v).startsWith('workspace:')
	);

	const backup: ExportSwapBackup = {
		swapped: needsSwap || hasWorkspaceDeps,
		originalText
	};

	if (!backup.swapped) return backup;

	if (pkg.publishConfig?.exports) pkg.exports = pkg.publishConfig.exports;
	if (pkg.publishConfig?.svelte) pkg.svelte = pkg.publishConfig.svelte;
	if (pkg.publishConfig?.types) pkg.types = pkg.publishConfig.types;
	delete pkg.publishConfig;

	if (pkg.dependencies) {
		for (const [dep, version] of Object.entries(pkg.dependencies)) {
			if (!version.startsWith('workspace:')) continue;
			const resolved = resolveWorkspaceDep(dep, pkgJsonPath, log);
			if (resolved === null) {
				throw new Error(
					`Could not resolve workspace:* dep ${dep} from ${pkgJsonPath} — expected sibling package at packages/${dep.replace(/^@dryui\//, '')}`
				);
			}
			pkg.dependencies[dep] = resolved;
		}
	}

	writePkg(pkgJsonPath, pkg);
	return backup;
}

/**
 * Restore a package.json from an {@link ExportSwapBackup}. Byte-for-byte: key order,
 * trailing newlines, and formatting all round-trip exactly. Idempotent: safe to call
 * with a no-op backup (`swapped: false`).
 */
export function restoreExports(pkgJsonPath: string, backup: ExportSwapBackup): void {
	if (!backup.swapped) return;
	writeFileSync(pkgJsonPath, backup.originalText);
}

/**
 * Persist a backup to disk so a separate child process (e.g. the `postpack` hook,
 * which npm spawns after `prepack` has already exited) can pick it up.
 */
export function writeBackupFile(backupPath: string, backup: ExportSwapBackup): void {
	writeFileSync(backupPath, JSON.stringify(backup) + '\n');
}

/**
 * Read a backup file written by {@link writeBackupFile}. Returns `null` if the file
 * doesn't exist — callers use this to short-circuit postpack when prepack was a no-op.
 */
export function readBackupFile(backupPath: string): ExportSwapBackup | null {
	if (!existsSync(backupPath)) return null;
	return JSON.parse(readFileSync(backupPath, 'utf8')) as ExportSwapBackup;
}

/**
 * Delete a backup file if it exists. No-op if missing.
 */
export function removeBackupFile(backupPath: string): void {
	if (existsSync(backupPath)) unlinkSync(backupPath);
}
