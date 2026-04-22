/**
 * Wraps `changeset publish` with explicit workspace:* resolution and
 * publishConfig.exports swap, because @changesets/cli 2.30.0 does NOT run
 * `prepack` / `postpack` lifecycle scripts from its internal publish path.
 * The prepack/postpack hooks wired into packages/ui, packages/primitives
 * and packages/mcp work for `bun publish` / `bun pm pack` but silently
 * skip in CI, which is how @dryui/mcp@2.0.0 and @2.0.1 ended up on npm
 * with an unresolved "@dryui/lint": "workspace:*" dep.
 *
 * This wrapper calls swapExportsForPublish across every packages/<name>
 * before invoking `changeset publish`, then restores in a finally block.
 * The swap is idempotent and a no-op for packages without workspace deps
 * or publishConfig.exports, so it's safe to apply broadly.
 *
 * Ordering (hardened against partial failures):
 *   1. Build every publishable package (unless --skip-build)
 *   2. Verify every dist BEFORE any swap — a swap on a broken dist embeds
 *      the break into package.json and the restore can't undo the bad tarball
 *   3. Swap exports as a pre-flight pass outside the publish try/catch —
 *      if any swap throws we abort loud before any npm publish runs, while
 *      still restoring any package we already swapped (tracked in `backups`)
 *   4. Publish (inside try)
 *   5. Restore all package.json files in finally
 *
 * Usage (normally via `bun run publish:packages`):
 *   bun scripts/publish-packages.ts           # swap, publish, restore
 *   bun scripts/publish-packages.ts --dry-run # swap, skip publish, restore
 */

import { readdirSync, existsSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { swapExportsForPublish, restoreExports, type ExportSwapBackup } from './lib/export-swap.ts';
import { verifyPackageDist, formatIssues, type VerifyIssue } from './lib/verify-dist.ts';
import { checkPackage as checkPublishHygiene } from './check-publish-hygiene.ts';

const dryRun = process.argv.includes('--dry-run');
const skipBuild = process.argv.includes('--skip-build');
const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, '..');
const packagesDir = resolve(repoRoot, 'packages');

const pkgPaths: string[] = [];
for (const entry of readdirSync(packagesDir)) {
	const pkgJson = resolve(packagesDir, entry, 'package.json');
	if (existsSync(pkgJson)) pkgPaths.push(pkgJson);
}

function isPublishable(pkgPath: string): boolean {
	const pkg = JSON.parse(readFileSync(pkgPath, 'utf8')) as Record<string, unknown>;
	return pkg.private !== true;
}

// ─── Step 1: build ──────────────────────────────────────────────────────────

if (skipBuild) {
	console.log(
		'publish-packages: --skip-build set, skipping build step (caller is expected to have built)'
	);
} else {
	console.log('publish-packages: building every publishable package before publish…');
	execSync('bun run build:packages', { cwd: repoRoot, stdio: 'inherit' });
}

// ─── Step 2: verify dist BEFORE any swap ───────────────────────────────────
// A swap on a broken dist writes the broken paths into the top-level exports
// (via publishConfig.exports merge) and npm happily packs the empty/missing
// files. The subsequent restore only undoes the package.json mutation — it
// can't pull the bad tarball back from npm. So verify first, fail loud, and
// never enter the swap/publish flow if the build output is incomplete.

console.log('publish-packages: verifying dist for every publishable package (pre-swap)…');
const preflightIssues: VerifyIssue[] = [];
for (const pkgPath of pkgPaths) {
	if (!isPublishable(pkgPath)) continue;
	preflightIssues.push(...verifyPackageDist(pkgPath));
}

if (preflightIssues.length > 0) {
	console.error(
		`publish-packages: ${preflightIssues.length} dist issue(s) detected — aborting BEFORE swap/publish`
	);
	console.error(formatIssues(preflightIssues, repoRoot));
	process.exit(1);
}
console.log('publish-packages: pre-flight dist verification passed');

// ─── Step 3: swap exports as a pre-flight pass (outside try/catch) ─────────
// If any swap throws partway through, we want the error to surface loud and
// abort BEFORE any npm publish runs. We still need to restore whichever
// packages we already swapped, so the swap loop has its own try/catch that
// only handles partial-swap cleanup and then rethrows. Nothing swallows the
// error.

const backups: Array<{ pkgPath: string; backup: ExportSwapBackup }> = [];

try {
	for (const pkgPath of pkgPaths) {
		backups.push({ pkgPath, backup: swapExportsForPublish(pkgPath, { silent: true }) });
	}
} catch (err) {
	console.error('publish-packages: swap failed — restoring any packages already swapped');
	for (const { pkgPath, backup } of backups) {
		try {
			restoreExports(pkgPath, backup);
		} catch (restoreErr) {
			console.error(`publish-packages: restore failed for ${pkgPath}`, restoreErr);
		}
	}
	throw err;
}

const swapped = backups.filter((b) => b.backup.swapped).map((b) => b.pkgPath);
console.log(`publish-packages: swapped ${swapped.length}/${pkgPaths.length} package.json files`);
for (const pkgPath of swapped) {
	console.log(`  - ${pkgPath.replace(repoRoot + '/', '')}`);
}

// ─── Step 4: publish (with finally-bound restore) ───────────────────────────

try {
	// Post-swap sanity check: the swap rewrites publishConfig.exports into the
	// top level, which changes the set of paths we verify. Catch the case where
	// the pre-flight dist was fine for the src/ layout but the dist/ paths
	// declared in publishConfig are missing.
	console.log('publish-packages: verifying dist for every publishable package (post-swap)…');
	const postSwapIssues: VerifyIssue[] = [];
	for (const pkgPath of pkgPaths) {
		if (!isPublishable(pkgPath)) continue;
		postSwapIssues.push(...verifyPackageDist(pkgPath));
	}

	if (postSwapIssues.length > 0) {
		console.error(
			`publish-packages: ${postSwapIssues.length} post-swap dist issue(s) detected — aborting before publish`
		);
		console.error(formatIssues(postSwapIssues, repoRoot));
		process.exit(1);
	}
	console.log('publish-packages: post-swap dist verification passed');

	// ─── Step 4b: publish-hygiene gate (publint + attw) ────────────────────────
	// Runs against the post-swap package.json so the validators see exactly
	// the shape npm will publish. Catches dist/exports drift, stale types,
	// and ESM/CJS resolution problems before the tarball goes public.
	console.log('publish-packages: running publint + attw on every publishable package…');
	const hygieneFailures: string[] = [];
	for (const pkgPath of pkgPaths) {
		if (!isPublishable(pkgPath)) continue;
		const result = checkPublishHygiene(pkgPath);
		if (!result.ok) hygieneFailures.push(...result.failures);
	}
	if (hygieneFailures.length > 0) {
		console.error(
			`publish-packages: ${hygieneFailures.length} publish-hygiene failure(s) — aborting before publish`
		);
		for (const failure of hygieneFailures) {
			console.error(failure);
			console.error('---');
		}
		process.exit(1);
	}
	console.log('publish-packages: publish-hygiene check passed');

	if (dryRun) {
		console.log('publish-packages: --dry-run set, skipping changeset publish');
	} else {
		execSync('bun x changeset publish', {
			cwd: repoRoot,
			stdio: 'inherit'
		});
	}
} finally {
	for (const { pkgPath, backup } of backups) {
		restoreExports(pkgPath, backup);
	}
	console.log('publish-packages: restored all package.json files');
}
