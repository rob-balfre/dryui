import { spawn, type ChildProcess } from 'node:child_process';
import {
	copyFileSync,
	existsSync,
	mkdtempSync,
	readFileSync,
	readdirSync,
	statSync
} from 'node:fs';
import { access, readdir, rm, stat } from 'node:fs/promises';
import { homedir, tmpdir } from 'node:os';
import { basename, join, relative } from 'node:path';
import type { Database } from 'bun:sqlite';
import type { ServerWebSocket } from 'bun';
import {
	getAgentSession,
	getAnnotation,
	getSessionOutput,
	insertAgentSession,
	insertOutputLine,
	updateAgentSession,
	updateAnnotation,
	type AgentSessionRow,
	type AnnotationRow
} from './agent-store.ts';
import type { CliId, ServerMessage } from './types.ts';

const CLI_COMMANDS: Record<CliId, { command: string; args: string[] }> = {
	'claude-code': {
		command: 'claude',
		args: [
			'--print',
			'--verbose',
			'--output-format',
			'stream-json',
			'--permission-mode',
			'bypassPermissions'
		]
	},
	codex: {
		command: 'codex',
		args: ['exec', '--json', '--skip-git-repo-check', '--sandbox', 'workspace-write']
	},
	'gemini-cli': { command: 'gemini', args: ['--output-format', 'stream-json', '--prompt'] },
	'copilot-cli': { command: 'copilot', args: ['--output-format', 'json', '-p'] },
	opencode: { command: 'opencode', args: ['run', '--format', 'json'] },
	cursor: { command: 'agent', args: ['-p', '--output-format', 'stream-json'] }
};

const FIRST_EDIT_TIMEOUT_MS = 90_000;
const OUTPUT_SILENCE_TIMEOUT_MS = 60_000;
const EDIT_WATCH_INTERVAL_MS = 1_000;
const MAX_ATTEMPTS = 2;
const ROOT_EDITABLE_FILES = [
	'package.json',
	'svelte.config.js',
	'svelte.config.ts',
	'vite.config.js',
	'vite.config.ts',
	'tsconfig.json',
	'jsconfig.json'
] as const;
const EDITABLE_DIRECTORIES = ['src', 'static'] as const;

type ProgressState = 'working' | 'edited';
type TerminalReason = 'completed' | 'failed' | 'stalled' | 'killed';
type FailureReason =
	| 'server-restart'
	| 'spawn-error'
	| 'no-first-edit-within-90s'
	| 'no-output-for-60s'
	| 'manual-kill'
	| `exit-code-${number}`
	| 'failed-without-exit-code';

interface AgentManagerOptions {
	cliCommands?: Partial<Record<CliId, { command: string; args: string[] }>>;
	firstEditTimeoutMs?: number;
	outputSilenceTimeoutMs?: number;
	editWatchIntervalMs?: number;
	getProjectDiagnostics?: (projectPath: string) => string | null;
}

interface ManagedAgent {
	sessionId: string;
	annotationId: string | null;
	projectPath: string;
	cli: CliId;
	prompt: string;
	startedAt: number;
	attempt: number;
	process: ChildProcess;
	buffer: string;
	seq: number;
	subscribers: Set<ServerWebSocket<unknown>>;
	progressState: ProgressState;
	firstOutputAt: number | null;
	firstEditAt: number | null;
	lastOutputAt: number | null;
	fileSnapshot: Map<string, string>;
	firstEditTimer: ReturnType<typeof setTimeout> | null;
	outputSilenceTimer: ReturnType<typeof setTimeout> | null;
	editWatchTimer: ReturnType<typeof setInterval> | null;
	editWatchInFlight: boolean;
	cleanupStarted: boolean;
	cliHomeDir: string | null;
}

function encode(msg: ServerMessage): string {
	return JSON.stringify(msg);
}

