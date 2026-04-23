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
import { spawn, spawnSync } from 'node:child_process';
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

function runAsync(
	cmd: string,
	args: string[],
	cwd: string
): Promise<{ ok: boolean; output: string }> {
	return new Promise((resolve) => {
		const child = spawn(cmd, args, {
			cwd,
			stdio: ['ignore', 'pipe', 'pipe']
		});
		const chunks: Buffer[] = [];
		child.stdout.on('data', (chunk: Buffer) => chunks.push(chunk));
		child.stderr.on('data', (chunk: Buffer) => chunks.push(chunk));
		child.on('error', (err) => {
			resolve({ ok: false, output: String(err) });
		});
		child.on('close', (code) => {
			resolve({ ok: code === 0, output: Buffer.concat(chunks).toString('utf8') });
		});
	});
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

export interface PackageHygieneResult {
	pkgPath: string;
	name: string;
	ok: boolean;
	failures: string[];
}

export interface PackageHygieneSummary {
	ok: boolean;
	failures: string[];
	results: PackageHygieneResult[];
}

interface CheckPackagesOptions {
	concurrency?: number;
	onResult?: (result: PackageHygieneResult) => void;
}

async function checkPackageAsync(pkgPath: string): Promise<PackageHygieneResult> {
	const dir = dirname(pkgPath);
	const name = pkgName(pkgPath);
	const failures: string[] = [];

	const publint = await runAsync('bunx', ['publint'], dir);
	if (!publint.ok) {
		failures.push(`publint failed for ${name}:\n${publint.output}`);
	}

	const attw = await runAsync(
		'bunx',
		['attw', '--pack', '.', '--ignore-rules', ...ATTW_IGNORE],
		dir
	);
	if (!attw.ok) {
		failures.push(`attw failed for ${name}:\n${attw.output}`);
	}

	return { pkgPath, name, ok: failures.length === 0, failures };
}

function defaultConcurrency(packageCount: number): number {
	const fromEnv = Number(process.env.DRYUI_PUBLISH_HYGIENE_CONCURRENCY);
	const requested = Number.isFinite(fromEnv) && fromEnv > 0 ? Math.floor(fromEnv) : 3;
	return Math.max(1, Math.min(packageCount, requested));
}

async function mapLimit<T, R>(
	items: T[],
	limit: number,
	worker: (item: T, index: number) => Promise<R>
): Promise<R[]> {
	const results = new Array<R>(items.length);
	let next = 0;

	async function runNext(): Promise<void> {
		while (next < items.length) {
			const index = next;
			next += 1;
			results[index] = await worker(items[index]!, index);
		}
	}

	await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => runNext()));
	return results;
}

export async function checkPackages(
	pkgPaths: string[],
	options: CheckPackagesOptions = {}
): Promise<PackageHygieneSummary> {
	const concurrency = options.concurrency ?? defaultConcurrency(pkgPaths.length);
	const results = await mapLimit(pkgPaths, concurrency, async (pkgPath) => {
		const result = await checkPackageAsync(pkgPath);
		options.onResult?.(result);
		return result;
	});
	const failures = results.flatMap((result) => result.failures);
	return { ok: failures.length === 0, failures, results };
}

async function main() {
	const swap = process.argv.includes('--swap');
	const pkgPaths: string[] = [];
	for (const entry of readdirSync(packagesDir)) {
		const pkgJson = resolve(packagesDir, entry, 'package.json');
		if (existsSync(pkgJson) && isPublishable(pkgJson)) pkgPaths.push(pkgJson);
	}

	const backups: Array<{ pkgPath: string; backup: ExportSwapBackup }> = [];
	let summary: PackageHygieneSummary = { ok: true, failures: [], results: [] };
	try {
		if (swap) {
			for (const pkgPath of pkgPaths) {
				backups.push({ pkgPath, backup: swapExportsForPublish(pkgPath, { silent: true }) });
			}
		}
		summary = await checkPackages(pkgPaths, {
			onResult: (result) => {
				console.log(`check-publish-hygiene: ${result.name} ${result.ok ? 'ok' : 'FAIL'}`);
			}
		});
	} finally {
		if (swap) {
			for (const { pkgPath, backup } of backups) {
				restoreExports(pkgPath, backup);
			}
		}
	}

	if (!summary.ok) {
		console.error('\ncheck-publish-hygiene: failures detected\n');
		for (const failure of summary.failures) {
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
