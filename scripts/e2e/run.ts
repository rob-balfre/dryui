/**
 * Orchestrator for the E2E scenarios. Picks one or all, runs the selected
 * agent config(s), prints a human-readable summary, exits 0/1 for downstream
 * shell scripts.
 *
 * Examples:
 *   bun run scripts/e2e/run.ts                    # run every scenario
 *   bun run scripts/e2e/run.ts --only dashboard   # just one
 *   bun run scripts/e2e/run.ts --verbose          # stream phase updates
 *   bun run scripts/e2e/run.ts --stream-codex     # stream decoded Codex events
 *   bun run scripts/e2e/run.ts --codex-stream-raw # stream raw Codex JSONL
 *   bun run scripts/e2e/run.ts --no-codex-feedback # no feedback MCP, no user config
 *   bun run scripts/e2e/run.ts --codex-user-config # inherit ~/.codex/config.toml instead
 *   bun run scripts/e2e/run.ts --agent-matrix  # run the default model matrix in parallel
 *   bun run scripts/e2e/run.ts --agent claude --model sonnet --usage-limit-usd 5
 *   bun run scripts/e2e/run.ts --keep-project     # leave dev server running, print URL
 *   bun run scripts/e2e/run.ts --tarballs <dir>   # override tarball source
 *   bun run scripts/e2e/run.ts --skip-pack        # trust existing tarballs
 *   bun run scripts/e2e/run.ts --open             # open the HTML report when done
 *   bun run scripts/e2e/run.ts --visual-feedback-pass # opt-in second feedback repair
 *
 * By default this script shells out to `pack-dev-versions.ts` first so the
 * tarballs match the current worktree. Pass `--skip-pack` if you've already
 * packed recently and want to save the 5-10s rebuild. After every run it
 * regenerates reports/e2e-runs/index.html with screenshots + timings.
 */

import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { openBrowser } from '../../packages/feedback-server/src/cli/launch-dashboard.ts';
import {
	formatScenarioResult,
	runScenario,
	type ScenarioDefinition,
	type ScenarioResult
} from './scenario-harness.ts';
import type { AgentBackend } from './codex-runner.ts';
import { SCENARIOS, findScenario } from '../../tests/e2e/scenarios/index.ts';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, '..', '..');

interface CliFlags {
	only: string | null;
	tarballsDir: string;
	keepProject: boolean;
	verbose: boolean;
	streamCodex: boolean;
	codexStreamRaw: boolean;
	useUserCodexConfig: boolean;
	useLocalFeedbackMcp: boolean;
	skipPack: boolean;
	open: boolean;
	visualFeedbackPass: boolean;
	agentBackend: AgentBackend;
	agentModel: string | null;
	usageLimitUsd: number | null;
	permissionMode: string | null;
	effort: string | null;
	codexTimeoutMs: number | null;
	agentMatrix: boolean;
	maxParallel: number | null;
}

interface AgentMatrixEntry {
	readonly id: string;
	readonly label: string;
	readonly agentBackend: AgentBackend;
	readonly agentModel: string;
	readonly effort?: string;
}

interface ScenarioRunJob {
	readonly scenario: ScenarioDefinition;
	readonly runLabel: string | null;
	readonly agentBackend: AgentBackend;
	readonly agentModel?: string;
	readonly effort?: string;
}

const DEFAULT_AGENT_MATRIX: readonly AgentMatrixEntry[] = [
	{
		id: 'codex-gpt-5.5-low',
		label: 'codex gpt-5.5 low',
		agentBackend: 'codex',
		agentModel: 'gpt-5.5',
		effort: 'low'
	},
	{
		id: 'codex-gpt-5.5-medium',
		label: 'codex gpt-5.5 medium',
		agentBackend: 'codex',
		agentModel: 'gpt-5.5',
		effort: 'medium'
	},
	{
		id: 'codex-gpt-5.5-high',
		label: 'codex gpt-5.5 high',
		agentBackend: 'codex',
		agentModel: 'gpt-5.5',
		effort: 'high'
	},
	{
		id: 'codex-gpt-5.5-xhigh',
		label: 'codex gpt-5.5 xhigh',
		agentBackend: 'codex',
		agentModel: 'gpt-5.5',
		effort: 'xhigh'
	},
	{
		id: 'claude-sonnet-4.6',
		label: 'claude sonnet 4.6',
		agentBackend: 'claude',
		agentModel: 'claude-sonnet-4-6'
	},
	{
		id: 'claude-opus-4.7-low',
		label: 'claude opus 4.7 low',
		agentBackend: 'claude',
		agentModel: 'claude-opus-4-7',
		effort: 'low'
	},
	{
		id: 'claude-opus-4.7-medium',
		label: 'claude opus 4.7 medium',
		agentBackend: 'claude',
		agentModel: 'claude-opus-4-7',
		effort: 'medium'
	},
	{
		id: 'claude-opus-4.7-high',
		label: 'claude opus 4.7 high',
		agentBackend: 'claude',
		agentModel: 'claude-opus-4-7',
		effort: 'high'
	},
	{
		id: 'claude-opus-4.7-xhigh',
		label: 'claude opus 4.7 xhigh',
		agentBackend: 'claude',
		agentModel: 'claude-opus-4-7',
		effort: 'xhigh'
	},
	{
		id: 'claude-opus-4.7-max',
		label: 'claude opus 4.7 max',
		agentBackend: 'claude',
		agentModel: 'claude-opus-4-7',
		effort: 'max'
	}
];

