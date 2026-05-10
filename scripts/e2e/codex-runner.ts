/**
 * Spawns a non-interactive agent CLI (`codex exec` or `claude -p`) against a
 * scaffolded project and captures the JSONL event stream + final message.
 *
 * Why we wrap it:
 *   - The execution config must match across every scenario so results are
 *     reproducible.
 *   - We stream stdout line-by-line so if Codex hangs we can see progress, and so
 *     we don't buffer multi-megabyte transcripts in memory.
 *   - The caller gets a typed summary (exit code, turn count, last message,
 *     file-change event list) instead of having to re-parse JSONL everywhere.
 *
 * Auth: Codex uses the user's ChatGPT session via `~/.codex/auth.json`; Claude
 * uses the local `claude` CLI session. The repo's E2E harness runs locally, not
 * in CI, on purpose.
 *
 * Gotcha (see codex issue #15696): `codex exec` itself cannot spawn child
 * processes that open loopback sockets or Chromium sandboxes, even with
 * --sandbox danger-full-access. Playwright verification must run OUTSIDE this
 * runner, against files Codex has already written.
 */

import { spawn } from 'node:child_process';
import {
	existsSync,
	readFileSync,
	writeFileSync,
	mkdirSync,
	mkdtempSync,
	rmSync,
	symlinkSync
} from 'node:fs';
import { homedir, tmpdir } from 'node:os';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export interface CodexEvent {
	readonly type: string;
	readonly [key: string]: unknown;
}

export type AgentBackend = 'codex' | 'claude';

export interface CodexRunOptions {
	readonly backend?: AgentBackend;
	readonly projectDir: string;
	readonly prompt: string;
	readonly model?: string;
	readonly usageLimitUsd?: number;
	readonly permissionMode?: string;
	readonly effort?: string;
	readonly allowShell?: boolean;
	readonly timeoutMs?: number;
	readonly logDir?: string;
	readonly useUserConfig?: boolean;
	readonly useLocalFeedbackMcp?: boolean;
	readonly feedbackBaseUrl?: string;
	readonly onStdoutLine?: (line: string) => void;
	readonly onStderrLine?: (line: string) => void;
}

export interface CodexRunResult {
	readonly backend: AgentBackend;
	readonly model: string | null;
	readonly ok: boolean;
	readonly exitCode: number | null;
	readonly signal: NodeJS.Signals | null;
	readonly durationMs: number;
	readonly events: CodexEvent[];
	readonly lastMessage: string;
	readonly fileChanges: string[];
	readonly transcriptPath: string | null;
	readonly lastMessagePath: string | null;
}

const DEFAULT_TIMEOUT_MS = 12 * 60 * 1_000;
const TIMEOUT_KILL_GRACE_MS = 5_000;
const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, '..', '..');
const CLAUDE_GENERATED_PROJECT_PREFIX = [
	'Claude generated-project harness notes:',
	'- Do not inspect node_modules, package tarballs, generated .d.ts files, or dist internals. Those paths are intentionally blocked.',
	'- The outer harness runs build/assertions after you finish. Do not run a dev server or build command.',
	'- Make the page edit directly in src/routes/+page.svelte. If layout hooks need grid/flex rules, edit src/layout.css too.',
	'- For native wrappers, use meaningful data-layout/data-layout-area hooks. Put display: grid and display: flex only in src/layout.css.',
	'- Keep generated UI code compact. Prefer arrays and {#each} loops over repeated markup; avoid giant one-off files.',
	'- DryUI quick syntax: import named components from @dryui/ui when available.',
	'- Compound examples: <Sidebar.Root><Sidebar.Item active>Analytics</Sidebar.Item></Sidebar.Root>, <Toolbar.Root>...</Toolbar.Root>, <Chart.Root data={chartData} width={760} height={260}><Chart.Line /><Chart.XAxis /><Chart.YAxis /></Chart.Root>, <Table.Root><Table.Header><Table.Row><Table.Head>Name</Table.Head></Table.Row></Table.Header><Table.Body><Table.Row><Table.Cell>Value</Table.Cell></Table.Row></Table.Body></Table.Root>, <SegmentedControl.Root value="7d"><SegmentedControl.Item value="7d">7d</SegmentedControl.Item></SegmentedControl.Root>.',
	'- Simple examples: <Sparkline data={[1,2,3]} />, <ProgressRing value={99} max={100} />, <Progress value={42} />, <Badge>Healthy</Badge>, <Avatar initials="RB" />, <Input placeholder="Search" />, <Separator />, <Kbd>Cmd+K</Kbd>.',
	'- If an advanced DryUI API is uncertain, use a plain native wrapper with scoped CSS instead of continuing discovery.',
	''
].join('\n');

