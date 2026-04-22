/**
 * Side-by-side comparison across the three benchmark formats.
 *
 * Expects `reports/benchmarks/history/prompt-only.jsonl`,
 * `…/prompt-plus-catalog.jsonl`, and `…/tool-calling.jsonl`, reads the most
 * recent line from each, and prints a pass-rate diff so you can see how much
 * the generated catalog + tool loop move real workflow success.
 */

import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const historyDir = resolve(repoRoot, 'reports/benchmarks/history');

const formats = ['prompt-only', 'prompt-plus-catalog', 'tool-calling'] as const;
interface Row {
	startedAt: string;
	pass: number;
	fail: number;
}

function lastLine(path: string): Row | null {
	if (!existsSync(path)) return null;
	const lines = readFileSync(path, 'utf8').trim().split('\n').filter(Boolean);
	const last = lines[lines.length - 1];
	return last ? (JSON.parse(last) as Row) : null;
}

const rows: { format: string; row: Row | null }[] = formats.map((f) => ({
	format: f,
	row: lastLine(resolve(historyDir, `${f}.jsonl`))
}));

console.log(`\nDryUI benchmark comparison (most recent run per format)\n`);
console.log(`| Format | Pass | Fail | Rate | Last run |`);
console.log(`| --- | --- | --- | --- | --- |`);
for (const { format, row } of rows) {
	if (!row) {
		console.log(`| ${format} | n/a | n/a | n/a | never |`);
		continue;
	}
	const total = row.pass + row.fail;
	const rate = total === 0 ? '0%' : `${Math.round((row.pass / total) * 100)}%`;
	console.log(`| ${format} | ${row.pass} | ${row.fail} | ${rate} | ${row.startedAt} |`);
}

const withData = rows.filter((r) => r.row !== null).length;
if (withData < 2) {
	console.log(
		`\nRun at least two formats via scripts/benchmark/run.ts to see a meaningful comparison.`
	);
}