function printUsage(): void {
	console.log(
		`Usage: bun run scripts/e2e/run.ts [--only <name>] [--tarballs <dir>]\n` +
			`                                   [--keep-project] [--verbose] [--stream-codex]\n` +
			`                                   [--codex-stream-raw] [--codex-user-config]\n` +
			`                                   [--no-codex-feedback] [--skip-pack] [--open]\n` +
			`                                   [--visual-feedback-pass]\n` +
			`                                   [--agent-matrix] [--max-parallel <count>]\n` +
			`                                   [--agent codex|claude] [--model <name>]\n` +
			`                                   [--usage-limit-usd <amount>] [--permission-mode <mode>]\n` +
			`                                   [--effort <level>] [--codex-timeout-ms <ms>]\n\n` +
			`Scenarios: ${SCENARIOS.map((s) => s.name).join(', ')}`
	);
}

function parseArgs(argv: string[]): CliFlags {
	if (argv.includes('--help') || argv.includes('-h')) {
		printUsage();
		process.exit(0);
	}

	const flags: CliFlags = {
		only: null,
		tarballsDir: resolve(repoRoot, 'reports/e2e-tarballs'),
		keepProject: false,
		verbose: false,
		streamCodex: false,
		codexStreamRaw: false,
		useUserCodexConfig: false,
		useLocalFeedbackMcp: true,
		skipPack: false,
		open: false,
		visualFeedbackPass: false,
		agentBackend: 'codex',
		agentModel: null,
		usageLimitUsd: null,
		permissionMode: null,
		effort: null,
		codexTimeoutMs: null,
		agentMatrix: false,
		maxParallel: null
	};
	for (let i = 0; i < argv.length; i++) {
		const arg = argv[i]!;
		const next = argv[i + 1];
		if (arg === '--only') {
			if (!next || next.startsWith('-')) {
				console.error('[e2e] missing scenario name after --only');
				printUsage();
				process.exit(2);
			}
			flags.only = next;
			i++;
		} else if (arg === '--tarballs') {
			if (!next || next.startsWith('-')) {
				console.error('[e2e] missing path after --tarballs');
				printUsage();
				process.exit(2);
			}
			flags.tarballsDir = resolve(next);
			i++;
		} else if (arg === '--agent' || arg === '--backend' || arg === '--runner') {
			if (!next || next.startsWith('-')) {
				console.error(`[e2e] missing agent after ${arg}`);
				printUsage();
				process.exit(2);
			}
			if (next !== 'codex' && next !== 'claude') {
				console.error(`[e2e] invalid agent "${next}" (expected codex or claude)`);
				process.exit(2);
			}
			flags.agentBackend = next;
			i++;
		} else if (arg === '--model') {
			if (!next || next.startsWith('-')) {
				console.error('[e2e] missing model after --model');
				printUsage();
				process.exit(2);
			}
			flags.agentModel = next;
			i++;
		} else if (arg === '--usage-limit-usd') {
			if (!next || next.startsWith('-')) {
				console.error('[e2e] missing amount after --usage-limit-usd');
				printUsage();
				process.exit(2);
			}
			const limit = Number(next);
			if (!Number.isFinite(limit) || limit <= 0) {
				console.error(`[e2e] invalid --usage-limit-usd value: ${next}`);
				process.exit(2);
			}
			flags.usageLimitUsd = limit;
			i++;
		} else if (arg === '--permission-mode') {
			if (!next || next.startsWith('-')) {
				console.error('[e2e] missing mode after --permission-mode');
				printUsage();
				process.exit(2);
			}
			flags.permissionMode = next;
			i++;
		} else if (arg === '--effort') {
			if (!next || next.startsWith('-')) {
				console.error('[e2e] missing effort after --effort');
				printUsage();
				process.exit(2);
			}
			flags.effort = next;
			i++;
		} else if (arg === '--codex-timeout-ms' || arg === '--agent-timeout-ms') {
			if (!next || next.startsWith('-')) {
				console.error(`[e2e] missing millisecond value after ${arg}`);
				printUsage();
				process.exit(2);
			}
			const timeoutMs = Number(next);
			if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
				console.error(`[e2e] invalid --codex-timeout-ms value: ${next}`);
				process.exit(2);
			}
			flags.codexTimeoutMs = Math.floor(timeoutMs);
			i++;
		} else if (arg === '--agent-matrix' || arg === '--matrix') {
			flags.agentMatrix = true;
		} else if (arg === '--no-agent-matrix' || arg === '--single-agent') {
			flags.agentMatrix = false;
		} else if (arg === '--max-parallel') {
			if (!next || next.startsWith('-')) {
				console.error('[e2e] missing count after --max-parallel');
				printUsage();
				process.exit(2);
			}
			const count = Number(next);
			if (!Number.isInteger(count) || count <= 0) {
				console.error(`[e2e] invalid --max-parallel value: ${next}`);
				process.exit(2);
			}
			flags.maxParallel = count;
			i++;
		} else if (arg === '--keep-project') {
			flags.keepProject = true;
		} else if (arg === '--verbose') {
			flags.verbose = true;
		} else if (arg === '--stream-codex') {
			flags.streamCodex = true;
		} else if (arg === '--codex-stream-raw') {
			flags.codexStreamRaw = true;
		} else if (arg === '--codex-user-config') {
			flags.useUserCodexConfig = true;
			flags.useLocalFeedbackMcp = false;
		} else if (
			arg === '--no-codex-feedback' ||
			arg === '--no-codex-dryui' ||
			arg === '--no-codex-plugin'
		) {
			flags.useLocalFeedbackMcp = false;
		} else if (arg === '--skip-pack') {
			flags.skipPack = true;
		} else if (arg === '--open') {
			flags.open = true;
		} else if (arg === '--visual-feedback-pass') {
			flags.visualFeedbackPass = true;
		} else if (!arg.startsWith('-') && flags.only === null) {
			flags.only = arg;
		} else {
			console.error(`Unknown flag: ${arg}`);
			process.exit(2);
		}
	}
	return flags;
}

