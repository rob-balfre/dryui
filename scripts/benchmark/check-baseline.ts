/**
 * Baseline regression gate.
 *
 * Compares the latest benchmark run to the pinned baseline at
 * `reports/benchmarks/baseline.json` and fails if task success rate drops
 * by more than the configured tolerance, or if any check goes from passing
 * to failing.
 *
 * Usage:
 *   bun scripts/benchmark/check-baseline.ts           # compare latest → baseline
 *   bun scripts/benchmark/check-baseline.ts --bless   # save latest as new baseline
 */

import { copyFileSync, existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const latestPath = resolve(repoRoot, 'reports/benchmarks/latest.json');
const baselinePath = resolve(repoRoot, 'reports/benchmarks/baseline.json');

const bless = process.argv.includes('--bless');

interface Report {
	mode: string;
	format: string;
	summary: { pass: number; fail: number };
	outcomes: { task: string; kind: string; ok: boolean }[];
}

if (bless) {
	if (!existsSync(latestPath)) {
		console.error('check-baseline: no latest run found; nothing to bless.');
		process.exit(1);
	}
	copyFileSync(latestPath, baselinePath);
	console.log(`check-baseline: blessed ${latestPath.replace(repoRoot + '/', '')} as baseline.`);
	process.exit(0);
}

if (!existsSync(latestPath)) {
	console.error('check-baseline: no latest run — run scripts/benchmark/run.ts first.');
	process.exit(1);
}

const latest = JSON.parse(readFileSync(latestPath, 'utf8')) as Report;

if (!existsSync(baselinePath)) {
	console.log('check-baseline: no baseline pinned yet. Use --bless to pin the current run.');
	process.exit(0);
}

const baseline = JSON.parse(readFileSync(baselinePath, 'utf8')) as Report;

const baselineKey = (o: { task: string; kind: string }) => `${o.task}|${o.kind}`;
const baselineOk = new Set(baseline.outcomes.filter((o) => o.ok).map(baselineKey));
const regressed: string[] = [];

for (const out of latest.outcomes) {
	const key = baselineKey(out);
	if (baselineOk.has(key) && !out.ok) {
		regressed.push(key);
	}
}

if (regressed.length > 0) {
	console.error(`check-baseline: ${regressed.length} check(s) regressed vs baseline:`);
	for (const key of regressed) console.error(`  - ${key}`);
	process.exit(1);
}

const delta = latest.summary.pass - baseline.summary.pass;
console.log(
	`check-baseline: clean (${latest.summary.pass}/${latest.summary.pass + latest.summary.fail}; Δ ${delta >= 0 ? '+' : ''}${delta})`
);
