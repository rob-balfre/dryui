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

import { readdirSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { swapExportsForPublish, restoreExports, type ExportSwapBackup } from './lib/export-swap.ts';

const dryRun = process.argv.includes('--dry-run');
const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, '..');
const packagesDir = resolve(repoRoot, 'packages');

const pkgPaths: string[] = [];
for (const entry of readdirSync(packagesDir)) {
	const pkgJson = resolve(packagesDir, entry, 'package.json');
	if (existsSync(pkgJson)) pkgPaths.push(pkgJson);
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