function regenerateReport(): string | null {
	const generator = resolve(repoRoot, 'scripts/e2e/generate-report.ts');
	const result = spawnSync('bun', ['run', generator], {
		cwd: repoRoot,
		stdio: ['ignore', 'pipe', 'inherit'],
		encoding: 'utf8'
	});
	if (result.status !== 0) {
		console.warn('[e2e] generate-report exited non-zero');
		return null;
	}
	const reportPath = resolve(repoRoot, 'reports/e2e-runs/index.html');
	return existsSync(reportPath) ? reportPath : null;
}

function packDevVersions(tarballsDir: string): void {
	console.log('[e2e] packing dev-version tarballs…');
	const result = spawnSync(
		'bun',
		['run', resolve(repoRoot, 'scripts/e2e/pack-dev-versions.ts'), '--out', tarballsDir],
		{ cwd: repoRoot, stdio: 'inherit' }
	);
	if (result.status !== 0) {
		console.error('[e2e] pack-dev-versions failed');
		process.exit(result.status ?? 1);
	}
}

function buildRunJobs(scenarios: readonly ScenarioDefinition[], flags: CliFlags): ScenarioRunJob[] {
	if (!flags.agentMatrix) {
		return scenarios.map((scenario) => ({
			scenario,
			runLabel: null,
			agentBackend: flags.agentBackend,
			...(flags.agentModel ? { agentModel: flags.agentModel } : {}),
			...(flags.effort ? { effort: flags.effort } : {})
		}));
	}

	if (flags.agentModel || flags.effort || flags.agentBackend !== 'codex') {
		console.error(
			'[e2e] --agent-matrix cannot be combined with --agent, --model, or --effort. Use --single-agent for a one-off run.'
		);
		process.exit(2);
	}

	return scenarios.flatMap((scenario) =>
		DEFAULT_AGENT_MATRIX.map((entry) => ({
			scenario,
			runLabel: entry.label,
			agentBackend: entry.agentBackend,
			agentModel: entry.agentModel,
			...(entry.effort ? { effort: entry.effort } : {})
		}))
	);
}

async function runWithConcurrency<T, R>(
	items: readonly T[],
	limit: number,
	worker: (item: T, index: number) => Promise<R>
): Promise<R[]> {
	const results = new Array<R>(items.length);
	let nextIndex = 0;
	const workerCount = Math.min(limit, items.length);
	await Promise.all(
		Array.from({ length: workerCount }, async () => {
			while (true) {
				const index = nextIndex++;
				if (index >= items.length) return;
				results[index] = await worker(items[index]!, index);
			}
		})
	);
	return results;
}

