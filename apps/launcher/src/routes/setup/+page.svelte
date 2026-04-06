<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { Container } from '@dryui/ui/container';
	import { Button } from '@dryui/ui/button';
	import { Heading } from '@dryui/ui/heading';
	import { Text } from '@dryui/ui/text';
	import { Card } from '@dryui/ui/card';
	import { Spinner } from '@dryui/ui/spinner';
	import { Alert } from '@dryui/ui/alert';
	import { Badge } from '@dryui/ui/badge';
	import { CLI_DEFINITIONS } from '$lib/cli-definitions.ts';
	import { launcherState } from '$lib/launcher-state.svelte.ts';
	import { analyzeProject, setupProject, connect } from '$lib/ws-client.ts';
	import { saveSession } from '../session.remote.ts';
	import PageShell from '$lib/components/PageShell.svelte';

	onMount(() => {
		if (!launcherState.projectPath) {
			goto('/project');
			return;
		}

		launcherState.setCurrentStep('setup');
		void saveSession({
			selected_cli: launcherState.selectedCli,
			project_path: launcherState.projectPath,
			current_step: 'setup'
		});
		launcherState.resetSetup();
		launcherState.resetProjectAnalysis();
		connect();

		const interval = setInterval(() => {
			if (launcherState.wsConnected) {
				analyzeProject(launcherState.projectPath!);
				clearInterval(interval);
			}
		}, 100);

		return () => clearInterval(interval);
	});

	let analysis = $derived(launcherState.projectAnalysis);
	let setup = $derived(launcherState.setupStatus);
	let steps = $derived(launcherState.setupSteps);
	let setupErr = $derived(launcherState.setupError);
	let projectName = $derived(launcherState.projectPath?.split('/').pop() ?? 'project');
	let cliName = $derived(
		CLI_DEFINITIONS.find((d) => d.id === launcherState.selectedCli)?.name ?? 'AI CLI'
	);

	let isIncompatible = $derived(
		(analysis.status === 'greenfield' || analysis.status === 'installed') &&
			analysis.framework !== undefined &&
			analysis.framework !== 'sveltekit' &&
			analysis.framework !== 'unknown'
	);

	let frameworkLabel = $derived.by(() => {
		const labels: Record<string, string> = {
			svelte: 'Svelte (without SvelteKit)',
			react: 'React',
			angular: 'Angular',
			vue: 'Vue',
			unknown: 'an unrecognised framework'
		};
		return labels[analysis.framework ?? 'unknown'] ?? analysis.framework;
	});

	const INSTALL_STEPS = [
		{ id: 'scaffold-sveltekit', label: 'Install Svelte & SvelteKit' },
		{ id: 'install-package', label: 'Install @dryui/ui' },
		{ id: 'add-foundation-css', label: 'Add foundation CSS' },
		{ id: 'add-theme-imports', label: 'Add theme imports' },
		{ id: 'set-theme-class', label: 'Set theme class' },
		{ id: 'configure-mcp', label: 'Configure MCP' }
	] as const;

	const UPDATE_STEPS = [
		{ id: 'update-package', label: 'Update @dryui/ui' },
		{ id: 'run-migration', label: 'Run migration' },
		{ id: 'verify-mcp', label: 'Verify MCP config' }
	] as const;

	let activeSteps = $derived(analysis.updateAvailable ? UPDATE_STEPS : INSTALL_STEPS);

	function handleBack() {
		goto('/project');
	}

	function handleContinue() {
		goto('/theme');
	}

	function handleSetup() {
		if (!launcherState.projectPath || !launcherState.selectedCli) return;
		setupProject(
			launcherState.projectPath,
			launcherState.selectedCli,
			'install',
			analysis.packageManager ?? 'npm'
		);
	}

	function handleUpdate() {
		if (!launcherState.projectPath || !launcherState.selectedCli) return;
		setupProject(
			launcherState.projectPath,
			launcherState.selectedCli,
			'update',
			analysis.packageManager ?? 'npm'
		);
	}

	function handleRetry() {
		if (!launcherState.projectPath) return;
		launcherState.resetSetup();
		launcherState.resetProjectAnalysis();
		analyzeProject(launcherState.projectPath);
	}
</script>

