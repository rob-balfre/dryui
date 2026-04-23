/**
 * Spawns `codex exec` in non-interactive mode against a scaffolded project and
 * captures the JSONL event stream + final assistant message.
 *
 * Why we wrap it:
 *   - The sandbox config (`workspace-write`, skip-git-check, ephemeral) must match
 *     across every scenario so results are reproducible.
 *   - We stream stdout line-by-line so if Codex hangs we can see progress, and so
 *     we don't buffer multi-megabyte transcripts in memory.
 *   - The caller gets a typed summary (exit code, turn count, last message,
 *     file-change event list) instead of having to re-parse JSONL everywhere.
 *
 * Auth: uses the user's ChatGPT session via `~/.codex/auth.json` (written by
 * `codex login`). Do not set OPENAI_API_KEY here — the repo's E2E harness runs
 * locally, not in CI, on purpose.
 *
 * Gotcha (see codex issue #15696): `codex exec` itself cannot spawn child
 * processes that open loopback sockets or Chromium sandboxes, even with
 * --sandbox danger-full-access. Playwright verification must run OUTSIDE this
 * runner, against files Codex has already written.
 */

import { spawn } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

export interface CodexEvent {
	readonly type: string;
	readonly [key: string]: unknown;
}

export interface CodexRunOptions {
	readonly projectDir: string;
	readonly prompt: string;
	readonly model?: string;
	readonly timeoutMs?: number;
	readonly logDir?: string;
	readonly onStdoutLine?: (line: string) => void;
	readonly onStderrLine?: (line: string) => void;
}

export interface CodexRunResult {
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

export async function runCodexExec(options: CodexRunOptions): Promise<CodexRunResult> {
	const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;

	const logDir = options.logDir ? resolve(options.logDir) : null;
	if (logDir) mkdirSync(logDir, { recursive: true });
	const transcriptPath = logDir ? resolve(logDir, 'codex-transcript.jsonl') : null;
	const lastMessagePath = logDir ? resolve(logDir, 'codex-last-message.txt') : null;
	const effectiveLastMessagePath =
		lastMessagePath ?? resolve(options.projectDir, '.codex-last-message.txt');
	mkdirSync(dirname(effectiveLastMessagePath), { recursive: true });

	const args = [
		'exec',
		'--cd',
		options.projectDir,
		'--full-auto',
		'--skip-git-repo-check',
		'--json',
		'--ephemeral',
		'--output-last-message',
		effectiveLastMessagePath,
		'--color',
		'never'
	];
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
			env: { ...process.env, FORCE_COLOR: '0' }
		});

		const timer = setTimeout(() => {
			try {
				child.kill('SIGTERM');
			} catch {}
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

			resolvePromise({
				ok: code === 0,
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

// Small helper for diagnostics when a run fails. Picks out the turn.completed
// event (if any) and the last non-empty stderr-ish event to give humans
// something scannable.
export function summarizeCodexRun(result: CodexRunResult): string {
	const turnCompleted = [...result.events].reverse().find((e) => e.type === 'turn.completed');
	const usage =
		turnCompleted && typeof turnCompleted.usage === 'object' && turnCompleted.usage !== null
			? (turnCompleted.usage as Record<string, unknown>)
			: null;

	const lines: string[] = [];
	lines.push(
		`  exit code: ${result.exitCode ?? 'null'}${result.signal ? ` (signal ${result.signal})` : ''}`
	);
	lines.push(`  duration: ${(result.durationMs / 1000).toFixed(1)}s`);
	lines.push(`  events: ${result.events.length}`);
	lines.push(`  file changes: ${result.fileChanges.length}`);
	if (usage) {
		const input = usage.input_tokens;
		const cached = usage.cached_input_tokens;
		const output = usage.output_tokens;
		lines.push(`  tokens: in=${input ?? '?'} cached=${cached ?? '?'} out=${output ?? '?'}`);
	}
	if (result.lastMessage) {
		const preview =
			result.lastMessage.length > 240 ? result.lastMessage.slice(0, 240) + '…' : result.lastMessage;
		lines.push(`  last message: ${preview}`);
	}
	return lines.join('\n');
}