function prepareCliEnvironment(cli: CliId): { env: NodeJS.ProcessEnv; cliHomeDir: string | null } {
	const env: NodeJS.ProcessEnv = {
		...process.env,
		PATH: process.env['PATH'],
		NO_COLOR: '1'
	};

	if (cli !== 'codex') {
		return { env, cliHomeDir: null };
	}

	const authPath = join(homedir(), '.codex', 'auth.json');
	if (!existsSync(authPath)) {
		return { env, cliHomeDir: null };
	}

	try {
		const cliHomeDir = mkdtempSync(join(tmpdir(), 'dryui-launcher-codex-'));
		copyFileSync(authPath, join(cliHomeDir, 'auth.json'));
		env['CODEX_HOME'] = cliHomeDir;
		return { env, cliHomeDir };
	} catch {
		return { env, cliHomeDir: null };
	}
}

async function fileExists(path: string): Promise<boolean> {
	try {
		await access(path);
		return true;
	} catch {
		return false;
	}
}

async function collectEditableFiles(projectPath: string): Promise<string[]> {
	const files: string[] = [];

	for (const relativePath of ROOT_EDITABLE_FILES) {
		const fullPath = join(projectPath, relativePath);
		if (await fileExists(fullPath)) {
			files.push(fullPath);
		}
	}

	for (const directory of EDITABLE_DIRECTORIES) {
		const root = join(projectPath, directory);
		if (!(await fileExists(root))) continue;

		const queue = [root];
		while (queue.length > 0) {
			const current = queue.pop();
			if (!current) continue;

			const entries = await readdir(current, { withFileTypes: true });
			for (const entry of entries) {
				const fullPath = join(current, entry.name);
				if (entry.isDirectory()) {
					queue.push(fullPath);
					continue;
				}
				if (entry.isFile()) {
					files.push(fullPath);
				}
			}
		}
	}

	files.sort();
	return files;
}

async function buildEditableSnapshot(projectPath: string): Promise<Map<string, string>> {
	const snapshot = new Map<string, string>();
	const files = await collectEditableFiles(projectPath);

	for (const filePath of files) {
		try {
			const info = await stat(filePath);
			snapshot.set(
				filePath,
				`${info.mtimeMs}:${info.size}:${Bun.hash(await Bun.file(filePath).arrayBuffer())}`
			);
		} catch {
			// Ignore transient file changes between enumerate/stat.
		}
	}

	return snapshot;
}

function buildEditableSnapshotSync(projectPath: string): Map<string, string> {
	const snapshot = new Map<string, string>();

	for (const relativePath of ROOT_EDITABLE_FILES) {
		const fullPath = join(projectPath, relativePath);
		if (!existsSync(fullPath)) continue;

		try {
			const info = statSync(fullPath);
			snapshot.set(fullPath, `${info.mtimeMs}:${info.size}:${Bun.hash(readFileSync(fullPath))}`);
		} catch {
			// Ignore transient file changes between enumerate/stat.
		}
	}

	for (const directory of EDITABLE_DIRECTORIES) {
		const root = join(projectPath, directory);
		if (!existsSync(root)) continue;

		const queue = [root];
		while (queue.length > 0) {
			const current = queue.pop();
			if (!current) continue;

			const entries = readdirSync(current, { withFileTypes: true });
			for (const entry of entries) {
				const fullPath = join(current, entry.name);
				if (entry.isDirectory()) {
					queue.push(fullPath);
					continue;
				}

				if (!entry.isFile()) continue;

				try {
					const info = statSync(fullPath);
					snapshot.set(
						fullPath,
						`${info.mtimeMs}:${info.size}:${Bun.hash(readFileSync(fullPath))}`
					);
				} catch {
					// Ignore transient file changes between enumerate/stat.
				}
			}
		}
	}

	return snapshot;
}

function parseContextJson(annotation: AnnotationRow | null): Record<string, unknown> {
	if (!annotation?.context_json) return {};

	try {
		return JSON.parse(annotation.context_json) as Record<string, unknown>;
	} catch {
		return {};
	}
}

function toFailureSummary(reason: FailureReason): string {
	if (reason === 'no-first-edit-within-90s') return 'No concrete edit appeared within 90 seconds.';
	if (reason === 'no-output-for-60s') return 'Agent output went silent for 60 seconds.';
	if (reason === 'spawn-error') return 'The agent process failed to start.';
	if (reason === 'manual-kill') return 'The agent run was killed before it completed.';
	if (reason === 'failed-without-exit-code') return 'The agent exited without a usable exit code.';
	if (reason === 'server-restart') return 'The launcher server restarted while the run was active.';
	if (reason.startsWith('exit-code-')) {
		return `The agent exited with ${reason.replace('exit-code-', 'code ')}.`;
	}
	return 'The agent run failed.';
}

