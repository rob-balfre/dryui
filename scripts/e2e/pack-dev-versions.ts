/**
 * Pack every publishable workspace package into a set of .tgz tarballs under
 * reports/e2e-tarballs/ and emit a manifest.json so the E2E harness can point
 * a fresh scaffolded project at dev-version tarballs via `file:` refs instead
 * of pulling whatever is currently on npm.
 *
 * Reuses the publish pipeline's export-swap (rewrites src/→dist/ exports and
 * resolves workspace:* deps) and tarball-scan packTarball helper, so the
 * tarballs produced here are byte-identical to what `changeset publish` would
 * push to npm — minus the actual publish step.
 *
 * Usage:
 *   bun run scripts/e2e/pack-dev-versions.ts                 # build + pack
 *   bun run scripts/e2e/pack-dev-versions.ts --skip-build    # trust existing dist
 *   bun run scripts/e2e/pack-dev-versions.ts --out <dir>     # override output dir
 *
 * Output:
 *   reports/e2e-tarballs/
 *     dryui-ui-1.8.0.tgz
 *     dryui-primitives-1.8.0.tgz
 *     ...
 *     manifest.json
 *
 * manifest.json shape:
 *   {
 *     "generatedAt": "2026-04-23T10:20:30.000Z",
 *     "packages": {
 *       "@dryui/ui": { "version": "1.8.0", "tarball": "/abs/path/dryui-ui-1.8.0.tgz" },
 *       ...
 *     }
 *   }
 */

import { execSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
	restoreExports,
	swapExportsForPublish,
	type ExportSwapBackup
} from '../lib/export-swap.ts';
import { packTarball } from '../lib/tarball-scan.ts';
import { verifyPackageDist, formatIssues, type VerifyIssue } from '../lib/verify-dist.ts';

interface PackedPackage {
	readonly name: string;
	readonly version: string;
	readonly tarball: string;
}

interface Manifest {
	readonly generatedAt: string;
	readonly packages: Record<string, { version: string; tarball: string }>;
}

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, '..', '..');
const packagesDir = resolve(repoRoot, 'packages');

const args = process.argv.slice(2);
const skipBuild = args.includes('--skip-build');
const outFlagIndex = args.indexOf('--out');
const outDir = resolve(
	repoRoot,
	outFlagIndex !== -1 && args[outFlagIndex + 1] ? args[outFlagIndex + 1]! : 'reports/e2e-tarballs'
);

function isPublishable(pkgJsonPath: string): boolean {
	const pkg = JSON.parse(readFileSync(pkgJsonPath, 'utf8')) as Record<string, unknown>;
	return pkg.private !== true;
}

function collectPublishablePackages(): string[] {
	return readdirSync(packagesDir)
		.map((entry) => resolve(packagesDir, entry, 'package.json'))
		.filter((pkgJson) => existsSync(pkgJson) && isPublishable(pkgJson));
}

function cleanOutputDir(): void {
	if (existsSync(outDir)) rmSync(outDir, { recursive: true, force: true });
	mkdirSync(outDir, { recursive: true });
}

function readPackageMeta(pkgJsonPath: string): { name: string; version: string } {
	const pkg = JSON.parse(readFileSync(pkgJsonPath, 'utf8')) as {
		name: string;
		version: string;
	};
	return { name: pkg.name, version: pkg.version };
}

function rel(absPath: string): string {
	return absPath.replace(repoRoot + '/', '');
}

// Build first so dist/ is populated for the post-swap exports to resolve to
// real files. Skip-build is the escape hatch when the caller already built.
if (skipBuild) {
	console.log('pack-dev-versions: --skip-build set, trusting existing dist');
} else {
	console.log('pack-dev-versions: building every publishable package…');
	execSync('bun run build:packages', { cwd: repoRoot, stdio: 'inherit' });
}

const pkgPaths = collectPublishablePackages();

// Verify dist BEFORE swap. Same hardening as scripts/publish-packages.ts:
// a swap on a broken dist happily writes broken paths into the tarball; the
// restore can't un-pack once it's been packed.
console.log('pack-dev-versions: verifying dist (pre-swap)…');
const preflightIssues: VerifyIssue[] = [];
for (const pkgPath of pkgPaths) {
	preflightIssues.push(...verifyPackageDist(pkgPath));
}
if (preflightIssues.length > 0) {
	console.error(
		`pack-dev-versions: ${preflightIssues.length} dist issue(s) — aborting BEFORE swap`
	);
	console.error(formatIssues(preflightIssues, repoRoot));
	process.exit(1);
}

cleanOutputDir();

// Swap every package up-front so the pack step sees workspace:* → concrete
// and publishConfig.exports promoted. If any swap throws, restore what we
// already swapped and abort.
const backups: Array<{ pkgPath: string; backup: ExportSwapBackup }> = [];
const packed: PackedPackage[] = [];

try {
	for (const pkgPath of pkgPaths) {
		backups.push({ pkgPath, backup: swapExportsForPublish(pkgPath, { silent: true }) });
	}

	for (const pkgPath of pkgPaths) {
		const meta = readPackageMeta(pkgPath);
		console.log(`pack-dev-versions: packing ${meta.name}@${meta.version}`);
		const tarball = packTarball(dirname(pkgPath), outDir);
		packed.push({ name: meta.name, version: meta.version, tarball });
	}
} finally {
	for (const { pkgPath, backup } of backups) {
		try {
			restoreExports(pkgPath, backup);
		} catch (restoreErr) {
			console.error(`pack-dev-versions: restore failed for ${pkgPath}`, restoreErr);
		}
	}
}

const manifest: Manifest = {
	generatedAt: new Date().toISOString(),
	packages: Object.fromEntries(
		packed.map((p) => [p.name, { version: p.version, tarball: p.tarball }])
	)
};

const manifestPath = resolve(outDir, 'manifest.json');
writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');

console.log('');
console.log(`pack-dev-versions: packed ${packed.length} tarballs into ${rel(outDir)}`);
for (const p of packed) {
	console.log(`  - ${p.name}@${p.version}  ${rel(p.tarball)}`);
}
console.log(`pack-dev-versions: manifest written to ${rel(manifestPath)}`);
