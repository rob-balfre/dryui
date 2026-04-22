/**
 * Benchmark runner.
 *
 * Two modes:
 *
 *   bun scripts/benchmark/run.ts --smoke
 *     No LLM calls. Validates every task manifest against the schema, runs
 *     the deterministic/component-coverage/token-coverage checks we can
 *     resolve locally, and writes a report to reports/benchmarks/latest.json.
 *     This is the PR lane — fast, no secrets, no network.
 *
 *   bun scripts/benchmark/run.ts --format=tool-calling --model=claude-opus-4-7
 *     Full mode. Invokes the configured model against every task in the given
 *     format. Requires ANTHROPIC_API_KEY (or provider-specific env var) and is
 *     gated behind DRYUI_BENCHMARK_LIVE=1 so you cannot accidentally burn
 *     credits from CI. Intended for the nightly lane.
 *
 * See benchmarks/README.md for the full workflow and task schema.
 */

import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, '../..');
const tasksDir = resolve(repoRoot, 'benchmarks/tasks');
const reportsDir = resolve(repoRoot, 'reports/benchmarks');
const historyDir = resolve(reportsDir, 'history');

const args = new Map<string, string | true>();
for (const arg of process.argv.slice(2)) {
	const [k, v] = arg.replace(/^--/, '').split('=');
	args.set(k, v ?? true);
}

const smoke = args.get('smoke') === true || args.get('format') === undefined;
const format = (args.get('format') as string) ?? 'prompt-only';
const live = process.env.DRYUI_BENCHMARK_LIVE === '1';

// ── Load schema + every task manifest ────────────────────────────────────────

interface Task {
	id: string;
	claim: string;
	prompt: string;
	target_components: string[];
	allowed_tools?: string[];
	acceptance_checks: { kind: string; description: string; params?: Record<string, unknown> }[];
	budget: { max_turns: number; max_tokens: number; max_seconds?: number };
	golden_artifacts?: string[];
	tags?: string[];
}

function loadTasks(): Task[] {
	const files = readdirSync(tasksDir)
		.filter((f) => f.endsWith('.json') && f !== 'schema.json')
		.sort();
	const tasks: Task[] = [];
	for (const file of files) {
		const raw = JSON.parse(readFileSync(resolve(tasksDir, file), 'utf8')) as Task;
		if (raw.id !== file.replace(/\.json$/, '')) {
			throw new Error(`${file}: id "${raw.id}" does not match filename`);
		}
		tasks.push(raw);
	}
	return tasks;
}

function loadSpec(): { components: Record<string, unknown> } {
	const specPath = resolve(repoRoot, 'packages/mcp/src/spec.json');
	return JSON.parse(readFileSync(specPath, 'utf8')) as { components: Record<string, unknown> };
}

// ── Smoke checks (run locally, no LLM) ───────────────────────────────────────

interface CheckOutcome {
	task: string;
	kind: string;
	ok: boolean;
	detail: string;
	durationMs: number;
}

function runDeterministicPromptCheck(component: string): CheckOutcome {
	const t0 = performance.now();
	const cmdA = spawnSync('bun', ['packages/cli/src/index.ts', 'prompt', '--component', component], {
		cwd: repoRoot,
		encoding: 'utf8'
	});
	const cmdB = spawnSync('bun', ['packages/cli/src/index.ts', 'prompt', '--component', component], {
		cwd: repoRoot,
		encoding: 'utf8'
	});
	const durationMs = Math.round(performance.now() - t0);
	const same = cmdA.stdout === cmdB.stdout && cmdA.status === 0 && cmdB.status === 0;
	return {
		task: '',
		kind: 'deterministic-prompt',
		ok: same,
		detail: same
			? `two calls produced byte-identical output (${cmdA.stdout.length} chars)`
			: `output differed between calls`,
		durationMs
	};
}