function normalizeLikelyTarget(path: string, projectPath: string): string | null {
	const normalized = path.startsWith(projectPath) ? relative(projectPath, path) : path;
	if (!normalized || normalized.startsWith('..')) return null;
	return normalized.replace(/\\/g, '/');
}

async function inferLikelyTargetFiles(
	projectPath: string,
	annotation: AnnotationRow | null
): Promise<string[]> {
	const context = parseContextJson(annotation);
	const candidates = new Map<string, number>();
	const addCandidate = (filePath: string | null, score: number) => {
		if (!filePath) return;
		const current = candidates.get(filePath) ?? 0;
		candidates.set(filePath, Math.max(current, score));
	};

	const rawSource =
		typeof context['sourceFile'] === 'string'
			? context['sourceFile']
			: typeof context['fullPath'] === 'string'
				? context['fullPath']
				: null;
	addCandidate(rawSource ? normalizeLikelyTarget(rawSource, projectPath) : null, 100);

	const desiredComponent =
		typeof context['svelteComponent'] === 'string'
			? context['svelteComponent'].replace(/\.svelte$/i, '')
			: null;

	const editableFiles = (await collectEditableFiles(projectPath))
		.map((entry) => normalizeLikelyTarget(entry, projectPath))
		.filter(Boolean) as string[];
	const keywords = new Set(
		`${annotation?.element ?? ''} ${annotation?.comment ?? ''} ${desiredComponent ?? ''}`
			.toLowerCase()
			.split(/[^a-z0-9]+/g)
			.filter((word) => word.length >= 3)
	);

	for (const relativePath of editableFiles) {
		const name = basename(relativePath).toLowerCase();
		let score = 0;

		if (desiredComponent && name === `${desiredComponent.toLowerCase()}.svelte`) {
			score += 90;
		}

		for (const keyword of keywords) {
			if (name.includes(keyword)) {
				score += 10;
			}
			if (relativePath.toLowerCase().includes(`/${keyword}`)) {
				score += 6;
			}
		}

		if (relativePath === 'src/routes/+page.svelte') score += 8;
		if (relativePath === 'src/routes/+layout.svelte') score += 7;
		if (relativePath.startsWith('src/lib/components/')) score += 4;

		if (score > 0) {
			addCandidate(relativePath, score);
		}
	}

	const ranked = [...candidates.entries()]
		.sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
		.map(([filePath]) => filePath);

	if (ranked.length > 0) {
		return ranked.slice(0, 3);
	}

	return editableFiles
		.filter((entry) => entry === 'src/routes/+page.svelte' || entry === 'src/routes/+layout.svelte')
		.slice(0, 2);
}

export class AgentManager {
	private agents = new Map<string, ManagedAgent>();
	private db: Database;
	private onEvent: ((event: string, data: unknown) => void) | null = null;
	private cliCommands: Record<CliId, { command: string; args: string[] }>;
	private firstEditTimeoutMs: number;
	private outputSilenceTimeoutMs: number;
	private editWatchIntervalMs: number;
	private getProjectDiagnostics: (projectPath: string) => string | null;

	constructor(db: Database, options: AgentManagerOptions = {}) {
		this.db = db;
		this.cliCommands = { ...CLI_COMMANDS, ...(options.cliCommands ?? {}) };
		this.firstEditTimeoutMs = options.firstEditTimeoutMs ?? FIRST_EDIT_TIMEOUT_MS;
		this.outputSilenceTimeoutMs = options.outputSilenceTimeoutMs ?? OUTPUT_SILENCE_TIMEOUT_MS;
		this.editWatchIntervalMs = options.editWatchIntervalMs ?? EDIT_WATCH_INTERVAL_MS;
		this.getProjectDiagnostics = options.getProjectDiagnostics ?? (() => null);

		db.run(
			`UPDATE agent_sessions
         SET status = 'failed',
             finished_at = ?,
             terminal_reason = 'failed',
             failure_reason = 'server-restart'
       WHERE status = 'running'`,
			[Date.now()]
		);
	}

