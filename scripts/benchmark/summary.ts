/**
 * Prints a concise summary of the most recent benchmark run. Reads from
 * `reports/benchmarks/latest.json` if present, otherwise from stdin for
 * piping in ad-hoc runs.
 */
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

interface Report {
	mode: string;
	format: string;
	startedAt: string;
	taskCount: number;
	outcomes: { task: string; kind: string; ok: boolean; detail: string; durationMs: number }[];
	summary: { pass: number; fail: number };
}

function loadReport(): Report {
	const latestPath = resolve(repoRoot, 'reports/benchmarks/latest.json');
	if (existsSync(latestPath)) {
		return JSON.parse(readFileSync(latestPath, 'utf8')) as Report;
	}
	const stdin = readFileSync(0, 'utf8').trim();
	if (!stdin) {
		console.error('benchmark summary: no latest run found; run `bun run bench:smoke` first.');
		process.exit(1);
	}
	return JSON.parse(stdin) as Report;
}

const r = loadReport();

console.log(`DryUI benchmarks (${r.mode} / ${r.format})`);
console.log(`  started:  ${r.startedAt}`);
console.log(`  tasks:    ${r.taskCount}`);
console.log(`  checks:   ${r.summary.pass} pass / ${r.summary.fail} fail`);

const failing = r.outcomes.filter((o) => !o.ok);
if (failing.length === 0) {
	console.log(`  status:   clean`);
	process.exit(0);
}

console.log(`  status:   FAIL`);
console.log('');
for (const o of failing) {
	console.log(`  × [${o.task}] ${o.kind}: ${o.detail}`);
}
process.exit(1);