function tomlString(value: string): string {
	// JSON.stringify produces a TOML-compatible basic string for the inputs we
	// pass here (paths and shell snippets — no embedded control chars beyond
	// `\"` and `\\`, which both grammars escape identically).
	return JSON.stringify(value);
}

function getCodexHomeSource(): string {
	return process.env.CODEX_HOME ? resolve(process.env.CODEX_HOME) : resolve(homedir(), '.codex');
}

function prepareLocalFeedbackCodexHome(feedbackBaseUrl?: string): string {
	const sourceCodexHome = getCodexHomeSource();
	const sourceAuthPath = resolve(sourceCodexHome, 'auth.json');
	if (!existsSync(sourceAuthPath)) {
		throw new Error(`Codex auth missing at ${sourceAuthPath} — run \`codex login\` first`);
	}

	// Keep the e2e Codex home isolated while still exposing the visual feedback
	// MCP server through the in-tree bun entrypoint.
	const feedbackEnv = feedbackBaseUrl ? `DRYUI_FEEDBACK_URL=${tomlString(feedbackBaseUrl)} ` : '';
	const feedbackCmd = `cd ${tomlString(repoRoot)} && ${feedbackEnv}exec bun packages/feedback-server/src/mcp.ts`;
	const codexHome = mkdtempSync(resolve(tmpdir(), 'dryui-e2e-codex-home-'));
	symlinkSync(sourceAuthPath, resolve(codexHome, 'auth.json'));
	writeFileSync(
		resolve(codexHome, 'config.toml'),
		[
			'[mcp_servers."dryui-feedback"]',
			'command = "sh"',
			`args = ["-c", ${tomlString(feedbackCmd)}]`,
			''
		].join('\n')
	);
	return codexHome;
}

function prepareClaudeMcpConfig(feedbackBaseUrl?: string): string {
	const feedbackEnv = feedbackBaseUrl ? `DRYUI_FEEDBACK_URL=${tomlString(feedbackBaseUrl)} ` : '';
	const feedbackCmd = `cd ${tomlString(repoRoot)} && ${feedbackEnv}exec bun packages/feedback-server/src/mcp.ts`;
	const dir = mkdtempSync(resolve(tmpdir(), 'dryui-e2e-claude-mcp-'));
	const configPath = resolve(dir, 'mcp.json');
	writeFileSync(
		configPath,
		JSON.stringify(
			{
				mcpServers: {
					'dryui-feedback': {
						type: 'stdio',
						command: 'sh',
						args: ['-c', feedbackCmd]
					}
				}
			},
			null,
			2
		) + '\n'
	);
	return configPath;
}

function killProcessGroup(child: ReturnType<typeof spawn>, signal: NodeJS.Signals): void {
	if (!child.pid) return;
	try {
		process.kill(-child.pid, signal);
	} catch {
		try {
			child.kill(signal);
		} catch {
			/* already exited */
		}
	}
}

function splitLines(buffer: string): { lines: string[]; rest: string } {
	const parts = buffer.split('\n');
	const rest = parts.pop() ?? '';
	return { lines: parts, rest };
}

function safeParse(line: string): CodexEvent | null {
	const trimmed = line.trim();
	if (!trimmed) return null;
	try {
		return JSON.parse(trimmed) as CodexEvent;
	} catch {
		return null;
	}
}