	setEventCallback(cb: (event: string, data: unknown) => void): void {
		this.onEvent = cb;
	}

	spawn(opts: {
		sessionId: string;
		annotationId?: string;
		cli: CliId;
		prompt: string;
		cwd: string;
		attempt?: number;
		retryOfSessionId?: string | null;
	}): boolean {
		if (this.agents.has(opts.sessionId)) return false;

		const cliCmd = this.cliCommands[opts.cli];
		if (!cliCmd) return false;

		const initialSnapshot = buildEditableSnapshotSync(opts.cwd);
		const args = [...cliCmd.args, opts.prompt];
		const { env, cliHomeDir } = prepareCliEnvironment(opts.cli);
		const child = spawn(cliCmd.command, args, {
			cwd: opts.cwd,
			stdio: ['pipe', 'pipe', 'pipe'],
			env
		});
		child.stdin.end();

		const spawnedAt = Date.now();
		const agent: ManagedAgent = {
			sessionId: opts.sessionId,
			annotationId: opts.annotationId ?? null,
			projectPath: opts.cwd,
			cli: opts.cli,
			prompt: opts.prompt,
			startedAt: spawnedAt,
			attempt: opts.attempt ?? 1,
			process: child,
			buffer: '',
			seq: 0,
			subscribers: new Set(),
			progressState: 'working',
			firstOutputAt: null,
			firstEditAt: null,
			lastOutputAt: null,
			fileSnapshot: initialSnapshot,
			firstEditTimer: null,
			outputSilenceTimer: null,
			editWatchTimer: null,
			editWatchInFlight: false,
			cleanupStarted: false,
			cliHomeDir
		};

		this.agents.set(opts.sessionId, agent);

		this.persistSession(agent, {
			status: 'running',
			progress_state: 'working',
			attempt: agent.attempt,
			retry_of_session_id: opts.retryOfSessionId ?? null,
			spawned_at: spawnedAt,
			first_output_at: null,
			first_edit_at: null,
			last_output_at: null,
			finished_at: null,
			terminal_reason: null,
			failure_reason: null
		});

		this.startEditTracking(agent);

		child.stdout?.on('data', (chunk: Buffer) => {
			agent.buffer += chunk.toString();
			const lines = agent.buffer.split('\n');
			agent.buffer = lines.pop() ?? '';
			for (const line of lines) {
				const trimmed = line.trim();
				if (!trimmed) continue;
				this.emitLine(agent, trimmed);
			}
		});

		child.stderr?.on('data', (chunk: Buffer) => {
			const text = chunk.toString().trim();
			if (text) this.emitLine(agent, text);
		});

		child.on('error', (err) => {
			this.sendToSubscribers(agent, {
				type: 'agent-error',
				sessionId: opts.sessionId,
				error: err.message
			});
			this.finalizeAgent(agent, 'failed', 'failed', null, 'spawn-error');
		});

		child.on('close', async (code) => {
			if (agent.cleanupStarted) return;

			if (agent.buffer.trim()) {
				this.emitLine(agent, agent.buffer.trim());
			}

			if (code === 0) {
				await this.detectFirstEdit(agent);
			}

			this.sendToSubscribers(agent, { type: 'agent-exit', sessionId: opts.sessionId, code });
			this.finalizeAgent(
				agent,
				code === 0 ? 'completed' : 'failed',
				code === 0 ? 'completed' : 'failed',
				code,
				code === 0 ? null : code === null ? 'failed-without-exit-code' : `exit-code-${code}`
			);
		});

		return true;
	}

	private sendToSubscribers(agent: ManagedAgent, message: ServerMessage): void {
		const payload = encode(message);
		for (const ws of agent.subscribers) {
			try {
				ws.send(payload);
			} catch {}
		}
	}

