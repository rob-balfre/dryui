/**
 * Release script that wraps changeset version + publish with publishConfig handling.
 *
 * `changeset publish` calls `npm publish` internally, which doesn't apply
 * publishConfig.exports. This script:
 *   1. Runs `changeset version` to bump versions
 *   2. Temporarily swaps publishConfig into top-level fields for all publishable packages
 *   3. Resolves workspace:* dependencies to real versions
 *   4. Runs `changeset publish`
 *   5. Restores all original package.json files
 *
 * Usage:
 *   bun run scripts/release.ts [--otp <code>]
 */

import { readFile, writeFile, copyFile, unlink } from 'node:fs/promises';
import { resolve } from 'node:path';
import { execSync } from 'node:child_process';

const args = process.argv.slice(2);
const otpIndex = args.indexOf('--otp');
const otp = otpIndex !== -1 ? args[otpIndex + 1] : undefined;

const PUBLISHABLE_PACKAGES = [
	'packages/primitives',
	'packages/ui',
	'packages/mcp',
	'packages/cli',
	'packages/lint',
	'packages/feedback',
	'packages/feedback-server',
	'packages/theme-wizard'
];

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

async function readPkg(dir: string): Promise<PackageJson> {
	return JSON.parse(await readFile(resolve(dir, 'package.json'), 'utf8'));
}

async function swapForPublish(dir: string): Promise<boolean> {
	const pkgPath = resolve(dir, 'package.json');
	const backupPath = resolve(dir, 'package.json.release-backup');
	const pkg = await readPkg(dir);

	const needsSwap = !!(
		pkg.publishConfig?.exports ||
		pkg.publishConfig?.svelte ||
		pkg.publishConfig?.types
	);
	const hasWorkspaceDeps = Object.values(pkg.dependencies || {}).some((v) =>
		String(v).startsWith('workspace:')
	);

	if (!needsSwap && !hasWorkspaceDeps) return false;

	await copyFile(pkgPath, backupPath);

	if (pkg.publishConfig?.exports) pkg.exports = pkg.publishConfig.exports;
	if (pkg.publishConfig?.svelte) pkg.svelte = pkg.publishConfig.svelte;
	if (pkg.publishConfig?.types) pkg.types = pkg.publishConfig.types;
	delete pkg.publishConfig;

	if (pkg.dependencies) {
		for (const [dep, version] of Object.entries(pkg.dependencies)) {
			if (version.startsWith('workspace:')) {
				const depName = dep.replace('@dryui/', '');
				const depPkg = await readPkg(`packages/${depName}`);
				pkg.dependencies[dep] = `^${depPkg.version}`;
				console.log(`  ${pkg.name}: ${dep} workspace:* -> ^${depPkg.version}`);
			}
		}
	}

	await writeFile(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
	return true;
}

async function restoreAll() {
	for (const dir of PUBLISHABLE_PACKAGES) {
		const backupPath = resolve(dir, 'package.json.release-backup');
		const pkgPath = resolve(dir, 'package.json');
		try {
			await copyFile(backupPath, pkgPath);
			await unlink(backupPath);
		} catch {
			// No backup = wasn't swapped
		}
	}
	console.log('\nRestored all package.json files.');
}

async function main() {
	// Step 1: Version bumps
	console.log('Running changeset version...');
	execSync('bunx changeset version', { stdio: 'inherit' });

	// Step 2: Swap publishConfig for all packages
	console.log('\nSwapping publishConfig for publish...');
	let swapped = 0;
	for (const dir of PUBLISHABLE_PACKAGES) {
		if (await swapForPublish(dir)) {
			swapped++;
			const pkg = await readPkg(dir);
			console.log(`  Swapped: ${pkg.name}`);
		}
	}
	console.log(`  ${swapped} packages prepared.`);

	try {
		// Step 3: Publish
		const otpEnv = otp ? `NPM_CONFIG_OTP=${otp}` : '';
		const cmd = `${otpEnv} bunx changeset publish`.trim();
		console.log(`\nPublishing...`);
		execSync(cmd, {
			stdio: 'inherit',
			env: { ...process.env, ...(otp ? { NPM_CONFIG_OTP: otp } : {}) }
		});
	} finally {
		// Step 4: Always restore
		await restoreAll();
	}
}

main().catch(async (err) => {
	console.error(err);
	await restoreAll();
	process.exit(1);
});