function eventText(value: unknown): string[] {
	const record = value && typeof value === 'object' ? (value as Record<string, unknown>) : null;
	if (!record) return [];
	if (typeof record.text === 'string') return [record.text];
	const content = record.content;
	if (!Array.isArray(content)) return [];
	return content.flatMap((part) => {
		const partRecord = part && typeof part === 'object' ? (part as Record<string, unknown>) : null;
		return typeof partRecord?.text === 'string' ? [partRecord.text] : [];
	});
}

// Pull out any file-change paths so callers can assert which files Codex touched.
// Codex emits these under several shapes depending on CLI version — we're permissive.
function extractFileChanges(event: CodexEvent): string[] {
	if (event.type !== 'item.completed' && event.type !== 'item.started') return [];
	const item = event.item as Record<string, unknown> | undefined;
	if (!item || typeof item !== 'object') return [];
	const itemType = item.type as string | undefined;
	if (itemType !== 'file_change' && itemType !== 'apply_patch') return [];
	const changes = item.changes;
	if (Array.isArray(changes)) {
		return changes
			.map((c) =>
				c && typeof c === 'object' ? ((c as Record<string, unknown>).path as string) : null
			)
			.filter((p): p is string => typeof p === 'string' && p.length > 0);
	}
	const path = item.path;
	return typeof path === 'string' ? [path] : [];
}

function extractClaudeFileChanges(event: CodexEvent): string[] {
	if (event.type !== 'assistant') return [];
	const message = event.message as Record<string, unknown> | undefined;
	const content = Array.isArray(message?.content) ? message.content : [];
	const paths = new Set<string>();
	for (const part of content) {
		const record = part && typeof part === 'object' ? (part as Record<string, unknown>) : null;
		if (!record || record.type !== 'tool_use') continue;
		const name = typeof record.name === 'string' ? record.name : '';
		if (!['Edit', 'Write', 'MultiEdit', 'NotebookEdit'].includes(name)) continue;
		const input =
			record.input && typeof record.input === 'object'
				? (record.input as Record<string, unknown>)
				: null;
		const filePath = input?.file_path;
		if (typeof filePath === 'string' && filePath.length > 0) paths.add(filePath);
	}
	return [...paths];
}

function extractClaudeModel(event: CodexEvent): string | null {
	if (event.type === 'system') {
		const model = event.model;
		return typeof model === 'string' && model.length > 0 ? model : null;
	}
	const message = event.message as Record<string, unknown> | undefined;
	const model = message?.model;
	return typeof model === 'string' && model.length > 0 ? model : null;
}

function extractClaudeLastMessage(events: readonly CodexEvent[]): string {
	for (const event of [...events].reverse()) {
		if (event.type === 'assistant') {
			const text = eventText(event.message);
			if (text.length > 0) return text.join('\n').trim();
		}
		if (event.type === 'result' && typeof event.result === 'string') {
			return event.result.trim();
		}
	}
	return '';
}

function isClaudeResultError(events: readonly CodexEvent[]): boolean {
	const result = [...events].reverse().find((event) => event.type === 'result');
	return result?.is_error === true;
}

export async function runAgentExec(options: CodexRunOptions): Promise<CodexRunResult> {
	return options.backend === 'claude' ? runClaudeExec(options) : runCodexExec(options);
}

