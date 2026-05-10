/**
 * DryUI evaluation loop orchestrator.
 *
 * Runs an existing E2E scenario, writes deterministic analysis artifacts, then
 * optionally asks an agent to make one narrow DryUI patch and reruns the scenario.
 *
 * Default mode is read-only after the scenario run: it writes the patch prompt
 * under reports/eval-loops/<run>/round-N/patch-prompt.md. Pass
 * --apply-patches to let the configured agent execute that prompt against this repo.
 */

import { spawnSync } from 'node:child_process';
import {
	existsSync,
	mkdirSync,
	readFileSync,
	readdirSync,
	writeFileSync,
	copyFileSync
} from 'node:fs';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { formatScenarioResult, runScenario, type ScenarioResult } from '../e2e/scenario-harness.ts';
import { runAgentExec, summarizeCodexRun, type AgentBackend } from '../e2e/codex-runner.ts';
import { findScenario, SCENARIOS } from '../../tests/e2e/scenarios/index.ts';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, '../..');
const defaultTarballsDir = resolve(repoRoot, 'reports/e2e-tarballs');
const loopsDir = resolve(repoRoot, 'reports/eval-loops');

interface Flags {
	scenario: string;
	rounds: number;
	tarballsDir: string;
	applyPatches: boolean;
	skipPack: boolean;
	streamCodex: boolean;
	visualFeedbackPass: boolean;
	agentBackend: AgentBackend;
	agentModel: string | null;
	usageLimitUsd: number | null;
	permissionMode: string | null;
	effort: string | null;
	codexTimeoutMs: number | null;
	patchTimeoutMs: number;
	keepProjects: boolean;
}

interface ComponentInventory {
	names: string[];
	nameSet: Set<string>;
}

interface EvalAnalysis {
	schemaVersion: 1;
	scenario: string;
	round: number;
	ok: boolean;
	score: number;
	resultPath: string;
	projectDir: string;
	logDir: string;
	phaseDurationsMs: Record<string, number>;
	agent: {
		backend: string | null;
		model: string | null;
	};
	tokens: {
		input: number | null;
		cached: number | null;
		output: number | null;
		total: number | null;
	};
	componentCoverage: {
		requestedInPrompt: string[];
		importedFromDryui: string[];
		likelySkipped: string[];
		hallucinatedImports: string[];
	};
	failures: Array<{ kind: string; detail: string }>;
	artifacts: {
		transcriptPath: string | null;
		lastMessagePath: string | null;
		screenshots: Array<{ label: string; path: string; url: string }>;
		logs: Record<string, string>;
	};
	judge: null;
}

function printUsage(): void {
	console.log(
		`Usage: bun run scripts/eval/run-loop.ts [--scenario dashboard] [--rounds 2]\n` +
			`                                         [--apply-patches] [--skip-pack]\n` +
			`                                         [--stream-codex] [--visual-feedback-pass]\n` +
			`                                         [--agent codex|claude] [--model <name>]\n` +
			`                                         [--usage-limit-usd <amount>]\n` +
			`                                         [--permission-mode <mode>] [--effort <level>]\n` +
			`                                         [--keep-projects]\n` +
			`                                         [--codex-timeout-ms <ms>] [--patch-timeout-ms <ms>]\n\n` +
			`Scenarios: ${SCENARIOS.map((s) => s.name).join(', ')}`
	);
}

