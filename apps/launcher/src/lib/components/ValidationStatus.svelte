<script lang="ts">
	import { Alert } from '@dryui/ui/alert';
	import { Typography } from '@dryui/ui/typography';
	import { launcherState } from '../launcher-state.svelte.ts';
	import { CLI_DEFINITIONS } from '../cli-definitions.ts';

	let selected = $derived(launcherState.selectedCli);
	let validation = $derived(selected ? launcherState.validations[selected] : null);
	let definition = $derived(selected ? CLI_DEFINITIONS.find((d) => d.id === selected) : null);

	let visible = $derived(
		validation && validation.status !== 'idle' && validation.status !== 'checking'
	);
</script>

{#if visible && validation && definition}
	{#if validation.status === 'found'}
		<Alert.Root variant="success">
			<Alert.Title>{definition.name} is ready</Alert.Title>
			<Alert.Description>
				{#if validation.version}
					Version: {validation.version}
				{/if}
				{#if validation.path}
					<br />Path: {validation.path}
				{/if}
			</Alert.Description>
		</Alert.Root>
	{:else if validation.status === 'not-found'}
		<Alert.Root variant="warning">
			<Alert.Title>{definition.name} not found</Alert.Title>
			<Alert.Description>
				The <Typography.Code>{CLI_DEFINITIONS.find((d) => d.id === selected)?.name}</Typography.Code
				> CLI was not found in your PATH. Please install it first.
			</Alert.Description>
		</Alert.Root>
	{:else if validation.status === 'error'}
		<Alert.Root variant="error">
			<Alert.Title>Validation error</Alert.Title>
			<Alert.Description>
				{validation.error ?? 'An unexpected error occurred while checking for the CLI.'}
			</Alert.Description>
		</Alert.Root>
	{/if}
{/if}
