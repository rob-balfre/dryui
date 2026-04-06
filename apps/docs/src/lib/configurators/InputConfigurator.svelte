<script lang="ts">
	import { Input, Label } from '@dryui/ui';
	import Configurator from '$lib/components/Configurator.svelte';
	import type { ConfigControl, ConfigValues } from './types';

	type InputType = 'email' | 'password' | 'search';
	type InputSize = 'sm' | 'md' | 'lg';

	const controls = [
		{
			key: 'type',
			label: 'Type',
			type: 'select',
			defaultValue: 'email',
			options: [
				{ label: 'Email', value: 'email' },
				{ label: 'Password', value: 'password' },
				{ label: 'Search', value: 'search' }
			],
			description: 'Use native types so the keyboard and autofill behavior stay correct.'
		},
		{
			key: 'size',
			label: 'Size',
			type: 'select',
			defaultValue: 'md',
			options: [
				{ label: 'Small', value: 'sm' },
				{ label: 'Medium', value: 'md' },
				{ label: 'Large', value: 'lg' }
			],
			description: 'Match the field density to the surrounding form.'
		},
		{
			key: 'placeholder',
			label: 'Placeholder',
			type: 'text',
			defaultValue: 'you@example.com',
			placeholder: 'Placeholder',
			description: 'Use placeholder text as a hint, not as the only field label.'
		},
		{
			key: 'disabled',
			label: 'Disabled',
			type: 'boolean',
			defaultValue: false,
			description: 'Preview the inactive treatment before you wire validation or permissions.'
		}
	] satisfies ConfigControl[];

	let value = $state('');

	function getCode(values: ConfigValues) {
		const type = values.type as InputType;
		const size = values.size as InputSize;
		const placeholder = String(values.placeholder);
		const disabled = values.disabled === true ? ' disabled' : '';

		return `<Input type="${type}" size="${size}" placeholder="${placeholder}"${disabled} />`;
	}
</script>

<Configurator
	title="Input Configurator"
	description="Tune field type, density, and hint text, then verify the value still reads clearly in context."
	{controls}
	code={getCode}
>
	{#snippet preview(values)}
		<div class="input-preview">
			<Label for="configurator-input">Email address</Label>
			<Input
				id="configurator-input"
				bind:value
				type={values.type as InputType}
				size={values.size as InputSize}
				placeholder={String(values.placeholder)}
				disabled={Boolean(values.disabled)}
			/>
			<p>Current value: <code>{value || 'empty'}</code></p>
		</div>
	{/snippet}
</Configurator>

<style>
	.input-preview {
		display: grid;
		grid-template-columns: minmax(0, 24rem);
		gap: var(--dry-space-2);
	}
</style>