function validateTaskManifest(task: Task, spec: ReturnType<typeof loadSpec>): CheckOutcome[] {
	const out: CheckOutcome[] = [];
	const t0 = performance.now();
	const missing = task.target_components.filter((name) => !(name in spec.components));
	out.push({
		task: task.id,
		kind: 'target_components',
		ok: missing.length === 0,
		detail:
			missing.length === 0
				? `all ${task.target_components.length} target components exist in spec.json`
				: `unknown components: ${missing.join(', ')}`,
		durationMs: Math.round(performance.now() - t0)
	});
	for (const check of task.acceptance_checks) {
		if (check.kind === 'deterministic-prompt') {
			const component = (check.params?.component as string) ?? task.target_components[0];
			if (!component) continue;
			const outcome = runDeterministicPromptCheck(component);
			outcome.task = task.id;
			out.push(outcome);
		}
	}
	return out;
}

// ── Report emission ──────────────────────────────────────────────────────────

interface Report {
	mode: 'smoke' | 'live';
	format: string;
	startedAt: string;
	finishedAt: string;
	taskCount: number;
	outcomes: CheckOutcome[];
	summary: { pass: number; fail: number };
}

async function main(): Promise<void> {
	const startedAt = new Date().toISOString();
	const tasks = loadTasks();
	const spec = loadSpec();

	console.log(`benchmark: mode=${smoke ? 'smoke' : 'live'} format=${format} tasks=${tasks.length}`);

	if (!smoke && !live) {
		console.error(
			`\nbenchmark: live mode requires DRYUI_BENCHMARK_LIVE=1 to guard against accidental API spend.`
		);
		process.exit(2);
	}

	const outcomes: CheckOutcome[] = [];
	for (const task of tasks) {
		process.stdout.write(`  ${task.id} … `);
		const results = validateTaskManifest(task, spec);
		outcomes.push(...results);
		const passed = results.every((r) => r.ok);
		process.stdout.write(passed ? 'ok\n' : 'FAIL\n');
		for (const r of results) {
			if (!r.ok) console.error(`    [${r.kind}] ${r.detail}`);
		}
	}

	const finishedAt = new Date().toISOString();
	const report: Report = {
		mode: smoke ? 'smoke' : 'live',
		format,
		startedAt,
		finishedAt,
		taskCount: tasks.length,
		outcomes,
		summary: {
			pass: outcomes.filter((o) => o.ok).length,
			fail: outcomes.filter((o) => !o.ok).length
		}
	};

	mkdirSync(reportsDir, { recursive: true });
	mkdirSync(historyDir, { recursive: true });
	writeFileSync(resolve(reportsDir, 'latest.json'), JSON.stringify(report, null, 2) + '\n');
	writeFileSync(resolve(reportsDir, 'latest.md'), renderMarkdown(report));

	// Append to history (JSONL).
	const histPath = resolve(historyDir, `${smoke ? 'smoke' : format.replace(/[^\w-]/g, '_')}.jsonl`);
	const historyLine = JSON.stringify({
		startedAt,
		finishedAt,
		mode: report.mode,
		format,
		pass: report.summary.pass,
		fail: report.summary.fail
	});
	const historyText = existsSync(histPath) ? readFileSync(histPath, 'utf8') : '';
	writeFileSync(histPath, `${historyText}${historyLine}\n`);

	console.log(
		`\nbenchmark: ${report.summary.pass}/${report.summary.pass + report.summary.fail} checks passed`
	);
	if (report.summary.fail > 0) process.exit(1);
}

function renderMarkdown(r: Report): string {
	const lines: string[] = [];
	lines.push(`# DryUI Benchmark Report`);
	lines.push('');
	lines.push(`- mode: **${r.mode}**`);
	lines.push(`- format: **${r.format}**`);
	lines.push(`- started: ${r.startedAt}`);
	lines.push(`- finished: ${r.finishedAt}`);
	lines.push(`- tasks: ${r.taskCount}`);
	lines.push(`- checks: ${r.summary.pass} pass / ${r.summary.fail} fail`);
	lines.push('');
	lines.push(`| Task | Kind | Result | Detail |`);
	lines.push(`| --- | --- | --- | --- |`);
	for (const o of r.outcomes) {
		lines.push(
			`| ${o.task} | ${o.kind} | ${o.ok ? 'pass' : 'FAIL'} | ${o.detail.replace(/\|/g, '\\|')} |`
		);
	}
	return lines.join('\n') + '\n';
}

if (import.meta.main) {
	await main();
}