function parseArgs(argv: string[]): Flags {
	const flags: Flags = {
		scenario: 'dashboard',
		rounds: 1,
		tarballsDir: defaultTarballsDir,
		applyPatches: false,
		skipPack: false,
		streamCodex: false,
		visualFeedbackPass: false,
		agentBackend: 'codex',
		agentModel: null,
		usageLimitUsd: null,
		permissionMode: null,
		effort: null,
		codexTimeoutMs: null,
		patchTimeoutMs: 12 * 60 * 1000,
		keepProjects: false
	};

	for (let i = 0; i < argv.length; i++) {
		const arg = argv[i]!;
		const next = argv[i + 1];
		if (arg === '--help' || arg === '-h') {
			printUsage();
			process.exit(0);
		} else if (arg === '--scenario' || arg === '--only') {
			if (!next || next.startsWith('-')) throw new Error(`missing scenario after ${arg}`);
			flags.scenario = next;
			i++;
		} else if (arg === '--rounds') {
			if (!next || next.startsWith('-')) throw new Error('missing value after --rounds');
			const value = Number(next);
			if (!Number.isInteger(value) || value < 1) throw new Error(`invalid --rounds ${next}`);
			flags.rounds = value;
			i++;
		} else if (arg === '--tarballs') {
			if (!next || next.startsWith('-')) throw new Error('missing path after --tarballs');
			flags.tarballsDir = resolve(next);
			i++;
		} else if (arg === '--agent' || arg === '--backend' || arg === '--runner') {
			if (!next || next.startsWith('-')) throw new Error(`missing agent after ${arg}`);
			if (next !== 'codex' && next !== 'claude') {
				throw new Error(`invalid agent "${next}" (expected codex or claude)`);
			}
			flags.agentBackend = next;
			i++;
		} else if (arg === '--model') {
			if (!next || next.startsWith('-')) throw new Error('missing value after --model');
			flags.agentModel = next;
			i++;
		} else if (arg === '--usage-limit-usd') {
			if (!next || next.startsWith('-')) throw new Error('missing value after --usage-limit-usd');
			const value = Number(next);
			if (!Number.isFinite(value) || value <= 0) throw new Error(`invalid limit ${next}`);
			flags.usageLimitUsd = value;
			i++;
		} else if (arg === '--permission-mode') {
			if (!next || next.startsWith('-')) throw new Error('missing value after --permission-mode');
			flags.permissionMode = next;
			i++;
		} else if (arg === '--effort') {
			if (!next || next.startsWith('-')) throw new Error('missing value after --effort');
			flags.effort = next;
			i++;
		} else if (arg === '--codex-timeout-ms' || arg === '--agent-timeout-ms') {
			if (!next || next.startsWith('-')) throw new Error(`missing value after ${arg}`);
			const value = Number(next);
			if (!Number.isFinite(value) || value <= 0) throw new Error(`invalid timeout ${next}`);
			flags.codexTimeoutMs = Math.floor(value);
			i++;
		} else if (arg === '--patch-timeout-ms') {
			if (!next || next.startsWith('-')) throw new Error('missing value after --patch-timeout-ms');
			const value = Number(next);
			if (!Number.isFinite(value) || value <= 0) throw new Error(`invalid timeout ${next}`);
			flags.patchTimeoutMs = Math.floor(value);
			i++;
		} else if (arg === '--apply-patches') {
			flags.applyPatches = true;
		} else if (arg === '--skip-pack') {
			flags.skipPack = true;
		} else if (arg === '--stream-codex') {
			flags.streamCodex = true;
		} else if (arg === '--visual-feedback-pass') {
			flags.visualFeedbackPass = true;
		} else if (arg === '--keep-projects') {
			flags.keepProjects = true;
		} else if (!arg.startsWith('-')) {
			flags.scenario = arg;
		} else {
			throw new Error(`unknown flag: ${arg}`);
		}
	}

	return flags;
}

function packDevVersions(tarballsDir: string): void {
	const result = spawnSync(
		'bun',
		['run', resolve(repoRoot, 'scripts/e2e/pack-dev-versions.ts'), '--out', tarballsDir],
		{ cwd: repoRoot, stdio: 'inherit' }
	);
	if (result.status !== 0) {
		throw new Error(`pack-dev-versions failed with exit ${result.status ?? 'null'}`);
	}
}

function regenerateE2eReport(): string | null {
	const result = spawnSync('bun', ['run', resolve(repoRoot, 'scripts/e2e/generate-report.ts')], {
		cwd: repoRoot,
		stdio: 'inherit'
	});
	if (result.status !== 0) return null;
	const reportPath = resolve(repoRoot, 'reports/e2e-runs/index.html');
	return existsSync(reportPath) ? reportPath : null;
}

function loadComponentInventory(): ComponentInventory {
	const srcDir = resolve(repoRoot, 'packages/ui/src');
	const names = readdirSync(srcDir, { withFileTypes: true })
		.filter((entry) => entry.isDirectory())
		.flatMap((entry) => {
			const metaPath = resolve(srcDir, entry.name, `${entry.name}.meta.ts`);
			if (!existsSync(metaPath)) return [];
			const text = readFileSync(metaPath, 'utf8');
			const match = text.match(/\bname:\s*['"]([^'"]+)['"]/);
			return match?.[1] ? [match[1]] : [];
		})
		.sort((a, b) => a.localeCompare(b));
	return { names, nameSet: new Set(names) };
}

