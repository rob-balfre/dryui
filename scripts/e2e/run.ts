/**
 * Orchestrator for the E2E scenarios. Picks one or all, runs them sequentially,
 * prints a human-readable summary, exits 0/1 for downstream shell scripts.
 *
 * Examples:
 *   bun run scripts/e2e/run.ts                    # run every scenario
 *   bun run scripts/e2e/run.ts --only dashboard   # just one
 *   bun run scripts/e2e/run.ts --verbose          # stream phase updates
 *   bun run scripts/e2e/run.ts --stream-codex     # stream decoded Codex events
 *   bun run scripts/e2e/run.ts --codex-stream-raw # stream raw Codex JSONL
 *   bun run scripts/e2e/run.ts --no-codex-plugin  # no DryUI plugin, no user config
 *   bun run scripts/e2e/run.ts --codex-user-config # inherit ~/.codex/config.toml instead
 *   bun run scripts/e2e/run.ts --keep-project     # leave dev server running, print URL
 *   bun run scripts/e2e/run.ts --tarballs <dir>   # override tarball source
 *   bun run scripts/e2e/run.ts --skip-pack        # trust existing tarballs
 *   bun run scripts/e2e/run.ts --open             # open the HTML report when done
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
import { openBrowser } from '../../packages/cli/src/commands/launch-utils.ts';
import { formatScenarioResult, runScenario, type ScenarioResult } from './scenario-harness.ts';
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
	useLocalDryuiPlugin: boolean;
	skipPack: boolean;
	open: boolean;
	codexTimeoutMs: number | null;
}

function printUsage(): void {
	console.log(
		`Usage: bun run scripts/e2e/run.ts [--only <name>] [--tarballs <dir>]\n` +
			`                                   [--keep-project] [--verbose] [--stream-codex]\n` +
			`                                   [--codex-stream-raw] [--codex-user-config]\n` +
			`                                   [--no-codex-plugin] [--skip-pack] [--open]\n` +
			`                                   [--codex-timeout-ms <ms>]\n\n` +
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
		useLocalDryuiPlugin: true,
		skipPack: false,
		open: false,
		codexTimeoutMs: null
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
		} else if (arg === '--tarballs' && next) {
			flags.tarballsDir = resolve(next);
			i++;
		} else if (arg === '--codex-timeout-ms') {
			if (!next || next.startsWith('-')) {
				console.error('[e2e] missing millisecond value after --codex-timeout-ms');
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
			flags.useLocalDryuiPlugin = false;
		} else if (arg === '--no-codex-plugin') {
			flags.useLocalDryuiPlugin = false;
		} else if (arg === '--skip-pack') {
			flags.skipPack = true;
		} else if (arg === '--open') {
			flags.open = true;
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

	let allOk = true;
	const results: ScenarioResult[] = [];
	for (const scenario of scenarios) {
		console.log('');
		console.log(`[e2e] ===== ${scenario.name} =====`);
		const result = await runScenario(scenario, {
			tarballsDir: flags.tarballsDir,
			keepProject: flags.keepProject,
			verbose: flags.verbose,
			streamCodex: flags.streamCodex,
			codexStreamRaw: flags.codexStreamRaw,
			useUserCodexConfig: flags.useUserCodexConfig,
			useLocalDryuiPlugin: flags.useLocalDryuiPlugin,
			...(flags.codexTimeoutMs !== null ? { codexTimeoutMs: flags.codexTimeoutMs } : {})
		});
		results.push(result);
		console.log(formatScenarioResult(result));
		if (!result.ok) allOk = false;
	}

	console.log('');
	console.log('[e2e] summary:');
	for (const r of results) {
		console.log(`  ${r.ok ? 'PASS' : 'FAIL'}  ${r.name}`);
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
				console.log(`  ${r.name.padEnd(10)} ${r.devServer!.url}  (pid ${r.devServer!.pid})`);
			}
		}
	}

	// In --keep-project mode we exit 0 even on failure so the user can still
	// inspect the dev servers we left behind.
	process.exit(flags.keepProject || allOk ? 0 : 1);
}

main().catch((err) => {
	console.error('[e2e] unhandled error:', err);
	process.exit(1);
});