export async function runCodexExec(options: CodexRunOptions): Promise<CodexRunResult> {
	const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;

	const logDir = options.logDir ? resolve(options.logDir) : null;
	if (logDir) mkdirSync(logDir, { recursive: true });
	const useLocalFeedbackMcp =
		options.useUserConfig !== true && options.useLocalFeedbackMcp !== false;
	const isolatedCodexHome = useLocalFeedbackMcp
		? prepareLocalFeedbackCodexHome(options.feedbackBaseUrl)
		: null;
	const transcriptPath = logDir ? resolve(logDir, 'codex-transcript.jsonl') : null;
	const lastMessagePath = logDir ? resolve(logDir, 'codex-last-message.txt') : null;
	const effectiveLastMessagePath =
		lastMessagePath ?? resolve(options.projectDir, '.codex-last-message.txt');
	mkdirSync(dirname(effectiveLastMessagePath), { recursive: true });

	const args = [
		'exec',
		'--cd',
		options.projectDir,
		'--sandbox',
		'workspace-write',
		'--skip-git-repo-check',
		'--json',
		'--ephemeral',
		'--output-last-message',
		effectiveLastMessagePath,
		'--color',
		'never'
	];
	if (options.useUserConfig !== true && !useLocalFeedbackMcp) {
		args.push('--ignore-user-config');
	}
	if (options.model) {
		args.push('--model', options.model);
	}
	args.push(options.prompt);

	const startedAt = Date.now();
	const events: CodexEvent[] = [];
	const fileChanges = new Set<string>();

	return await new Promise<CodexRunResult>((resolvePromise) => {
		const child = spawn('codex', args, {
			cwd: options.projectDir,
			stdio: ['ignore', 'pipe', 'pipe'],
			env: {
				...process.env,
				FORCE_COLOR: '0',
				...(isolatedCodexHome ? { CODEX_HOME: isolatedCodexHome } : {})
			},
			detached: true
		});

		let timedOut = false;
		let forceKillTimer: ReturnType<typeof setTimeout> | null = null;
		const timer = setTimeout(() => {
			timedOut = true;
			options.onStderrLine?.(`codex exec timed out after ${(timeoutMs / 1000).toFixed(0)}s`);
			killProcessGroup(child, 'SIGTERM');
			forceKillTimer = setTimeout(() => {
				killProcessGroup(child, 'SIGKILL');
			}, TIMEOUT_KILL_GRACE_MS);
			forceKillTimer.unref();
		}, timeoutMs);

		let stdoutBuf = '';
		let stderrBuf = '';

		child.stdout.setEncoding('utf8');
		child.stdout.on('data', (chunk: string) => {
			stdoutBuf += chunk;
			const { lines, rest } = splitLines(stdoutBuf);
			stdoutBuf = rest;
			for (const line of lines) {
				options.onStdoutLine?.(line);
				const event = safeParse(line);
				if (!event) continue;
				events.push(event);
				for (const path of extractFileChanges(event)) fileChanges.add(path);
			}
		});

		child.stderr.setEncoding('utf8');
		child.stderr.on('data', (chunk: string) => {
			stderrBuf += chunk;
			const { lines, rest } = splitLines(stderrBuf);
			stderrBuf = rest;
			for (const line of lines) {
				options.onStderrLine?.(line);
			}
		});

		child.on('error', (err) => {
			options.onStderrLine?.(`codex spawn error: ${err.message}`);
		});

		child.on('close', (code, signal) => {
			clearTimeout(timer);
			if (forceKillTimer) clearTimeout(forceKillTimer);
			killProcessGroup(child, 'SIGTERM');
			// Flush trailing partial line (no terminating \n).
			if (stdoutBuf.trim()) {
				const tail = safeParse(stdoutBuf);
				if (tail) {
					events.push(tail);
					for (const path of extractFileChanges(tail)) fileChanges.add(path);
				}
			}

			let lastMessage = '';
			if (existsSync(effectiveLastMessagePath)) {
				try {
					lastMessage = readFileSync(effectiveLastMessagePath, 'utf8').trim();
				} catch {}
			}

			if (transcriptPath) {
				try {
					writeFileSync(transcriptPath, events.map((e) => JSON.stringify(e)).join('\n') + '\n');
				} catch {}
			}
			if (isolatedCodexHome) {
				try {
					rmSync(isolatedCodexHome, { recursive: true, force: true });
				} catch {}
			}

			resolvePromise({
				backend: 'codex',
				model: options.model ?? null,
				ok: code === 0 && !timedOut,
				exitCode: code,
				signal,
				durationMs: Date.now() - startedAt,
				events,
				lastMessage,
				fileChanges: [...fileChanges],
				transcriptPath,
				lastMessagePath: lastMessagePath ?? null
			});
		});
	});
}