	private persistSession(agent: ManagedAgent, patch: Partial<Omit<AgentSessionRow, 'id'>>): void {
		const updated = updateAgentSession(this.db, agent.sessionId, patch);
		if (updated) {
			this.onEvent?.('session:updated', updated);
		}
	}

	private startEditTracking(agent: ManagedAgent): void {
		agent.firstEditTimer = setTimeout(() => {
			void this.handleStall(agent.sessionId, 'no-first-edit-within-90s');
		}, this.firstEditTimeoutMs);

		agent.editWatchTimer = setInterval(() => {
			void this.detectFirstEdit(agent);
		}, this.editWatchIntervalMs);
	}

	private async detectFirstEdit(agent: ManagedAgent): Promise<void> {
		if (agent.cleanupStarted || agent.firstEditAt !== null || agent.editWatchInFlight) return;
		agent.editWatchInFlight = true;

		try {
			const nextSnapshot = await buildEditableSnapshot(agent.projectPath);
			const hasChanged =
				nextSnapshot.size !== agent.fileSnapshot.size ||
				[...nextSnapshot.entries()].some(
					([path, fingerprint]) => agent.fileSnapshot.get(path) !== fingerprint
				);

			agent.fileSnapshot = nextSnapshot;
			if (!hasChanged) return;

			const timestamp = Date.now();
			agent.firstEditAt = timestamp;
			agent.progressState = 'edited';

			if (agent.firstEditTimer) {
				clearTimeout(agent.firstEditTimer);
				agent.firstEditTimer = null;
			}

			this.persistSession(agent, {
				progress_state: 'edited',
				first_edit_at: timestamp
			});
		} catch {
			// Ignore transient filesystem errors while the project is being edited.
		} finally {
			agent.editWatchInFlight = false;
		}
	}

	private markOutput(agent: ManagedAgent): void {
		const now = Date.now();
		const patch: Partial<Omit<AgentSessionRow, 'id'>> = {
			last_output_at: now
		};

		if (agent.firstOutputAt === null) {
			agent.firstOutputAt = now;
			patch.first_output_at = now;
		}

		agent.lastOutputAt = now;
		this.persistSession(agent, patch);
		this.resetSilenceTimer(agent);
	}

	private resetSilenceTimer(agent: ManagedAgent): void {
		if (agent.outputSilenceTimer) {
			clearTimeout(agent.outputSilenceTimer);
		}

		agent.outputSilenceTimer = setTimeout(() => {
			void this.handleStall(agent.sessionId, 'no-output-for-60s');
		}, this.outputSilenceTimeoutMs);
	}

	private emitLine(agent: ManagedAgent, line: string): void {
		if (agent.cleanupStarted) return;

		agent.seq += 1;
		this.markOutput(agent);

		try {
			insertOutputLine(this.db, agent.sessionId, agent.seq, line);
		} catch {}

		this.sendToSubscribers(agent, { type: 'agent-output', sessionId: agent.sessionId, data: line });
	}

	private clearTracking(agent: ManagedAgent): void {
		if (agent.firstEditTimer) clearTimeout(agent.firstEditTimer);
		if (agent.outputSilenceTimer) clearTimeout(agent.outputSilenceTimer);
		if (agent.editWatchTimer) clearInterval(agent.editWatchTimer);
		agent.firstEditTimer = null;
		agent.outputSilenceTimer = null;
		agent.editWatchTimer = null;
	}

	private async handleStall(
		sessionId: string,
		reason: Extract<FailureReason, 'no-first-edit-within-90s' | 'no-output-for-60s'>
	): Promise<void> {
		const agent = this.agents.get(sessionId);
		if (!agent || agent.cleanupStarted) return;

		const shouldRetry = agent.attempt < MAX_ATTEMPTS;
		this.sendToSubscribers(agent, {
			type: 'agent-error',
			sessionId,
			error: shouldRetry
				? `${toFailureSummary(reason)} Retrying automatically.`
				: toFailureSummary(reason)
		});
		this.sendToSubscribers(agent, { type: 'agent-exit', sessionId, code: null });

		this.finalizeAgent(agent, 'stalled', 'stalled', null, reason);

		if (!agent.annotationId) return;

		this.updateAnnotationStatus(
			agent.annotationId,
			'failed',
			`${toFailureSummary(reason)}${shouldRetry ? ' Starting the only automatic retry now.' : ''}`
		);

		if (!shouldRetry) return;

		await this.retryAgent(agent, reason);
	}

