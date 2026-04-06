<script lang="ts">
	import { onMount } from 'svelte';
	import { SvelteMap, SvelteSet } from 'svelte/reactivity';
	import { goto } from '$app/navigation';
	import { Container } from '@dryui/ui/container';
	import { Card } from '@dryui/ui/card';
	import { Alert } from '@dryui/ui/alert';
	import { Badge } from '@dryui/ui/badge';
	import type { BadgeColor } from '@dryui/ui';
	import { Heading } from '@dryui/ui/heading';
	import { Text } from '@dryui/ui/text';
	import { Button } from '@dryui/ui/button';
	import { Timeline } from '@dryui/ui/timeline';
	import { Avatar } from '@dryui/ui/avatar';
	import { DescriptionList } from '@dryui/ui/description-list';
	import { Separator } from '@dryui/ui/separator';
	import { CodeBlock } from '@dryui/ui/code-block';
	import { Typography } from '@dryui/ui/typography';
	import { launcherState } from '$lib/launcher-state.svelte.ts';
	import { CLI_DEFINITIONS } from '$lib/cli-definitions.ts';
	import { getSession, saveSession } from '../session.remote.ts';
	import {
		connect,
		waitForConnection,
		startDevServer,
		stopDevServer,
		subscribeSession
	} from '$lib/ws-client.ts';
	import TerminalView from '$lib/components/TerminalView.svelte';
	import PageShell from '$lib/components/PageShell.svelte';

	const LAUNCHER_API = 'http://127.0.0.1:4210';

	interface LogEntry {
		id: string;
		type: string;
		message: string;
		icon: string;
		timestamp: number;
	}

	interface AgentSessionRow {
		id: string;
		annotation_id: string | null;
		project_path: string;
		cli: string;
		prompt: string;
		status: 'running' | 'completed' | 'failed' | 'stalled' | 'killed';
		progress_state: 'working' | 'edited';
		attempt: number;
		retry_of_session_id: string | null;
		exit_code: number | null;
		started_at: number;
		spawned_at: number | null;
		first_output_at: number | null;
		first_edit_at: number | null;
		last_output_at: number | null;
		finished_at: number | null;
		terminal_reason: 'completed' | 'failed' | 'stalled' | 'killed' | null;
		failure_reason: string | null;
	}

	type SessionLifecycle = 'working' | 'edited' | 'completed' | 'failed' | 'stalled' | 'killed';

	let hasLoadedSessions = $state(false);
	let events = $state<LogEntry[]>([]);
	let sessionRows = $state<Record<string, AgentSessionRow>>({});
	let nextId = 0;
	const subscribedSessionIds = new SvelteSet<string>();
	const sessionStateKeys = new SvelteMap<string, string>();

	let cliName = $derived(
		CLI_DEFINITIONS.find((d) => d.id === launcherState.selectedCli)?.name ?? 'AI CLI'
	);

	let projectPath = $derived(launcherState.projectPath ?? '');
	let connectionStatus = $derived(
		launcherState.wsConnected ? 'connected' : hasLoadedSessions ? 'disconnected' : 'connecting'
	);
	let agentSessions = $derived(launcherState.agentSessions);
	let devServerOutput = $derived(launcherState.devServerOutput);
	let devServerRunning = $derived(launcherState.devServerRunning);
	let devServerUrl = $derived(launcherState.devServerUrl);
	let orderedSessions = $derived.by(() =>
		[...agentSessions]
			.map(([sessionId, session]) => ({
				sessionId,
				session,
				row: sessionRows[sessionId] ?? null
			}))
			.sort((left, right) => {
				const leftTime = left.row?.started_at ?? left.session.startedAt;
				const rightTime = right.row?.started_at ?? right.session.startedAt;
				return rightTime - leftTime;
			})
	);

	function relativeTime(timestamp: number): string {
		const seconds = Math.floor((Date.now() - timestamp) / 1000);
		if (seconds < 5) return 'just now';
		if (seconds < 60) return `${seconds}s ago`;
		const minutes = Math.floor(seconds / 60);
		if (minutes < 60) return `${minutes}m ago`;
		const hours = Math.floor(minutes / 60);
		return `${hours}h ago`;
	}

	function addEntry(type: string, message: string, icon: string): void {
		events = [...events, { id: String(nextId++), type, message, icon, timestamp: Date.now() }];
	}

	function getSessionTaskLabel(prompt: string): string {
		const annotationLine = prompt.split('\n').find((line) => line.includes('Feedback on'));
		if (annotationLine) {
			return annotationLine.replace(/.*Feedback on /, '');
		}
		return 'Agent task';
	}

	function describeFailureReason(reason: string | null): string {
		if (!reason) return 'Run failed before completion.';
		if (reason === 'no-first-edit-within-90s')
			return 'No concrete edit appeared within 90 seconds.';
		if (reason === 'no-output-for-60s') return 'Output went silent for 60 seconds.';
		if (reason === 'spawn-error') return 'The agent process failed to start.';
		if (reason === 'manual-kill') return 'The run was killed before it completed.';
		if (reason === 'server-restart')
			return 'The launcher server restarted while the run was active.';
		if (reason === 'failed-without-exit-code') return 'The run failed without a usable exit code.';
		if (reason.startsWith('exit-code-')) {
			return `The run exited with code ${reason.replace('exit-code-', '')}.`;
		}
		return reason;
	}

	function getSessionLifecycle(row: AgentSessionRow | null): SessionLifecycle {
		if (!row) return 'working';
		if (row.status === 'running') {
			return row.progress_state === 'edited' ? 'edited' : 'working';
		}
		if (row.status === 'stalled') return 'stalled';
		if (row.status === 'killed') return 'killed';
		if (row.status === 'completed') return 'completed';
		return 'failed';
	}

	function getSessionBadge(
		row: AgentSessionRow | null,
		session: (typeof orderedSessions)[number]['session']
	): { color: BadgeColor; label: string } {
		const lifecycle = getSessionLifecycle(row);

		if (lifecycle === 'edited') return { color: 'blue', label: 'edited' };
		if (lifecycle === 'working') return { color: 'blue', label: 'working' };
		if (lifecycle === 'completed') return { color: 'green', label: 'done' };
		if (lifecycle === 'stalled') return { color: 'red', label: 'stalled' };
		if (lifecycle === 'killed') return { color: 'red', label: 'killed' };
		if (session.error) return { color: 'red', label: 'error' };
		return { color: 'red', label: 'failed' };
	}

	function logSessionState(row: AgentSessionRow): void {
		const state = getSessionLifecycle(row);
		const stateKey = `${state}:${row.attempt}:${row.failure_reason ?? ''}:${row.terminal_reason ?? ''}`;
		if (sessionStateKeys.get(row.id) === stateKey) {
			return;
		}
		sessionStateKeys.set(row.id, stateKey);

		const task = getSessionTaskLabel(row.prompt);

		if (state === 'working') {
			addEntry('session', `Agent working on ${task} (attempt ${row.attempt})`, '▶');
			return;
		}

		if (state === 'edited') {
			addEntry('session', `Agent made a first edit for ${task} (attempt ${row.attempt})`, '✎');
			return;
		}

		if (state === 'completed') {
			addEntry('session', `Agent completed ${task} (attempt ${row.attempt})`, '✓');
			return;
		}

		const summary = describeFailureReason(row.failure_reason);
		if (state === 'stalled') {
			addEntry('session', `Agent stalled on ${task} (attempt ${row.attempt}) — ${summary}`, '!');
			return;
		}

		if (state === 'killed') {
			addEntry(
				'session',
				`Agent was killed while working on ${task} (attempt ${row.attempt})`,
				'✗'
			);
			return;
		}

		addEntry('session', `Agent failed on ${task} (attempt ${row.attempt}) — ${summary}`, '✗');
	}

	function ensureSessionTracked(row: AgentSessionRow): void {
		if (!launcherState.agentSessions.has(row.id)) {
			launcherState.initAgentSession(row.id, row.prompt, row.started_at);
		}

		if (subscribedSessionIds.has(row.id)) return;
		subscribedSessionIds.add(row.id);
		subscribeSession(row.id);
	}

	function applySessionRow(row: AgentSessionRow): void {
		sessionRows = { ...sessionRows, [row.id]: row };
		ensureSessionTracked(row);
		logSessionState(row);
	}

	async function refreshAgentSessions(activeProjectPath: string): Promise<void> {
		try {
			const res = await fetch(
				`${LAUNCHER_API}/api/agent-sessions?project_path=${encodeURIComponent(activeProjectPath)}`
			);
			if (!res.ok) return;

			const existingSessions = (await res.json()) as AgentSessionRow[];
			for (const session of existingSessions) {
				applySessionRow(session);
			}
		} catch {
			// Non-fatal. The websocket-driven terminal view continues to work.
		} finally {
			hasLoadedSessions = true;
		}
	}

	onMount(() => {
		let cancelled = false;
		let refreshTimer: ReturnType<typeof setInterval> | undefined;

		async function init() {
			const sessionData = await getSession();
			const persistedSession = sessionData.session;
			const persistedWorkspacePath = persistedSession?.project_path ?? null;
			const hasPersistedWorkspace =
				persistedSession?.current_step === 'workspace' &&
				typeof persistedWorkspacePath === 'string' &&
				persistedWorkspacePath.length > 0;
			const shouldHydrateFromSession =
				hasPersistedWorkspace &&
				(launcherState.projectPath !== persistedWorkspacePath ||
					launcherState.selectedCli !== persistedSession.selected_cli ||
					launcherState.currentStep !== 'workspace');

			if (shouldHydrateFromSession) {
				if (cancelled) return;
				launcherState.hydrate(sessionData);
			}

			const activeProjectPath = launcherState.projectPath;

			if (!activeProjectPath) {
				if (cancelled) return;
				goto('/project');
				return;
			}

			launcherState.resetPty();
			launcherState.setCurrentStep('workspace');
			void saveSession({
				selected_cli: launcherState.selectedCli,
				project_path: launcherState.projectPath,
				current_step: 'workspace'
			});

			connect();
			try {
				await waitForConnection();
				if (cancelled) return;
				await refreshAgentSessions(activeProjectPath);
				refreshTimer = setInterval(() => {
					void refreshAgentSessions(activeProjectPath);
				}, 2000);
			} catch {
				hasLoadedSessions = true;
			}

			// Auto-start dev server
			setTimeout(() => {
				if (cancelled) return;
				const pm = launcherState.projectAnalysis?.packageManager ?? 'npm';
				startDevServer(activeProjectPath, pm);
			}, 300);
		}

		init();

		return () => {
			cancelled = true;
			if (refreshTimer) clearInterval(refreshTimer);
			stopDevServer();
		};
	});

	function handleBack() {
		goto('/theme');
	}