export async function runClaudeExec(options: CodexRunOptions): Promise<CodexRunResult> {
	const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
	const logDir = options.logDir ? resolve(options.logDir) : null;
	if (logDir) mkdirSync(logDir, { recursive: true });
	const transcriptPath = logDir ? resolve(logDir, 'codex-transcript.jsonl') : null;
	const lastMessagePath = logDir ? resolve(logDir, 'codex-last-message.txt') : null;
	const mcpConfigPath =
		options.useLocalFeedbackMcp === false ? null : prepareClaudeMcpConfig(options.feedbackBaseUrl);
	const prompt =
		options.allowShell === true
			? options.prompt
			: `${CLAUDE_GENERATED_PROJECT_PREFIX}\n\n${options.prompt}`;

	const args = [
		'-p',
		'--verbose',
		'--output-format',
		'stream-json',
		'--permission-mode',
		options.permissionMode ?? 'bypassPermissions',
		'--model',
		options.model ?? 'sonnet',
		'--no-session-persistence',
		'--tools',
		options.allowShell === true ? 'Read,Write,Edit,Bash,Glob,Grep' : 'Read,Write,Edit,Glob,Grep',
		'--disallowedTools',
		'Read(*node_modules*)',
		'Bash(*node_modules*)',
		'Bash(*reports/e2e-tarballs*)',
		'Bash(tar *)',
		'Glob(*node_modules*)',
		'Grep(*node_modules*)',
		'--append-system-prompt',
		[
			'You are running inside an automated E2E harness.',
			'Do not use subagents, background agents, planning mode, or watch-style tools.',
			'Do not inspect generated declaration internals under node_modules/@dryui/ui/dist or node_modules/@dryui/primitives/dist.',
			'Use the prompt and installed DryUI skills as the component contract; if an API is unclear, choose a simpler component or native wrapper.',
			options.allowShell === true
				? 'Make the first source edit within five tool calls, run the requested validation, then finish.'
				: 'Make the first source edit within five tool calls. Shell access is unavailable; the outer harness will run build validation after you finish.'
		].join(' ')
	];
	if (options.effort && options.effort !== 'auto') {
		args.push('--effort', options.effort);
	}
	if (options.usageLimitUsd !== undefined) {
		args.push('--max-budget-usd', String(options.usageLimitUsd));
	}
	if (mcpConfigPath) {
		args.push('--mcp-config', mcpConfigPath, '--strict-mcp-config');
	}
	// Claude's --mcp-config accepts multiple values; terminate option parsing so
	// the scenario prompt is never treated as another config path.
	args.push('--', prompt);

	const startedAt = Date.now();
	const events: CodexEvent[] = [];
	const fileChanges = new Set<string>();

	return await new Promise<CodexRunResult>((resolvePromise) => {
		const child = spawn('claude', args, {
			cwd: options.projectDir,
			stdio: ['ignore', 'pipe', 'pipe'],
			env: {
				...process.env,
				FORCE_COLOR: '0'
			},
			detached: true
		});

		let timedOut = false;
		let forceKillTimer: ReturnType<typeof setTimeout> | null = null;
		const timer = setTimeout(() => {
			timedOut = true;
			options.onStderrLine?.(`claude timed out after ${(timeoutMs / 1000).toFixed(0)}s`);
			killProcessGroup(child, 'SIGTERM');
			forceKillTimer = setTimeout(() => {
				killProcessGroup(child, 'SIGKILL');
			}, TIMEOUT_KILL_GRACE_MS);
			forceKillTimer.unref();
		}, timeoutMs);

		let stdoutBuf = '';
		let stderrBuf = '';

		child.stdout.setEncoding('utf8');
		child.stdout.on('data', (chunk: string) => {
			stdoutBuf += chunk;
			const { lines, rest } = splitLines(stdoutBuf);
			stdoutBuf = rest;
			for (const line of lines) {
				options.onStdoutLine?.(line);
				const event = safeParse(line);
				if (!event) continue;
				events.push(event);
				for (const path of extractClaudeFileChanges(event)) fileChanges.add(path);
			}
		});

		child.stderr.setEncoding('utf8');
		child.stderr.on('data', (chunk: string) => {
			stderrBuf += chunk;
			const { lines, rest } = splitLines(stderrBuf);
			stderrBuf = rest;
			for (const line of lines) options.onStderrLine?.(line);
		});

		child.on('error', (err) => {
			options.onStderrLine?.(`claude spawn error: ${err.message}`);
		});

		child.on('close', (code, signal) => {
			clearTimeout(timer);
			if (forceKillTimer) clearTimeout(forceKillTimer);
			killProcessGroup(child, 'SIGTERM');
			if (stdoutBuf.trim()) {
				const tail = safeParse(stdoutBuf);
				if (tail) {
					events.push(tail);
					for (const path of extractClaudeFileChanges(tail)) fileChanges.add(path);
				}
			}

			const lastMessage = extractClaudeLastMessage(events);
			const resolvedModel =
				[...events].map(extractClaudeModel).find((model): model is string => model !== null) ??
				options.model ??
				null;
			if (transcriptPath) {
				try {
					writeFileSync(transcriptPath, events.map((e) => JSON.stringify(e)).join('\n') + '\n');
				} catch {}
			}
			if (lastMessagePath) {
				try {
					writeFileSync(lastMessagePath, lastMessage);
				} catch {}
			}
			if (mcpConfigPath) {
				try {
					rmSync(dirname(mcpConfigPath), { recursive: true, force: true });
				} catch {}
			}

			resolvePromise({
				backend: 'claude',
				model: resolvedModel,
				ok: code === 0 && !timedOut && !isClaudeResultError(events),
				exitCode: code,
				signal,
				durationMs: Date.now() - startedAt,
				events,
				lastMessage,
				fileChanges: [...fileChanges],
				transcriptPath,
				lastMessagePath
			});
		});
	});
}