async function main(): Promise<void> {
	const flags = parseArgs(process.argv.slice(2));

	if (!flags.skipPack) {
		packDevVersions(flags.tarballsDir);
	} else if (!existsSync(resolve(flags.tarballsDir, 'manifest.json'))) {
		console.error(`[e2e] --skip-pack set but ${flags.tarballsDir}/manifest.json does not exist`);
		process.exit(2);
	}

	let scenarios = SCENARIOS;
	if (flags.only) {
		const chosen = findScenario(flags.only);
		if (!chosen) {
			console.error(
				`[e2e] unknown scenario "${flags.only}". Known: ${SCENARIOS.map((s) => s.name).join(', ')}`
			);
			process.exit(2);
		}
		scenarios = [chosen];
	}

	console.log(
		`[e2e] running ${scenarios.length} scenario(s): ${scenarios.map((s) => s.name).join(', ')}`
	);

	const jobs = buildRunJobs(scenarios, flags);
	const maxParallel = flags.maxParallel ?? jobs.length;
	if (flags.agentMatrix) {
		console.log(
			`[e2e] agent matrix: ${DEFAULT_AGENT_MATRIX.map((entry) => entry.label).join(', ')}`
		);
	}
	console.log(
		`[e2e] run jobs: ${jobs.length} (max parallel ${Math.min(maxParallel, jobs.length)})`
	);

	let allOk = true;
	const outcomes = await runWithConcurrency(jobs, maxParallel, async (job) => {
		const displayName = job.runLabel ? `${job.scenario.name} / ${job.runLabel}` : job.scenario.name;
		console.log('');
		console.log(`[e2e] ===== ${displayName} =====`);
		try {
			const result = await runScenario(job.scenario, {
				tarballsDir: flags.tarballsDir,
				keepProject: flags.keepProject,
				verbose: flags.verbose,
				streamCodex: flags.streamCodex,
				codexStreamRaw: flags.codexStreamRaw,
				useUserCodexConfig: flags.useUserCodexConfig,
				useLocalFeedbackMcp: flags.useLocalFeedbackMcp,
				visualFeedbackPass: flags.visualFeedbackPass,
				agentBackend: job.agentBackend,
				...(job.agentModel ? { agentModel: job.agentModel } : {}),
				...(flags.usageLimitUsd !== null ? { usageLimitUsd: flags.usageLimitUsd } : {}),
				...(flags.permissionMode ? { permissionMode: flags.permissionMode } : {}),
				...(job.effort ? { effort: job.effort } : {}),
				...(flags.codexTimeoutMs !== null ? { codexTimeoutMs: flags.codexTimeoutMs } : {}),
				...(job.runLabel ? { runLabel: job.runLabel } : {})
			});
			console.log(formatScenarioResult(result));
			return { job, result, error: null };
		} catch (error) {
			console.error(
				`[e2e] ${displayName} failed before result.json: ${
					error instanceof Error ? error.stack || error.message : String(error)
				}`
			);
			return { job, result: null, error };
		}
	});
	const results = outcomes
		.map((outcome) => outcome.result)
		.filter((result): result is ScenarioResult => result !== null);
	allOk = outcomes.every((outcome) => outcome.error === null && outcome.result?.ok === true);

	console.log('');
	console.log('[e2e] summary:');
	for (const outcome of outcomes) {
		const displayName = outcome.job.runLabel
			? `${outcome.job.scenario.name} / ${outcome.job.runLabel}`
			: outcome.job.scenario.name;
		if (outcome.result) {
			console.log(`  ${outcome.result.ok ? 'PASS' : 'FAIL'}  ${displayName}`);
		} else {
			console.log(`  FAIL  ${displayName} (no result.json)`);
		}
	}

	const reportPath = regenerateReport();
	if (reportPath) {
		const reportUrl = pathToFileURL(reportPath).toString();
		console.log('');
		console.log(`[e2e] report: ${reportUrl}`);
		if (flags.open) openBrowser(reportUrl);
	}

	if (flags.keepProject) {
		const alive = results.filter((r) => r.devServer !== null);
		if (alive.length > 0) {
			console.log('');
			console.log('[e2e] --keep-project: dev servers still running (kill by PID when done):');
			for (const r of alive) {
				const name = r.runLabel ? `${r.name} / ${r.runLabel}` : r.name;
				console.log(`  ${name.padEnd(34)} ${r.devServer!.url}  (pid ${r.devServer!.pid})`);
			}
		}
	}

	// In --keep-project mode we exit 0 even on failure so the user can still
	// inspect the dev servers we left behind.
	process.exit(flags.keepProject || allOk ? 0 : 1);
}

if (import.meta.main) {
	main().catch((err) => {
		console.error('[e2e] unhandled error:', err);
		process.exit(1);
	});
}