function extractDryuiImports(source: string): string[] {
	const imports = new Set<string>();
	const blockRe = /import\s*\{([^}]+)\}\s*from\s*['"]@dryui\/ui(?:\/[^'"]*)?['"]/g;
	for (const match of source.matchAll(blockRe)) {
		const named = match[1] ?? '';
		for (const part of named.split(',')) {
			const raw = part.trim();
			if (!raw) continue;
			const imported = raw.split(/\s+as\s+/i)[0]?.trim();
			if (imported) imports.add(imported);
		}
	}
	return [...imports].sort((a, b) => a.localeCompare(b));
}

function findPromptComponentMentions(prompt: string, inventory: ComponentInventory): string[] {
	const out = inventory.names.filter((name) => {
		const re = new RegExp(`\\b${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`);
		return re.test(prompt);
	});
	return out.sort((a, b) => a.localeCompare(b));
}

function readRouteSource(projectDir: string): string {
	const routePath = resolve(projectDir, 'src/routes/+page.svelte');
	return existsSync(routePath) ? readFileSync(routePath, 'utf8') : '';
}

function findLogs(logDir: string): Record<string, string> {
	const known = [
		'build.log',
		'codex-transcript.jsonl',
		'codex-last-message.txt',
		'dev-server.log',
		'feedback-server.log',
		'scaffold.log',
		'feedback-codex/codex-transcript.jsonl',
		'feedback-codex/codex-last-message.txt'
	];
	return Object.fromEntries(
		known
			.map((name) => [name, resolve(logDir, name)] as const)
			.filter(([, path]) => existsSync(path))
	);
}

function getTokens(result: ScenarioResult): EvalAnalysis['tokens'] {
	if (!result.codex) return { input: null, cached: null, output: null, total: null };
	const totals = result.codex.events.reduce(
		(acc, event) => {
			const usage =
				event.type === 'turn.completed' && typeof event.usage === 'object' && event.usage !== null
					? (event.usage as Record<string, unknown>)
					: event.type === 'assistant' &&
						  typeof (event.message as Record<string, unknown> | undefined)?.usage === 'object'
						? ((event.message as Record<string, unknown>).usage as Record<string, unknown>)
						: null;
			if (!usage) return acc;
			const input =
				num(usage.input_tokens) +
				num(usage.inputTokens) +
				num(usage.cache_creation_input_tokens) +
				num(usage.cacheCreationInputTokens);
			const cached =
				num(usage.cached_input_tokens) +
				num(usage.cache_read_input_tokens) +
				num(usage.cacheReadInputTokens);
			const output = num(usage.output_tokens) + num(usage.outputTokens);
			return {
				input: acc.input + input,
				cached: acc.cached + cached,
				output: acc.output + output
			};
		},
		{ input: 0, cached: 0, output: 0 }
	);
	const input = totals.input > 0 ? totals.input : null;
	const cached = totals.cached > 0 ? totals.cached : null;
	const output = totals.output > 0 ? totals.output : null;
	const total = input !== null && output !== null ? input + output : null;
	return { input, cached, output, total };
}