	private async retryAgent(
		agent: ManagedAgent,
		reason: Extract<FailureReason, 'no-first-edit-within-90s' | 'no-output-for-60s'>
	): Promise<void> {
		const annotation = agent.annotationId ? getAnnotation(this.db, agent.annotationId) : null;
		const likelyTargetFiles = await inferLikelyTargetFiles(agent.projectPath, annotation);
		const diagnostics = this.getProjectDiagnostics(agent.projectPath);
		const retryPrompt = [
			'IMPORTANT: This is the only automatic retry. Skip planning, analysis, and questions.',
			'',
			`Previous attempt stalled: ${toFailureSummary(reason)}`,
			`Attempt ${agent.attempt + 1} of ${MAX_ATTEMPTS}.`,
			'',
			`Annotation text: ${annotation?.comment ?? 'Unavailable'}`,
			annotation?.element ? `Target element: ${annotation.element}` : '',
			'',
			likelyTargetFiles.length > 0
				? `Likely target files: ${likelyTargetFiles.join(', ')}`
				: 'Likely target files: src/routes/+page.svelte, src/routes/+layout.svelte',
			'Make a small concrete edit in one of those files immediately before doing anything else.',
			'',
			diagnostics
				? `Current dev-server errors:\n${diagnostics}`
				: 'Current dev-server errors: none captured.',
			'',
			agent.annotationId
				? `Then finish the requested change end-to-end, keep the app runnable, and resolve annotation ${agent.annotationId} only after the fix is visible. Use the available feedback resolver for this workspace and include a short summary of the visible fix.`
				: 'Then finish the requested change end-to-end and keep the app runnable.'
		]
			.filter(Boolean)
			.join('\n');

		const retrySession: AgentSessionRow = {
			id: crypto.randomUUID(),
			annotation_id: agent.annotationId,
			project_path: agent.projectPath,
			cli: agent.cli,
			prompt: retryPrompt,
			status: 'running',
			progress_state: 'working',
			attempt: agent.attempt + 1,
			retry_of_session_id: agent.sessionId,
			exit_code: null,
			started_at: Date.now(),
			spawned_at: Date.now(),
			first_output_at: null,
			first_edit_at: null,
			last_output_at: null,
			finished_at: null,
			terminal_reason: null,
			failure_reason: null
		};

		insertAgentSession(this.db, retrySession);
		this.onEvent?.('session:created', retrySession);
		this.updateAnnotationStatus(agent.annotationId, 'acknowledged', 'Automatic retry in progress.');

		const spawned = this.spawn({
			sessionId: retrySession.id,
			annotationId: retrySession.annotation_id ?? undefined,
			cli: agent.cli,
			prompt: retryPrompt,
			cwd: agent.projectPath,
			attempt: retrySession.attempt,
			retryOfSessionId: agent.sessionId
		});

		if (!spawned) {
			const retryAgentInstance = this.agents.get(retrySession.id);
			if (retryAgentInstance) {
				this.sendToSubscribers(retryAgentInstance, {
					type: 'agent-error',
					sessionId: retrySession.id,
					error: 'Automatic retry failed to start.'
				});
				this.sendToSubscribers(retryAgentInstance, {
					type: 'agent-exit',
					sessionId: retrySession.id,
					code: null
				});
				this.finalizeAgent(retryAgentInstance, 'failed', 'failed', null, 'spawn-error');
			} else {
				const updated = updateAgentSession(this.db, retrySession.id, {
					status: 'failed',
					finished_at: Date.now(),
					terminal_reason: 'failed',
					failure_reason: 'spawn-error'
				});
				if (updated) {
					this.onEvent?.('session:updated', updated);
				}
			}
			this.updateAnnotationStatus(agent.annotationId, 'failed', 'Automatic retry failed to start.');
		}
	}

