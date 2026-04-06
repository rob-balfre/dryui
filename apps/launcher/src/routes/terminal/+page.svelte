<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { Container } from '@dryui/ui/container';
	import { Button } from '@dryui/ui/button';
	import { Heading } from '@dryui/ui/heading';
	import { Text } from '@dryui/ui/text';
	import { Badge } from '@dryui/ui/badge';
	import { Alert } from '@dryui/ui/alert';
	import { Card } from '@dryui/ui/card';
	import { CodeBlock } from '@dryui/ui/code-block';
	import { Spinner } from '@dryui/ui/spinner';
	import { CLI_DEFINITIONS } from '$lib/cli-definitions.ts';
	import { launcherState } from '$lib/launcher-state.svelte.ts';
	import { connect, spawnCli } from '$lib/ws-client.ts';
	import { saveSession } from '../session.remote.ts';
	import PageShell from '$lib/components/PageShell.svelte';

	const AUTH_PATTERNS = [
		/not logged in/i,
		/please run \/login/i,
		/401 unauthorized/i,
		/authentication required/i,
		/no authentication/i,
		/please run .* login/i,
		/missing api.?key/i,
		/invalid api.?key/i,
		/login first/i,
		/please .* log in/i,
		/press any key to log in/i
	];

	let cliDef = $derived(
		launcherState.selectedCli
			? (CLI_DEFINITIONS.find((d) => d.id === launcherState.selectedCli) ?? null)
			: null
	);

	let needsAuth = $derived.by(() => {
		const output = launcherState.ptyOutput;
		if (!output) return false;
		return AUTH_PATTERNS.some((p) => p.test(output));
	});

	let success = $derived(launcherState.ptyExited && !needsAuth && !launcherState.ptyError);

	type CheckStatus = 'connecting' | 'checking' | 'success' | 'auth' | 'error';

	let status = $derived<CheckStatus>(
		needsAuth
			? 'auth'
			: launcherState.ptyError
				? 'error'
				: success
					? 'success'
					: launcherState.wsConnected
						? 'checking'
						: 'connecting'
	);

	const statusConfig: Record<
		CheckStatus,
		{ label: string; color: 'green' | 'red' | 'blue' | 'yellow' | 'gray' }
	> = {
		connecting: { label: 'Connecting', color: 'blue' },
		checking: { label: 'Checking', color: 'blue' },
		success: { label: 'Connected', color: 'green' },
		auth: { label: 'Sign in required', color: 'yellow' },
		error: { label: 'Error', color: 'red' }
	};

	let badge = $derived(statusConfig[status]);

	onMount(() => {
		if (!launcherState.selectedCli) {
			goto('/');
			return;
		}

		if (launcherState.cliValidated[launcherState.selectedCli]) {
			launcherState.setCurrentStep('project');
			void saveSession({
				selected_cli: launcherState.selectedCli,
				project_path: launcherState.projectPath,
				current_step: 'project'
			});
			goto('/project');
			return;
		}

		launcherState.setCurrentStep('terminal');
		void saveSession({
			selected_cli: launcherState.selectedCli,
			project_path: launcherState.projectPath,
			current_step: 'terminal'
		});
		connect();

		const interval = setInterval(() => {
			if (launcherState.wsConnected && launcherState.selectedCli) {
				spawnCli(launcherState.selectedCli);
				clearInterval(interval);
			}
		}, 100);

		return () => {
			clearInterval(interval);
		};
	});

	function handleBack() {
		goto('/');
	}

	function handleNext() {
		goto('/project');
	}
</script>

<PageShell>
	<Container size="md">
		<div class="page-stack">
			<div class="page-header">
				<div class="header-left">
					<Button variant="ghost" size="sm" onclick={handleBack}>Back</Button>
					<Heading level={2}>{cliDef?.name ?? 'Terminal'}</Heading>
				</div>
				<Badge color={badge.color} variant="dot">
					{badge.label}
				</Badge>
			</div>

			{#if status === 'auth' && cliDef}
				<Card.Root>
					<Card.Content>
						<div class="card-stack">
							<Badge variant="soft" color="yellow">Sign in required</Badge>
							<Text color="muted">Run this in your terminal to sign in:</Text>
							<CodeBlock code={cliDef.authCommand} language="sh" />
							<Text color="muted" size="sm">Then return to DryUI and try again</Text>
							<Button variant="outline" size="sm" onclick={handleBack}>Back to selection</Button>
						</div>
					</Card.Content>
				</Card.Root>
			{:else if status === 'error'}
				<Alert.Root variant="error">
					<Alert.Description>{launcherState.ptyError ?? 'Connection failed'}</Alert.Description>
				</Alert.Root>
				<Button variant="outline" size="sm" onclick={handleBack}>Back to selection</Button>
			{:else if status === 'success' && cliDef}
				<Card.Root>
					<Card.Content>
						<div class="card-stack">
							<Badge variant="soft" color="green">Connected</Badge>
							<Text>Successfully connected to {cliDef.name}</Text>
							<Text color="muted" size="sm">Select a project folder to get started</Text>
							<Button variant="solid" onclick={handleNext}>Select project</Button>
						</div>
					</Card.Content>
				</Card.Root>
			{:else}
				<Card.Root>
					<Card.Content>
						<div class="card-stack">
							<Spinner size="lg" />
							<Text color="muted">
								{status === 'connecting'
									? 'Connecting to server…'
									: `Checking ${cliDef?.name ?? 'CLI'}…`}
							</Text>
						</div>
					</Card.Content>
				</Card.Root>
			{/if}
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

	.card-stack {
		display: grid;
		gap: var(--dry-space-4);
		justify-items: center;
	}
</style>
