/**
 * Manual single-package publish wrapper that handles the publishConfig.exports swap.
 *
 * npm doesn't apply publishConfig.exports (that's a pnpm/bun feature), so this script
 * temporarily swaps the exports before publishing, then restores.
 *
 * Swap logic lives in scripts/lib/export-swap.ts and is shared with the
 * prepack/postpack hooks wired into packages/ui and packages/primitives.
 *
 * Note: CI never calls this script — the release flow goes through
 * `changesets/action@v1` → `bun run publish:packages` (= `changeset publish`) →
 * `npm pack` prepack/postpack hooks. This script is for manual/one-off publishes.
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
import { resolve } from 'node:path';
import { execSync } from 'node:child_process';
import { swapExportsForPublish, restoreExports } from './lib/export-swap.ts';

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

function readName(): { name: string; version: string } {
	const pkg = JSON.parse(readFileSync(pkgPath, 'utf8')) as { name: string; version: string };
	return { name: pkg.name, version: pkg.version };
}

const { name, version } = readName();
console.log(`Publishing ${name}@${version} from ${packageDir}`);

const backup = swapExportsForPublish(pkgPath);

try {
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
