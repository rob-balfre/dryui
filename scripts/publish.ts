/**
 * Publish script that handles the publishConfig.exports swap.
 *
 * npm doesn't apply publishConfig.exports (that's a pnpm/bun feature),
 * so this script temporarily swaps the exports before publishing, then restores.
 *
 * Usage:
 *   bun run scripts/publish.ts <package-dir> [--otp <code>] [--dry-run]
 *
 * Examples:
 *   bun run scripts/publish.ts packages/primitives --otp 123456
 *   bun run scripts/publish.ts packages/ui --otp 123456
 *   bun run scripts/publish.ts packages/ui --dry-run
 */

import { readFile, writeFile, copyFile } from 'node:fs/promises';
import { resolve, basename } from 'node:path';
import { execSync } from 'node:child_process';

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
const backupPath = resolve(packageDir, 'package.json.publish-backup');

type PackageJson = Record<string, unknown> & {
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

async function main() {
	const raw = await readFile(pkgPath, 'utf8');
	const pkg: PackageJson = JSON.parse(raw);

	console.log(`Publishing ${pkg.name}@${pkg.version} from ${packageDir}`);

	// Backup original
	await copyFile(pkgPath, backupPath);

	try {
		// Apply publishConfig overrides
		if (pkg.publishConfig?.exports) {
			pkg.exports = pkg.publishConfig.exports;
		}
		if (pkg.publishConfig?.svelte) {
			pkg.svelte = pkg.publishConfig.svelte;
		}
		if (pkg.publishConfig?.types) {
			pkg.types = pkg.publishConfig.types;
		}
		delete pkg.publishConfig;

		// Replace workspace:* dependencies with actual versions
		if (pkg.dependencies) {
			for (const [dep, version] of Object.entries(pkg.dependencies)) {
				if (version.startsWith('workspace:')) {
					const depDir = `packages/${dep.replace('@dryui/', '')}`;
					try {
						const depPkgRaw = await readFile(resolve(depDir, 'package.json'), 'utf8');
						const depPkg = JSON.parse(depPkgRaw);
						pkg.dependencies[dep] = `^${depPkg.version}`;
						console.log(`  Resolved ${dep}: workspace:* -> ^${depPkg.version}`);
					} catch {
						console.error(`  Could not resolve ${dep} from ${depDir}`);
						process.exit(1);
					}
				}
			}
		}

		// Write modified package.json
		await writeFile(pkgPath, JSON.stringify(pkg, null, 2) + '\n');

		// Publish
		const otpFlag = otp ? `--otp=${otp}` : '';
		const dryRunFlag = dryRun ? '--dry-run' : '';
		const cmd = `npm publish --access public ${otpFlag} ${dryRunFlag}`.trim();

		console.log(`  Running: ${cmd}`);
		execSync(cmd, { cwd: resolve(packageDir), stdio: 'inherit' });

		console.log(`\n  Published ${pkg.name}@${pkg.version}`);
	} finally {
		// Always restore original
		await copyFile(backupPath, pkgPath);
		const { unlink } = await import('node:fs/promises');
		await unlink(backupPath);
		console.log('  Restored original package.json');
	}
}

main().catch((err) => {
	console.error(err);
	// Attempt restore on error
	copyFile(backupPath, pkgPath)
		.then(() => import('node:fs/promises').then((fs) => fs.unlink(backupPath)))
		.catch(() => {});
	process.exit(1);
});