// Small helper for diagnostics when a run fails. Picks out the turn.completed
// event (if any) and the last non-empty stderr-ish event to give humans
// something scannable.
export function summarizeCodexRun(result: CodexRunResult): string {
	const turnCompleted = [...result.events].reverse().find((e) => e.type === 'turn.completed');
	const claudeResult = [...result.events].reverse().find((e) => e.type === 'result');
	const usage =
		turnCompleted && typeof turnCompleted.usage === 'object' && turnCompleted.usage !== null
			? (turnCompleted.usage as Record<string, unknown>)
			: claudeResult && typeof claudeResult.usage === 'object' && claudeResult.usage !== null
				? (claudeResult.usage as Record<string, unknown>)
				: null;

	const lines: string[] = [];
	lines.push(`  agent: ${result.backend}${result.model ? ` (${result.model})` : ''}`);
	lines.push(
		`  exit code: ${result.exitCode ?? 'null'}${result.signal ? ` (signal ${result.signal})` : ''}`
	);
	lines.push(`  duration: ${(result.durationMs / 1000).toFixed(1)}s`);
	lines.push(`  events: ${result.events.length}`);
	lines.push(`  file changes: ${result.fileChanges.length}`);
	if (usage) {
		const input = usage.input_tokens ?? usage.inputTokens;
		const cached =
			usage.cached_input_tokens ?? usage.cache_read_input_tokens ?? usage.cacheReadInputTokens;
		const output = usage.output_tokens ?? usage.outputTokens;
		const cost = usage.total_cost_usd ?? usage.costUSD;
		lines.push(
			`  tokens: in=${input ?? '?'} cached=${cached ?? '?'} out=${output ?? '?'}${
				cost !== undefined ? ` cost=$${cost}` : ''
			}`
		);
	}
	if (result.lastMessage) {
		const preview =
			result.lastMessage.length > 240 ? result.lastMessage.slice(0, 240) + '…' : result.lastMessage;
		lines.push(`  last message: ${preview}`);
	}
	return lines.join('\n');
}
