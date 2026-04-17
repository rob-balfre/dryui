/**
 * Manual single-package publish path, referenced from RELEASING.md for one-off releases.
 * Use this when you need to republish or hotfix one package without running the
 * full changeset flow.
 *
 * The monorepo/changeset flow used by CI lives in scripts/publish-packages.ts
 * (invoked via `bun run publish:packages` from `release:ci`). Both scripts share
 * the publishConfig.exports swap and dist verification helpers in scripts/lib/.
 *
 * Ordering (mirrors publish-packages.ts — hardened against partial failures):
 *   1. Verify dist BEFORE swap — a swap on a broken dist embeds the break
 *      into the top-level exports and npm packs the bad paths; the restore
 *      can only undo the package.json mutation, not the published tarball.
 *   2. Swap outside the publish try/catch — if the swap throws it propagates
 *      without npm ever running.
 *   3. Publish inside try, restore in finally.
 *
 * Usage:
 *   bun run scripts/publish.ts <package-dir> [--otp <code>] [--dry-run]
 *
 * Examples:
 *   bun run scripts/publish.ts packages/primitives --otp 123456
 *   bun run scripts/publish.ts packages/ui --otp 123456
 *   bun run scripts/publish.ts packages/ui --dry-run
 */

import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { swapExportsForPublish, restoreExports } from './lib/export-swap.ts';
import { verifyPackageDist, formatIssues } from './lib/verify-dist.ts';

const args = process.argv.slice(2);
const packageDir = args[0];

if (!packageDir) {
	console.error('Usage: bun run scripts/publish.ts <package-dir> [--otp <code>] [--dry-run]');
	process.exit(1);
}

const otpIndex = args.indexOf('--otp');
const otp = otpIndex !== -1 ? args[otpIndex + 1] : undefined;
const dryRun = args.includes('--dry-run');

const pkgPath = resolve(packageDir, 'package.json');
const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, '..');

function readName(): { name: string; version: string } {
	const pkg = JSON.parse(readFileSync(pkgPath, 'utf8')) as { name: string; version: string };
	return { name: pkg.name, version: pkg.version };
}

const { name, version } = readName();
console.log(`Publishing ${name}@${version} from ${packageDir}`);

// ─── Step 1: pre-swap dist verification ────────────────────────────────────
const preflightIssues = verifyPackageDist(pkgPath);
if (preflightIssues.length > 0) {
	console.error(`\n  ✗ pre-swap dist verification failed for ${name}@${version}`);
	console.error(formatIssues(preflightIssues, repoRoot));
	console.error('\n  Run the package build (e.g. `bun run --filter <name> build`) and retry.');
	process.exit(1);
}
console.log('  pre-swap dist verification passed');

// ─── Step 2: swap outside try/catch ────────────────────────────────────────
// If the swap throws, it propagates without ever touching npm publish.
const backup = swapExportsForPublish(pkgPath);

// ─── Step 3: publish inside try, restore in finally ────────────────────────
try {
	const postSwapIssues = verifyPackageDist(pkgPath);
	if (postSwapIssues.length > 0) {
		console.error(`\n  ✗ post-swap dist verification failed for ${name}@${version}`);
		console.error(formatIssues(postSwapIssues, repoRoot));
		console.error('\n  Check publishConfig.exports paths match your dist/ layout.');
		process.exit(1);
	}
	console.log('  post-swap dist verification passed');

	const otpFlag = otp ? `--otp=${otp}` : '';
	const dryRunFlag = dryRun ? '--dry-run' : '';
	const cmd = `npm publish --access public ${otpFlag} ${dryRunFlag}`.trim();

	console.log(`  Running: ${cmd}`);
	execSync(cmd, { cwd: resolve(packageDir), stdio: 'inherit' });

	console.log(`\n  Published ${name}@${version}`);
} finally {
	restoreExports(pkgPath, backup);
	console.log('  Restored original package.json');
}
