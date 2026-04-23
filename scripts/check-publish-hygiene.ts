/**
 * Runs publint + attw across every publishable package.
 *
 * Two modes:
 *
 *   bun scripts/check-publish-hygiene.ts
 *     Validate the source-layout exports (what workspace consumers see).
 *     Useful for local dev. Does NOT reflect the shape npm will see.
 *
 *   bun scripts/check-publish-hygiene.ts --swap
 *     Temporarily applies the prepack export-swap, runs the checks against
 *     the post-swap shape (what the published tarball will expose), then
 *     restores the on-disk package.json in a finally block. This is the
 *     accurate pre-publish gate.
 *
 * Called from scripts/publish-packages.ts (post-swap, pre-publish) with the
 * swap already applied, and as a standalone step from scripts/validate.ts
 * via --swap.
 */

import { readdirSync, existsSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { swapExportsForPublish, restoreExports, type ExportSwapBackup } from './lib/export-swap.ts';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, '..');
const packagesDir = resolve(repoRoot, 'packages');

const ATTW_IGNORE = ['no-resolution', 'cjs-resolves-to-esm', 'internal-resolution-error'];

function isPublishable(pkgPath: string): boolean {
	const pkg = JSON.parse(readFileSync(pkgPath, 'utf8')) as Record<string, unknown>;
	return pkg.private !== true;
}

function pkgName(pkgPath: string): string {
	const pkg = JSON.parse(readFileSync(pkgPath, 'utf8')) as { name?: string };
	return pkg.name ?? pkgPath;
}

function run(cmd: string, args: string[], cwd: string): { ok: boolean; output: string } {
	const res = spawnSync(cmd, args, {
		cwd,
		stdio: ['ignore', 'pipe', 'pipe'],
		encoding: 'utf8'
	});
	const output = `${res.stdout ?? ''}${res.stderr ?? ''}`;
	return { ok: res.status === 0, output };
}

export function checkPackage(pkgPath: string): { ok: boolean; failures: string[] } {
	const dir = dirname(pkgPath);
	const failures: string[] = [];

	const publint = run('bunx', ['publint'], dir);
	if (!publint.ok) {
		failures.push(`publint failed for ${pkgName(pkgPath)}:\n${publint.output}`);
	}

	const attw = run('bunx', ['attw', '--pack', '.', '--ignore-rules', ...ATTW_IGNORE], dir);
	if (!attw.ok) {
		failures.push(`attw failed for ${pkgName(pkgPath)}:\n${attw.output}`);
	}

	return { ok: failures.length === 0, failures };
}

async function main() {
	const swap = process.argv.includes('--swap');
	const pkgPaths: string[] = [];
	for (const entry of readdirSync(packagesDir)) {
		const pkgJson = resolve(packagesDir, entry, 'package.json');
		if (existsSync(pkgJson) && isPublishable(pkgJson)) pkgPaths.push(pkgJson);
	}

	const backups: Array<{ pkgPath: string; backup: ExportSwapBackup }> = [];
	let allOk = true;
	const allFailures: string[] = [];
	try {
		if (swap) {
			for (const pkgPath of pkgPaths) {
				backups.push({ pkgPath, backup: swapExportsForPublish(pkgPath, { silent: true }) });
			}
		}
		for (const pkgPath of pkgPaths) {
			process.stdout.write(`check-publish-hygiene: ${pkgName(pkgPath)} `);
			const result = checkPackage(pkgPath);
			if (result.ok) {
				process.stdout.write('ok\n');
			} else {
				process.stdout.write('FAIL\n');
				allOk = false;
				allFailures.push(...result.failures);
			}
		}
	} finally {
		if (swap) {
			for (const { pkgPath, backup } of backups) {
				restoreExports(pkgPath, backup);
			}
		}
	}

	if (!allOk) {
		console.error('\ncheck-publish-hygiene: failures detected\n');
		for (const failure of allFailures) {
			console.error(failure);
			console.error('---');
		}
		process.exit(1);
	}
	console.log('\ncheck-publish-hygiene: all packages clean');
}

if (import.meta.main) {
	await main();
}