	private updateAnnotationStatus(
		annotationId: string,
		status: 'acknowledged' | 'failed',
		resolutionNote: string
	): void {
		const updated = updateAnnotation(this.db, annotationId, {
			status,
			resolution_note: resolutionNote
		});
		if (!updated) return;

		const event = status === 'acknowledged' ? 'annotation:acknowledged' : 'annotation:updated';
		this.onEvent?.(event, updated);
	}

	private resolveCompletedAnnotation(agent: ManagedAgent, finishedAt: number): void {
		if (!agent.annotationId || agent.firstEditAt === null) return;

		const updated = updateAnnotation(this.db, agent.annotationId, {
			status: 'resolved',
			resolved_at: finishedAt,
			resolved_by: `${agent.cli}-auto-agent`,
			resolution_note:
				'Resolved automatically after the launcher agent completed and recorded a concrete edit.'
		});

		if (!updated) return;
		this.onEvent?.('annotation:resolved', updated);
	}

	private finalizeAgent(
		agent: ManagedAgent,
		status: 'completed' | 'failed' | 'stalled' | 'killed',
		terminalReason: TerminalReason,
		exitCode: number | null,
		failureReason: FailureReason | null
	): void {
		if (agent.cleanupStarted) return;
		agent.cleanupStarted = true;
		this.clearTracking(agent);
		this.agents.delete(agent.sessionId);
		if (agent.cliHomeDir) {
			void rm(agent.cliHomeDir, { recursive: true, force: true }).catch(() => {});
		}

		const finishedAt = Date.now();
		this.persistSession(agent, {
			status,
			exit_code: exitCode,
			finished_at: finishedAt,
			terminal_reason: terminalReason,
			failure_reason: failureReason
		});

		if (status === 'completed') {
			this.resolveCompletedAnnotation(agent, finishedAt);
		}

		agent.subscribers.clear();
		this.onEvent?.('session:completed', {
			sessionId: agent.sessionId,
			annotationId: agent.annotationId,
			exitCode,
			status,
			terminalReason,
			failureReason
		});
	}

	kill(sessionId: string): boolean {
		const agent = this.agents.get(sessionId);
		if (!agent || agent.cleanupStarted) return false;

		this.sendToSubscribers(agent, {
			type: 'agent-error',
			sessionId,
			error: 'Agent run was killed.'
		});
		this.sendToSubscribers(agent, { type: 'agent-exit', sessionId, code: null });
		this.finalizeAgent(agent, 'killed', 'killed', null, 'manual-kill');
		agent.process.kill('SIGTERM');
		return true;
	}

	subscribe(sessionId: string, ws: ServerWebSocket<unknown>): boolean {
		const agent = this.agents.get(sessionId);
		if (agent) {
			agent.subscribers.add(ws);
		}

		const session = getAgentSession(this.db, sessionId);
		if (!session) return false;

		const output = getSessionOutput(this.db, sessionId);
		for (const line of output) {
			try {
				ws.send(encode({ type: 'agent-output', sessionId, data: line.line }));
			} catch {}
		}

		if (!agent && session.finished_at !== null) {
			try {
				ws.send(encode({ type: 'agent-exit', sessionId, code: session.exit_code }));
			} catch {}
		}

		return true;
	}

	unsubscribe(sessionId: string, ws: ServerWebSocket<unknown>): void {
		const agent = this.agents.get(sessionId);
		if (agent) agent.subscribers.delete(ws);
	}

	unsubscribeAll(ws: ServerWebSocket<unknown>): void {
		for (const agent of this.agents.values()) {
			agent.subscribers.delete(ws);
		}
	}

	listActive(): Array<{
		sessionId: string;
		annotationId: string | null;
		prompt: string;
		startedAt: number;
	}> {
		return Array.from(this.agents.values()).map((agent) => ({
			sessionId: agent.sessionId,
			annotationId: agent.annotationId,
			prompt: agent.prompt,
			startedAt: agent.startedAt
		}));
	}

	killAll(): void {
		for (const agent of [...this.agents.values()]) {
			if (!agent.cleanupStarted) {
				this.finalizeAgent(agent, 'failed', 'failed', null, 'server-restart');
				agent.process.kill('SIGTERM');
			}
		}
		this.agents.clear();
	}
}
