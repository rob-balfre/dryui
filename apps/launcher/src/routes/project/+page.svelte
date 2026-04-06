<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { Container } from '@dryui/ui/container';
	import { Button } from '@dryui/ui/button';
	import { Heading } from '@dryui/ui/heading';
	import { Text } from '@dryui/ui/text';
	import { FileSelect } from '@dryui/ui/file-select';
	import { Card } from '@dryui/ui/card';
	import { Field } from '@dryui/ui/field';
	import { Input } from '@dryui/ui/input';
	import { Label } from '@dryui/ui/label';
	import { Alert } from '@dryui/ui/alert';
	import { launcherState } from '$lib/launcher-state.svelte.ts';
	import { connect, pickFolder } from '$lib/ws-client.ts';
	import { saveSession } from '../session.remote.ts';
	import PageShell from '$lib/components/PageShell.svelte';

	const ABSOLUTE_PATH_RE = /^(\/|[A-Za-z]:[\\/])/;

	function isAbsoluteProjectPath(value: string | null): value is string {
		return value !== null && ABSOLUTE_PATH_RE.test(value);
	}

	onMount(() => {
		if (!launcherState.selectedCli) {
			goto('/');
			return;
		}

		connect();
		launcherState.setCurrentStep('project');

		if (!isAbsoluteProjectPath(path)) {
			handleChange(null);
			return;
		}

		void saveSession({
			selected_cli: launcherState.selectedCli,
			project_path: path,
			current_step: 'project'
		});
	});

	let path = $state<string | null>(launcherState.projectPath);
	let pathInput = $state(launcherState.projectPath ?? '');
	let continueError = $state<string | null>(null);

	function handleChange(value: string | null) {
		pathInput = value ?? '';
		const nextPath = isAbsoluteProjectPath(value) ? value : null;
		path = nextPath;
		launcherState.setProjectPath(nextPath);
		continueError = null;
		void saveSession({
			selected_cli: launcherState.selectedCli,
			project_path: nextPath,
			current_step: 'project'
		});
	}

	async function handleRequestFolder(): Promise<string | null> {
		connect();
		return pickFolder();
	}

	function handleBack() {
		if (launcherState.selectedCli && launcherState.cliValidated[launcherState.selectedCli]) {
			goto('/');
			return;
		}

		goto('/terminal');
	}

	function handleContinue() {
		if (!isAbsoluteProjectPath(pathInput)) {
			continueError = 'Enter an absolute project path or choose a folder to continue.';
			return;
		}

		handleChange(pathInput);
		goto('/setup');
	}
</script>

<PageShell>
	<Container size="md">
		<div class="page-stack">
			<div class="page-header">
				<div class="header-left">
					<Button variant="ghost" size="sm" onclick={handleBack}>Back</Button>
					<Heading level={2}>Project selection</Heading>
				</div>
			</div>

			<Card.Root>
				<Card.Content>
					<div class="card-stack">
						<Text>Choose the folder for your project</Text>
						<FileSelect.Root
							bind:value={path}
							onrequest={handleRequestFolder}
							onchange={handleChange}
						>
							<FileSelect.Trigger>Choose folder</FileSelect.Trigger>
							<FileSelect.Value placeholder="No folder selected" />
							<FileSelect.Clear />
						</FileSelect.Root>
						<Field.Root>
							<Label for="project-path">Project path</Label>
							<Input
								id="project-path"
								bind:value={pathInput}
								placeholder="/absolute/path/to/project"
								oninput={() => (continueError = null)}
							/>
							<Text size="sm" color="muted">
								Use this when the folder picker is unavailable, including browser-driven launcher
								sessions.
							</Text>
						</Field.Root>
					</div>
				</Card.Content>
			</Card.Root>

			{#if continueError}
				<Alert.Root variant="error" dismissible onDismiss={() => (continueError = null)}>
					<Alert.Description>{continueError}</Alert.Description>
				</Alert.Root>
			{/if}

			<div class="actions">
				<Button variant="solid" onclick={handleContinue}>Continue</Button>
			</div>
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
	}

	.actions {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
	}
</style>