function num(value: unknown): number {
	return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

function buildAnalysis(
	result: ScenarioResult,
	prompt: string,
	round: number,
	inventory: ComponentInventory
): EvalAnalysis {
	const source = readRouteSource(result.projectDir);
	const requested = findPromptComponentMentions(prompt, inventory);
	const imported = extractDryuiImports(source);
	const importedSet = new Set(imported);
	const hallucinated = imported.filter((name) => !inventory.nameSet.has(name));
	const likelySkipped = requested.filter((name) => !importedSet.has(name));
	const failures: EvalAnalysis['failures'] = [];

	for (const phase of result.phases) {
		if (!phase.ok) failures.push({ kind: `phase:${phase.name}`, detail: phase.note ?? 'failed' });
	}
	for (const failure of result.assertionFailures) {
		failures.push({ kind: 'assertion', detail: failure });
	}
	for (const name of hallucinated) {
		failures.push({ kind: 'hallucinated-import', detail: name });
	}

	const score = Math.max(
		0,
		100 -
			result.phases.filter((phase) => !phase.ok).length * 20 -
			result.assertionFailures.length * 8 -
			hallucinated.length * 10
	);

	return {
		schemaVersion: 1,
		scenario: result.name,
		round,
		ok: result.ok,
		score,
		resultPath: resolve(result.logDir, 'result.json'),
		projectDir: result.projectDir,
		logDir: result.logDir,
		phaseDurationsMs: Object.fromEntries(
			result.phases.map((phase) => [phase.name, phase.durationMs])
		),
		agent: {
			backend: result.codex?.backend ?? null,
			model: result.codex?.model ?? null
		},
		tokens: getTokens(result),
		componentCoverage: {
			requestedInPrompt: requested,
			importedFromDryui: imported,
			likelySkipped,
			hallucinatedImports: hallucinated
		},
		failures,
		artifacts: {
			transcriptPath: result.codex?.transcriptPath ?? null,
			lastMessagePath: result.codex?.lastMessagePath ?? null,
			screenshots: result.screenshots,
			logs: findLogs(result.logDir)
		},
		judge: null
	};
}

function renderPatchPrompt(analysis: EvalAnalysis, prompt: string): string {
	const analysisJson = JSON.stringify(analysis, null, 2);
	return `You are improving DryUI based on one E2E evaluation round.

Goal: make one narrow repo patch that should improve the next run of the same scenario.

Scenario prompt:

\`\`\`text
${prompt}
\`\`\`

Evaluation analysis:

\`\`\`json
${analysisJson}
\`\`\`

Rules:
- Do not edit the generated consumer project under ${analysis.projectDir}.
- Prefer patches to the canonical DryUI source: packages, skills, lint hints, feedback prompts, docs metadata, or scenario definitions.
- Make exactly one coherent improvement. Do not bundle unrelated cleanups.
- If the failure is caused by stale benchmark/scenario instructions, patch the stale instruction instead of hiding it in generated output.
- If the output passed but was expensive, look for prompt, skill, or metadata reductions that preserve correctness.
- Run the smallest relevant validation command after editing and report it.

Useful artifacts:
- Result: ${analysis.resultPath}
- Log dir: ${analysis.logDir}
- Transcript: ${analysis.artifacts.transcriptPath ?? '(missing)'}
- Last message: ${analysis.artifacts.lastMessagePath ?? '(missing)'}
- Screenshots: ${analysis.artifacts.screenshots.map((s) => `${s.label}=${s.path}`).join(', ') || '(none)'}
`;
}

function writeRoundArtifacts(
	loopDir: string,
	round: number,
	result: ScenarioResult,
	analysis: EvalAnalysis,
	patchPrompt: string
): { roundDir: string; analysisPath: string; promptPath: string } {
	const roundDir = resolve(loopDir, `round-${round}`);
	mkdirSync(roundDir, { recursive: true });
	const analysisPath = resolve(roundDir, 'analysis.json');
	const promptPath = resolve(roundDir, 'patch-prompt.md');
	writeFileSync(analysisPath, JSON.stringify(analysis, null, 2) + '\n');
	writeFileSync(promptPath, patchPrompt);
	writeFileSync(resolve(result.logDir, 'analysis.json'), JSON.stringify(analysis, null, 2) + '\n');

	const resultPath = resolve(result.logDir, 'result.json');
	if (existsSync(resultPath)) {
		copyFileSync(resultPath, resolve(roundDir, 'e2e-result.json'));
	}

	return { roundDir, analysisPath, promptPath };
}

async function applyPatchPrompt(prompt: string, roundDir: string, flags: Flags): Promise<boolean> {
	const patchLogDir = resolve(roundDir, 'patch-agent');
	const result = await runAgentExec({
		backend: flags.agentBackend,
		projectDir: repoRoot,
		prompt,
		logDir: patchLogDir,
		timeoutMs: flags.patchTimeoutMs,
		...(flags.agentModel ? { model: flags.agentModel } : {}),
		...(flags.usageLimitUsd !== null ? { usageLimitUsd: flags.usageLimitUsd } : {}),
		...(flags.permissionMode ? { permissionMode: flags.permissionMode } : {}),
		...(flags.effort ? { effort: flags.effort } : {}),
		allowShell: true,
		useLocalFeedbackMcp: false,
		onStdoutLine: (line) => {
			if (line.includes('"type":"turn.completed"') || line.includes('"type":"result"'))
				console.log('[eval] patch agent turn completed');
		},
		onStderrLine: (line) => {
			if (line.trim()) console.error(`[eval] patch agent: ${line}`);
		}
	});
	writeFileSync(resolve(roundDir, 'patch-summary.txt'), summarizeCodexRun(result) + '\n');
	return result.ok;
}

function renderLoopSummary(loopDir: string, analyses: EvalAnalysis[]): string {
	const lines: string[] = [];
	lines.push('# DryUI Evaluation Loop');
	lines.push('');
	lines.push(`- loop: ${loopDir}`);
	lines.push(`- rounds: ${analyses.length}`);
	lines.push('');
	lines.push('| Round | Agent | Result | Score | Tokens | Time | Hallucinated | Likely skipped |');
	lines.push('| --- | --- | --- | ---: | ---: | ---: | --- | --- |');
	for (const a of analyses) {
		const totalMs = Object.values(a.phaseDurationsMs).reduce((sum, value) => sum + value, 0);
		const agent = [a.agent.backend, a.agent.model].filter(Boolean).join(' ') || '-';
		lines.push(
			[
				`| ${a.round}`,
				agent,
				a.ok ? 'PASS' : 'FAIL',
				String(a.score),
				a.tokens.total === null ? '-' : String(a.tokens.total),
				`${(totalMs / 1000).toFixed(1)}s`,
				a.componentCoverage.hallucinatedImports.join(', ') || '-',
				a.componentCoverage.likelySkipped.slice(0, 10).join(', ') || '-'
			].join(' | ') + ' |'
		);
	}
	lines.push('');
	lines.push('## Artifacts');
	lines.push('');
	for (const a of analyses) {
		lines.push(
			`- Round ${a.round}: ${pathToFileURL(resolve(loopDir, `round-${a.round}`)).toString()}`
		);
	}
	return lines.join('\n') + '\n';
}

async function main(): Promise<void> {
	const flags = parseArgs(process.argv.slice(2));
	const scenario = findScenario(flags.scenario);
	if (!scenario) {
		throw new Error(
			`unknown scenario "${flags.scenario}". Known: ${SCENARIOS.map((s) => s.name).join(', ')}`
		);
	}

	if (!flags.skipPack) {
		console.log('[eval] packing dev-version tarballs');
		packDevVersions(flags.tarballsDir);
	} else if (!existsSync(resolve(flags.tarballsDir, 'manifest.json'))) {
		throw new Error(`--skip-pack set but ${flags.tarballsDir}/manifest.json does not exist`);
	}

	const loopDir = resolve(loopsDir, `${scenario.name}-${Date.now()}`);
	mkdirSync(loopDir, { recursive: true });
	const inventory = loadComponentInventory();
	const analyses: EvalAnalysis[] = [];

	for (let round = 1; round <= flags.rounds; round++) {
		console.log('');
		console.log(`[eval] ===== ${scenario.name} round ${round}/${flags.rounds} =====`);
		const result = await runScenario(scenario, {
			tarballsDir: flags.tarballsDir,
			keepProject: flags.keepProjects,
			streamCodex: flags.streamCodex,
			visualFeedbackPass: flags.visualFeedbackPass,
			agentBackend: flags.agentBackend,
			...(flags.agentModel ? { agentModel: flags.agentModel } : {}),
			...(flags.usageLimitUsd !== null ? { usageLimitUsd: flags.usageLimitUsd } : {}),
			...(flags.permissionMode ? { permissionMode: flags.permissionMode } : {}),
			...(flags.effort ? { effort: flags.effort } : {}),
			...(flags.codexTimeoutMs !== null ? { codexTimeoutMs: flags.codexTimeoutMs } : {})
		});
		console.log(formatScenarioResult(result));

		const analysis = buildAnalysis(result, scenario.prompt, round, inventory);
		analyses.push(analysis);
		const patchPrompt = renderPatchPrompt(analysis, scenario.prompt);
		const artifacts = writeRoundArtifacts(loopDir, round, result, analysis, patchPrompt);
		console.log(`[eval] analysis: ${artifacts.analysisPath}`);
		console.log(`[eval] patch prompt: ${artifacts.promptPath}`);

		if (!flags.applyPatches || round === flags.rounds) continue;

		console.log('[eval] applying one patch before the next round');
		const patched = await applyPatchPrompt(patchPrompt, artifacts.roundDir, flags);
		if (!patched) {
			console.error('[eval] patch agent failed; stopping loop before rerun');
			break;
		}

		if (!flags.skipPack) {
			console.log('[eval] repacking after patch');
			packDevVersions(flags.tarballsDir);
		}
	}

	const summaryPath = resolve(loopDir, 'summary.md');
	writeFileSync(summaryPath, renderLoopSummary(loopDir, analyses));
	const reportPath = regenerateE2eReport();
	console.log('');
	console.log(`[eval] summary: ${summaryPath}`);
	if (reportPath) console.log(`[eval] e2e report: ${pathToFileURL(reportPath).toString()}`);
	console.log(`[eval] loop dir: ${relative(repoRoot, loopDir)}`);
}

if (import.meta.main) {
	main().catch((err) => {
		console.error(`[eval] ${err instanceof Error ? err.message : String(err)}`);
		process.exit(1);
	});
}