</script>

<PageShell>
	<Container size="md">
		<div class="page-stack">
			<div class="page-header">
				<div class="header-left">
					<Button variant="ghost" size="sm" onclick={handleBack}>Back</Button>
					<Heading level={2}>Workspace</Heading>
				</div>
				<Button variant="outline" size="sm" onclick={() => goto('/theme')}>Edit theme</Button>
			</div>

			<!-- Success banner -->
			<Alert.Root variant="success">
				<Alert.Title>Setup complete</Alert.Title>
				<Alert.Description>DryUI has been installed in {projectPath}</Alert.Description>
			</Alert.Root>

			<!-- Connection info card -->
			<Card.Root>
				<Card.Header>
					<Heading level={4}>Connection details</Heading>
				</Card.Header>
				<Card.Content>
					<div class="connection-content">
						<DescriptionList.Root>
							<DescriptionList.Item>
								<DescriptionList.Term>Project path</DescriptionList.Term>
								<DescriptionList.Description>
									<Typography.Code>{projectPath}</Typography.Code>
								</DescriptionList.Description>
							</DescriptionList.Item>
							<DescriptionList.Item>
								<DescriptionList.Term>CLI</DescriptionList.Term>
								<DescriptionList.Description>{cliName}</DescriptionList.Description>
							</DescriptionList.Item>
							<DescriptionList.Item>
								<DescriptionList.Term>Launcher server</DescriptionList.Term>
								<DescriptionList.Description>
									<Typography.Code>{LAUNCHER_API}</Typography.Code>
								</DescriptionList.Description>
							</DescriptionList.Item>
						</DescriptionList.Root>
						<Separator />
						<Text color="muted" size="sm">
							Open {cliName} in your project directory to start building.
						</Text>
					</div>
				</Card.Content>
			</Card.Root>

			<!-- Dev server -->
			<Card.Root>
				<Card.Header>
					<div class="card-header-row">
						<Heading level={4}>Dev server</Heading>
						<div class="dev-server-actions">
							{#if devServerUrl}
								<Badge variant="soft" color="green">{devServerUrl}</Badge>
								<Button size="sm" href={devServerUrl} target="_blank" rel="noreferrer">
									Open preview
								</Button>
							{:else if devServerRunning}
								<Badge variant="soft" color="blue">starting</Badge>
							{:else}
								<Badge variant="soft" color="gray">stopped</Badge>
							{/if}
						</div>
					</div>
				</Card.Header>
				{#if devServerUrl || devServerOutput}
					<Card.Content>
						<div class="dev-server-content">
							{#if devServerUrl}
								<Text size="sm" color="muted">
									Open the preview to verify the install while launcher agent sessions stream below.
								</Text>
							{/if}

							{#if devServerOutput}
								<div class="dev-output">
									<CodeBlock
										code={devServerOutput.split('\n').slice(-30).join('\n')}
										language="text"
									/>
								</div>
							{/if}
						</div>
					</Card.Content>
				{/if}
			</Card.Root>

			<!-- Live activity log -->
			<Card.Root>
				<Card.Header>
					<div class="card-header-row">
						<Heading level={4}>Activity</Heading>
						<Badge variant="soft" color={connectionStatus === 'connected' ? 'green' : 'gray'}>
							{connectionStatus}
						</Badge>
					</div>
				</Card.Header>
				<Card.Content>
					{#if events.length === 0}
						<div class="activity-empty">
							{#if connectionStatus === 'connecting'}
								<Text color="muted" size="sm">Connecting to launcher server...</Text>
							{:else if connectionStatus === 'disconnected'}
								<Text color="muted" size="sm">
									Disconnected from launcher server. Reconnecting...
								</Text>
							{:else}
								<Text color="muted" size="sm">
									Waiting for agent activity. Open {cliName} in your project directory to start.
								</Text>
							{/if}
						</div>
					{:else}
						<Timeline.Root>
							{#each events as event (event.id)}
								<Timeline.Item>
									<Timeline.Icon>
										<Avatar fallback={event.icon} size="sm" />
									</Timeline.Icon>
									<Timeline.Content>
										<Timeline.Title level={6}>{event.message}</Timeline.Title>
										<Timeline.Time>{relativeTime(event.timestamp)}</Timeline.Time>
									</Timeline.Content>
								</Timeline.Item>
							{/each}
						</Timeline.Root>
					{/if}
				</Card.Content>
			</Card.Root>

			<!-- Agent sessions -->
			{#each orderedSessions as { sessionId, session, row } (sessionId)}
				{@const badge = getSessionBadge(row, session)}
				<Card.Root>
					<Card.Header>
						<div class="session-header">
							<div class="card-header-row">
								<Heading level={4}
									>{cliName} agent{#if row?.attempt && row.attempt > 1}
										· retry {row.attempt - 1}{/if}</Heading
								>
								<Badge variant="soft" color={badge.color}>{badge.label}</Badge>
							</div>
							<Text color="muted" size="sm">
								{getSessionTaskLabel(session.prompt)}
							</Text>
							{#if row?.failure_reason}
								<Text color="muted" size="sm">
									{describeFailureReason(row.failure_reason)}
								</Text>
							{/if}
						</div>
					</Card.Header>
					<Card.Content>
						<TerminalView output={session.output} />
					</Card.Content>
				</Card.Root>
			{/each}
		</div>
	</Container>
</PageShell>

<style>
	.page-stack {
		display: grid;
		gap: var(--dry-space-6);
	}

	.page-header {
		display: grid;
		grid-template-columns: 1fr auto;
		align-items: center;
	}

	.header-left {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		align-items: center;
		gap: var(--dry-space-4);
	}

	.card-header-row {
		display: grid;
		grid-template-columns: 1fr auto;
		align-items: center;
	}

	.connection-content {
		display: grid;
		gap: var(--dry-space-4);
	}

	.dev-server-actions {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		align-items: center;
		gap: var(--dry-space-2);
	}

	.dev-server-content {
		display: grid;
		gap: var(--dry-space-4);
	}

	.activity-empty {
		display: grid;
		gap: var(--dry-space-2);
	}

	.session-header {
		display: grid;
		gap: var(--dry-space-2);
	}

	.dev-output {
		max-height: 200px;
		overflow-y: auto;
	}
</style>