<PageShell>
	<Container size="md">
		<div class="page-stack">
			<div class="page-header">
				<Button variant="ghost" size="sm" onclick={handleBack}>Back</Button>
				<Heading level={2}>Project setup</Heading>
			</div>

			{#if (analysis.status === 'analyzing' || analysis.status === 'idle') && setup === 'idle'}
				<Card.Root>
					<Card.Content>
						<div class="analyzing-wrapper">
							<div class="analyzing-spinner">
								<Spinner size="md" />
								<Text>Analysing <strong>{projectName}</strong>...</Text>
							</div>
						</div>
					</Card.Content>
				</Card.Root>
			{:else if isIncompatible}
				<Alert.Root variant="warning">
					<Alert.Description>
						{#if analysis.framework === 'svelte'}
							DryUI requires SvelteKit. <strong>{projectName}</strong> uses Svelte without SvelteKit.
						{:else}
							DryUI is a Svelte 5 component library and isn't compatible with {frameworkLabel} projects.
						{/if}
					</Alert.Description>
				</Alert.Root>
			{:else if setup === 'running' || setup === 'failed'}
				<Card.Root>
					<Card.Content>
						<div class="setup-steps">
							<Heading level={3}>
								{setup === 'running' ? 'Setting up DryUI...' : 'Setup failed'}
							</Heading>
							{#each activeSteps as step (step.id)}
								{@const state = steps[step.id]}
								<div class="step-row">
									{#if state?.status === 'running'}
										<Spinner size="sm" />
									{:else if state?.status === 'done'}
										<Badge color="green" variant="soft" size="sm">Done</Badge>
									{:else if state?.status === 'failed'}
										<Badge color="red" variant="soft" size="sm">Failed</Badge>
									{:else}
										<Badge color="gray" variant="soft" size="sm">Pending</Badge>
									{/if}
									<Text>{step.label}</Text>
								</div>
							{/each}
						</div>
					</Card.Content>
				</Card.Root>

				{#if setupErr}
					<Alert.Root variant="error">
						<Alert.Description>{setupErr.error}</Alert.Description>
					</Alert.Root>
					<div class="actions">
						<Button variant="outline" onclick={handleRetry}>Retry</Button>
					</div>
				{/if}
			{:else if setup === 'complete'}
				<Card.Root>
					<Card.Content>
						<div class="complete-content">
							<Badge color="green" variant="soft">Complete</Badge>
							<Heading level={3}>DryUI is ready</Heading>
							<Text color="muted">Installed and configured in <strong>{projectName}</strong>.</Text>
						</div>
					</Card.Content>
				</Card.Root>

				<div class="actions">
					<Button variant="solid" onclick={handleContinue}>Continue to theme</Button>
				</div>
			{:else if analysis.status === 'greenfield' && setup === 'idle'}
				<Card.Root>
					<Card.Content>
						<div class="greenfield-content">
							<div class="status-row">
								<Heading level={3}>DryUI not installed</Heading>
								<Badge color="blue" variant="soft">Not found</Badge>
							</div>
							<Text>
								<strong>{projectName}</strong> doesn't have DryUI yet. This will:
							</Text>
							<div class="install-list">
								<Text size="sm" color="muted">1. Install Svelte & SvelteKit (if needed)</Text>
								<Text size="sm" color="muted"
									>2. Install @dryui/ui via {analysis.packageManager ?? 'npm'}</Text
								>
								<Text size="sm" color="muted">3. Add theme imports to your root layout</Text>
								<Text size="sm" color="muted">4. Set the theme class on your HTML element</Text>
								<Text size="sm" color="muted">5. Configure MCP for {cliName}</Text>
							</div>
						</div>
					</Card.Content>
				</Card.Root>

				<div class="actions">
					<Button variant="solid" onclick={handleSetup}>Set up DryUI</Button>
				</div>
			{:else if analysis.status === 'installed' && setup === 'idle'}
				<Card.Root>
					<Card.Content>
						<div class="installed-content">
							<div class="status-row">
								<Heading level={3}>DryUI found</Heading>
								<Badge color="green" variant="soft">Installed</Badge>
							</div>

							{#if analysis.installedVersion}
								<div class="version-row">
									<Text>Installed version: <strong>{analysis.installedVersion}</strong></Text>
									{#if analysis.latestVersion}
										<Text color="secondary">Latest: {analysis.latestVersion}</Text>
									{/if}
								</div>
							{/if}

							{#if analysis.updateAvailable}
								<Alert.Root variant="warning">
									<Alert.Description>
										A newer version of DryUI is available ({analysis.latestVersion}). Would you like
										to update?
									</Alert.Description>
								</Alert.Root>
							{:else}
								<Alert.Root variant="success">
									<Alert.Description>You're on the latest version.</Alert.Description>
								</Alert.Root>
							{/if}
						</div>
					</Card.Content>
				</Card.Root>

				<div class="action-bar">
					{#if analysis.updateAvailable}
						<Button variant="solid" onclick={handleUpdate}>Update and continue</Button>
						<Button variant="outline" onclick={handleContinue}>Skip update</Button>
					{:else}
						<Button variant="solid" onclick={handleContinue}>Continue</Button>
					{/if}
				</div>
			{:else if analysis.status === 'error'}
				<Alert.Root variant="error">
					<Alert.Description>
						{analysis.error ??
							'Failed to analyse the project. Check the folder path and try again.'}
					</Alert.Description>
				</Alert.Root>

				<div class="actions">
					<Button variant="outline" onclick={handleRetry}>Retry analysis</Button>
				</div>
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
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		align-items: center;
		gap: var(--dry-space-4);
	}

	.analyzing-wrapper {
		display: grid;
		justify-items: center;
		padding-block: var(--dry-space-8);
	}

	.analyzing-spinner {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		align-items: center;
		gap: var(--dry-space-4);
	}

	.setup-steps {
		display: grid;
		gap: var(--dry-space-2);
	}

	.step-row {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		align-items: center;
		gap: var(--dry-space-2);
	}

	.complete-content {
		display: grid;
		gap: var(--dry-space-4);
		justify-items: center;
	}

	.greenfield-content {
		display: grid;
		gap: var(--dry-space-4);
	}

	.installed-content {
		display: grid;
		gap: var(--dry-space-4);
	}

	.status-row {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		align-items: center;
		gap: var(--dry-space-2);
	}

	.version-row {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		align-items: center;
		gap: var(--dry-space-2);
	}

	.install-list {
		display: grid;
		gap: var(--dry-space-2);
	}

	.actions {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
	}

	.action-bar {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		gap: var(--dry-space-2);
	}
</style>
