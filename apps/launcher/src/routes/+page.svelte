<script lang="ts">
	import { goto } from '$app/navigation';
	import { Container } from '@dryui/ui/container';
	import { Heading } from '@dryui/ui/heading';
	import { Text } from '@dryui/ui/text';
	import { Button } from '@dryui/ui/button';
	import { Alert } from '@dryui/ui/alert';
	import { Card } from '@dryui/ui/card';
	import { Badge } from '@dryui/ui/badge';
	import { CLI_DEFINITIONS, type CliId } from '$lib/cli-definitions.ts';
	import { launcherState } from '$lib/launcher-state.svelte.ts';
	import type { ProjectRow, SessionData } from '$lib/session-types.ts';
	import { getCliValidations } from './cli.remote.ts';
	import {
		getSession,
		saveSession,
		resetSession,
		activateProject,
		deleteProject
	} from './session.remote.ts';
	import CliCard from '$lib/components/CliCard.svelte';
	import ValidationStatus from '$lib/components/ValidationStatus.svelte';
	import PageShell from '$lib/components/PageShell.svelte';

	interface CliValidationResult {
		status: 'found' | 'not-found' | 'error';
		version?: string;
		path?: string;
		latest?: string;
		updateAvailable: boolean;
	}

	const [validations, sessionData] = (await Promise.all([getCliValidations(), getSession()])) as [
		Record<CliId, CliValidationResult>,
		SessionData
	];

	// Hydrate from live CLI checks
	for (const [id, result] of Object.entries(validations)) {
		const cliId = id as CliId;
		launcherState.setValidationResult(cliId, {
			status: result.status as 'found' | 'not-found' | 'error',
			...(result.version ? { version: result.version } : {}),
			...(result.path ? { path: result.path } : {})
		});
		if (result.version || result.latest) {
			launcherState.setVersionInfo(cliId, {
				updateAvailable: result.updateAvailable,
				...(result.version ? { installed: result.version } : {}),
				...(result.latest ? { latest: result.latest } : {})
			});
		}
	}

	launcherState.hydrate(sessionData);

	let continueError = $state<string | null>(null);
	let projects = $state<ProjectRow[]>(sessionData.projects ?? []);

	function handleSelect(cli: (typeof CLI_DEFINITIONS)[number]) {
		launcherState.select(cli.id);
		void saveSession({ selected_cli: cli.id, current_step: 'cli-selection' });
		continueError = null;
	}

	function handleContinue() {
		if (!launcherState.selectedCli) {
			continueError = 'Select a CLI to continue.';
			return;
		}

		const validation = launcherState.validations[launcherState.selectedCli];
		if (validation.status === 'not-found' || validation.status === 'error') {
			continueError = 'The selected CLI is not installed. Choose one that is available.';
			return;
		}

		continueError = null;

		// Skip terminal if already validated
		if (launcherState.cliValidated[launcherState.selectedCli]) {
			goto('/project');
		} else {
			goto('/terminal');
		}
	}

	async function handleSwitchProject(project: ProjectRow) {
		await activateProject(project.project_path);
		launcherState.select(project.selected_cli);
		launcherState.setProjectPath(project.project_path);
		launcherState.setCurrentStep(project.current_step);
		void saveSession({
			selected_cli: project.selected_cli,
			project_path: project.project_path,
			current_step: project.current_step
		});
		goto(`/${project.current_step}`);
	}

	async function handleRemoveProject(project: ProjectRow) {
		await deleteProject(project.project_path);
		projects = projects.filter((p) => p.project_path !== project.project_path);
	}

	function getProjectName(path: string): string {
		return path.split('/').pop() ?? path;
	}

	function getCliName(cliId: CliId): string {
		return CLI_DEFINITIONS.find((d) => d.id === cliId)?.name ?? cliId;
	}
</script>

<PageShell align="center">
	<Container size="md">
		<div class="page-grid">
			<div class="hero-header">
				<span class="logo">DRY<span class="logo-ui">ui</span></span>
				<Heading level={1}>Connect your AI CLI</Heading>
				<Text color="muted" size="lg">Select a coding assistant to get started</Text>
			</div>

			{#if projects.length > 0}
				<div class="projects-grid">
					<Text size="sm" weight="medium">Projects</Text>
					{#each projects as project (project.project_path)}
						<Card.Root>
							<Card.Content>
								<div class="project-row">
									<div class="project-info">
										<div class="project-name-row">
											<Text weight="semibold">{getProjectName(project.project_path)}</Text>
											<Badge
												size="sm"
												variant="soft"
												color={project.current_step === 'workspace'
													? 'green'
													: project.current_step === 'theme'
														? 'blue'
														: 'gray'}
											>
												{project.current_step === 'theme' ? 'Theme' : project.current_step}
											</Badge>
										</div>
										<Text size="sm" color="muted"
											>{project.project_path} &middot; {getCliName(project.selected_cli)}</Text
										>
									</div>
									<div class="project-actions">
										<Button variant="solid" size="sm" onclick={() => handleSwitchProject(project)}
											>Open</Button
										>
										<Button variant="ghost" size="sm" onclick={() => handleRemoveProject(project)}
											>Remove</Button
										>
									</div>
								</div>
							</Card.Content>
						</Card.Root>
					{/each}
				</div>
			{/if}

			<div class="cli-grid">
				{#each CLI_DEFINITIONS as cli (cli.id)}
					<CliCard definition={cli} onSelect={() => handleSelect(cli)} />
				{/each}
			</div>

			<ValidationStatus />

			{#if continueError}
				<Alert.Root variant="error" dismissible onDismiss={() => (continueError = null)}>
					<Alert.Description>{continueError}</Alert.Description>
				</Alert.Root>
			{/if}

			<Button onclick={handleContinue}>New project</Button>
		</div>
	</Container>
</PageShell>

<style>
	.page-grid {
		display: grid;
		container-type: inline-size;
		grid-template-columns: var(--page-columns, 1fr);
		gap: var(--page-gap, var(--dry-space-6));
	}

	.hero-header {
		display: grid;
		gap: var(--dry-space-2);
		justify-items: center;
		text-align: center;
	}

	.projects-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: var(--dry-space-3);
	}

	.cli-grid {
		display: grid;
		container-type: inline-size;
		grid-template-columns: var(--cli-columns, repeat(3, minmax(0, 1fr)));
		gap: var(--cli-gap, var(--dry-space-4));
	}

	@container (max-width: 36rem) {
		.cli-grid {
			--cli-columns: 1fr;
		}
	}

	.logo {
		font-size: 3rem;
		font-weight: 800;
		letter-spacing: -0.03em;
		line-height: 1;
		display: inline-grid;
		grid-auto-flow: column;
		align-items: center;
		gap: 0.2em;
		color: var(--dry-color-text-strong);
	}

	.project-row {
		display: grid;
		grid-template-columns: 1fr auto;
		align-items: center;
	}

	.project-info {
		display: grid;
		gap: var(--dry-space-2);
	}

	.project-name-row {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		align-items: center;
		gap: var(--dry-space-2);
	}

	.project-actions {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		gap: var(--dry-space-2);
	}

	.logo-ui {
		border: 2px solid currentColor;
		padding: 0.1em 0.35em;
		border-radius: 0.3em;
		font-weight: 800;
		font-size: 0.75em;
		letter-spacing: 0.02em;
		line-height: 1;
	}
</style>
