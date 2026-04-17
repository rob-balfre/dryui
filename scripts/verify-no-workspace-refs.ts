/**
 * Pre-publish guard-rail: confirm no built tarball contains a `workspace:*`
 * dependency range.
 *
 * Why: npm will not resolve `workspace:` ranges post-install, so any tarball
 * that leaks one is broken for every consumer. We've shipped that bug before
 * (@dryui/mcp@2.0.0/2.0.1 on npm had an unresolved @dryui/lint: workspace:*).
 * This script is wired into the release workflow so CI fails the build
 * *before* `changeset publish` if any tarball would be broken.
 *
 * Modes:
 *
 *   # Default: swap every publishable packages/<name> (same logic the publish
 *   # flow uses), pack into a temp dir, scan every tarball, and restore.
 *   bun run scripts/verify-no-workspace-refs.ts
 *
 *   # Explicit path (file or directory of .tgz files) — scans as-is with no
 *   # swap. Useful for inspecting an already-packed release candidate.
 *   bun run scripts/verify-no-workspace-refs.ts path/to/pkg.tgz
 *   bun run scripts/verify-no-workspace-refs.ts path/to/tarballs/
 *
 * Exit codes:
 *   0 — every scanned tarball is clean
 *   1 — one or more tarballs contain a workspace:* dep (details printed)
 *   2 — invocation error (missing npm/tar, bad path, etc.)
 */

import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { swapExportsForPublish, restoreExports, type ExportSwapBackup } from './lib/export-swap.ts';
import {
	collectTarballs,
	formatFindings,
	packTarball,
	scanTarball,
	type WorkspaceRefFinding
} from './lib/tarball-scan.ts';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, '..');
const packagesDir = resolve(repoRoot, 'packages');

const explicitPath = process.argv[2];

function listPublishablePackages(): Array<{ dir: string; pkgJson: string }> {
	const out: Array<{ dir: string; pkgJson: string }> = [];
	for (const entry of readdirSync(packagesDir)) {
		const pkgJson = join(packagesDir, entry, 'package.json');
		if (!existsSync(pkgJson)) continue;
		const pkg = JSON.parse(readFileSync(pkgJson, 'utf8')) as Record<string, unknown>;
		if (pkg.private === true) continue;
		out.push({ dir: join(packagesDir, entry), pkgJson });
	}
	return out;
}

async function runExplicit(path: string): Promise<number> {
	const tarballs = collectTarballs(path);
	if (tarballs.length === 0) {
		console.error(`verify-no-workspace-refs: no .tgz files found at ${path}`);
		return 2;
	}
	console.log(`verify-no-workspace-refs: scanning ${tarballs.length} tarball(s) from ${path}`);
	return scanAll(tarballs);
}

async function runDefault(): Promise<number> {
	const packages = listPublishablePackages();
	const tempDir = mkdtempSync(join(tmpdir(), 'dryui-verify-tarballs-'));
	const backups: Array<{ pkgJson: string; backup: ExportSwapBackup }> = [];

	try {
		// Mirror publish-packages.ts: swap workspace deps + publishConfig before
		// `npm pack` so the produced tarballs reflect exactly what publish will
		// ship. Swap loop is outside any cleanup catch so a swap failure
		// propagates after we restore the packages we already touched.
		for (const { pkgJson } of packages) {
			try {
				backups.push({ pkgJson, backup: swapExportsForPublish(pkgJson, { silent: true }) });
			} catch (err) {
				for (const { pkgJson: p, backup } of backups) {
					try {
						restoreExports(p, backup);
					} catch (restoreErr) {
						console.error(`verify-no-workspace-refs: restore failed for ${p}`, restoreErr);
					}
				}
				throw err;
			}
		}

		console.log(
			`verify-no-workspace-refs: packing ${packages.length} publishable package(s) into ${tempDir}`
		);
		const tarballs: string[] = [];
		for (const { dir } of packages) {
			tarballs.push(packTarball(dir, tempDir));
		}
		return scanAll(tarballs);
	} finally {
		// Restore before the process exits so a nonzero exit never leaks
		// mutated package.json files into the working tree. process.exit()
		// bypasses finally, so runDefault must return its code and let the
		// top-level caller exit after cleanup completes.
		for (const { pkgJson, backup } of backups) {
			restoreExports(pkgJson, backup);
		}
		rmSync(tempDir, { recursive: true, force: true });
	}
}

function scanAll(tarballs: string[]): number {
	const allFindings: WorkspaceRefFinding[] = [];
	for (const tarball of tarballs) {
		allFindings.push(...scanTarball(tarball));
	}

	if (allFindings.length > 0) {
		console.error(
			`\nverify-no-workspace-refs: ${allFindings.length} unresolved workspace:* ref(s) found — aborting before publish`
		);
		console.error(formatFindings(allFindings));
		console.error('\nFix: ensure scripts/lib/export-swap.ts resolved every workspace:* dep');
		console.error('       before pack (resolveWorkspaceDep fell through or publishConfig shadow).');
		return 1;
	}

	console.log(`verify-no-workspace-refs: all ${tarballs.length} tarball(s) clean`);
	return 0;
}

const exitCode = explicitPath ? await runExplicit(explicitPath) : await runDefault();
process.exit(exitCode);
