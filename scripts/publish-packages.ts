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

if (skipBuild) {
	console.log(
		'publish-packages: --skip-build set, skipping build step (caller is expected to have built)'
	);
} else {
	console.log('publish-packages: building every publishable package before publish…');
	execSync('bun run build:packages', { cwd: repoRoot, stdio: 'inherit' });
}

const backups: Array<{ pkgPath: string; backup: ExportSwapBackup }> = [];

try {
	for (const pkgPath of pkgPaths) {
		backups.push({ pkgPath, backup: swapExportsForPublish(pkgPath, { silent: true }) });
	}

	const swapped = backups.filter((b) => b.backup.swapped).map((b) => b.pkgPath);
	console.log(`publish-packages: swapped ${swapped.length}/${pkgPaths.length} package.json files`);
	for (const pkgPath of swapped) {
		console.log(`  - ${pkgPath.replace(repoRoot + '/', '')}`);
	}

	console.log('publish-packages: verifying dist for every publishable package…');
	const allIssues: VerifyIssue[] = [];
	for (const pkgPath of pkgPaths) {
		if (!isPublishable(pkgPath)) continue;
		allIssues.push(...verifyPackageDist(pkgPath));
	}

	if (allIssues.length > 0) {
		console.error(
			`publish-packages: ${allIssues.length} dist issue(s) detected — aborting before publish`
		);
		console.error(formatIssues(allIssues, repoRoot));
		process.exit(1);
	}
	console.log('publish-packages: dist verification passed');

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
