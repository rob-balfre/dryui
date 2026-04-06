<script lang="ts">
	import { Label, Select } from '@dryui/ui';
	import Configurator from '$lib/components/Configurator.svelte';
	import type { ConfigControl, ConfigValues } from './types';

	const controls = [
		{
			key: 'placeholder',
			label: 'Placeholder',
			type: 'text',
			defaultValue: 'Select a role...',
			placeholder: 'Placeholder',
			description: 'Use placeholder text as a hint, not as the only field label.'
		},
		{
			key: 'disabled',
			label: 'Disabled',
			type: 'boolean',
			defaultValue: false,
			description:
				'Check the closed state before you lock the control behind permissions or loading.'
		},
		{
			key: 'withName',
			label: 'Submit with form',
			type: 'boolean',
			defaultValue: true,
			description:
				'Add a name when the selected value should participate in native form submission.'
		}
	] satisfies ConfigControl[];

	let value = $state('');

	function getCode(values: ConfigValues) {
		const placeholder = String(values.placeholder);
		const disabled = values.disabled === true ? ' disabled' : '';
		const name = values.withName === true ? ' name="role"' : '';

		return `<Select.Root bind:value={selected}${name}${disabled}>\n  <Select.Trigger>\n    <Select.Value placeholder="${placeholder}" />\n  </Select.Trigger>\n  <Select.Content>\n    <Select.Item value="owner">Owner</Select.Item>\n    <Select.Item value="admin">Admin</Select.Item>\n    <Select.Item value="editor">Editor</Select.Item>\n    <Select.Item value="viewer">Viewer</Select.Item>\n  </Select.Content>\n</Select.Root>`;
	}
</script>

<Configurator
	title="Select Configurator"
	description="Confirm the field context, placeholder, and submission behavior before you add the select to a form."
	{controls}
	code={getCode}
>
	{#snippet preview(values)}
		<div class="select-preview">
			<Label>Role</Label>
			<Select.Root
				bind:value
				disabled={Boolean(values.disabled)}
				{...values.withName ? { name: 'role' } : {}}
			>
				<Select.Trigger>
					<Select.Value placeholder={String(values.placeholder)} />
				</Select.Trigger>
				<Select.Content>
					<Select.Item value="owner">Owner</Select.Item>
					<Select.Item value="admin">Admin</Select.Item>
					<Select.Item value="editor">Editor</Select.Item>
					<Select.Item value="viewer">Viewer</Select.Item>
				</Select.Content>
			</Select.Root>
			<p>Current value: <code>{value || 'none'}</code></p>
		</div>
	{/snippet}
</Configurator>

<style>
	.select-preview {
		display: grid;
		grid-template-columns: minmax(0, 22rem);
		gap: var(--dry-space-2);
	}
</style>
