<script lang="ts">
	import { Alert, Button } from '@dryui/ui';
	import Configurator from '$lib/components/Configurator.svelte';
	import type { ConfigControl, ConfigValues } from './types';

	type AlertVariant = 'info' | 'success' | 'warning' | 'error';

	const controls = [
		{
			key: 'variant',
			label: 'Variant',
			type: 'select',
			defaultValue: 'info',
			options: [
				{ label: 'Info', value: 'info' },
				{ label: 'Success', value: 'success' },
				{ label: 'Warning', value: 'warning' },
				{ label: 'Error', value: 'error' }
			],
			description: 'Choose the semantic tone that matches the message meaning.'
		},
		{
			key: 'title',
			label: 'Title',
			type: 'text',
			defaultValue: 'System notice',
			placeholder: 'Alert title',
			description: 'Keep the heading concise so it stays scannable.'
		},
		{
			key: 'dismissible',
			label: 'Dismissible',
			type: 'boolean',
			defaultValue: false,
			description: 'Use dismissal only when the message does not block the next action.'
		}
	] satisfies ConfigControl[];

	let visible = $state(true);

	function getDescription(variant: AlertVariant) {
		switch (variant) {
			case 'success':
				return 'Your settings were published successfully.';
			case 'warning':
				return 'A review is still required before this goes live.';
			case 'error':
				return 'Publishing failed. Check the required fields and try again.';
			default:
				return 'Updates will roll out gradually across the workspace.';
		}
	}

	function getCode(values: ConfigValues) {
		const variant = values.variant as AlertVariant;
		const title = String(values.title);
		const dismissible = values.dismissible === true ? ' dismissible' : '';

		return `<Alert variant="${variant}"${dismissible}>\n  {#snippet title()}${title}{/snippet}\n  {#snippet description()}${getDescription(variant)}{/snippet}\n</Alert>`;
	}
</script>

<Configurator
	title="Alert Configurator"
	description="Preview the tone, title, and dismissal pattern before you add the message to a real flow."
	{controls}
	code={getCode}
>
	{#snippet preview(values)}
		<div class="alert-preview">
			{#if visible}
				<Alert
					variant={values.variant as AlertVariant}
					dismissible={Boolean(values.dismissible)}
					onDismiss={() => (visible = false)}
				>
					{#snippet title()}{String(values.title)}{/snippet}
					{#snippet description()}{getDescription(values.variant as AlertVariant)}{/snippet}
				</Alert>
			{:else}
				<Button variant="outline" onclick={() => (visible = true)}>Show alert</Button>
			{/if}
		</div>
	{/snippet}
</Configurator>

<style>
	.alert-preview {
		display: grid;
		grid-template-columns: minmax(0, 34rem);
		gap: var(--dry-space-2);
	}
</style>
