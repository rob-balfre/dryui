<script lang="ts">
	import { Input, Switch, Textarea } from '@dryui/ui';
	import type { InspectorControl } from '../studio-data';

	interface Props {
		control: InspectorControl;
		onChange: (control: InspectorControl, value: string | boolean) => void;
	}

	let { control, onChange }: Props = $props();
</script>

<label class="field">
	<span class="field-label">
		{control.label}
		{#if control.hint}
			<span>{control.hint}</span>
		{/if}
	</span>

	{#if control.kind === 'text' || control.kind === 'color'}
		<Input
			value={typeof control.value === 'string' ? control.value : ''}
			oninput={(event) => onChange(control, (event.currentTarget as HTMLInputElement).value)}
		/>
	{:else if control.kind === 'textarea'}
		<Textarea
			value={typeof control.value === 'string' ? control.value : ''}
			oninput={(event) => onChange(control, (event.currentTarget as HTMLTextAreaElement).value)}
		/>
	{:else if control.kind === 'toggle'}
		<div class="toggle-row">
			<Switch
				checked={Boolean(control.value)}
				onclick={() => onChange(control, !Boolean(control.value))}
			/>
			<span>{Boolean(control.value) ? 'Enabled' : 'Disabled'}</span>
		</div>
	{:else}
		<select
			value={typeof control.value === 'string' ? control.value : ''}
			oninput={(event) => onChange(control, (event.currentTarget as HTMLSelectElement).value)}
		>
			{#each control.options ?? [] as option (option)}
				<option value={option}>{option}</option>
			{/each}
		</select>
	{/if}
</label>

<style>
	.field {
		display: grid;
		gap: var(--dry-space-2);
	}

	.field-label {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: var(--dry-space-2);
		font-size: var(--dry-text-sm-size);
		font-weight: 650;
	}

	.field-label span {
		color: var(--dry-color-text-muted);
		font-weight: 400;
		font-size: var(--dry-text-xs-size);
	}

	.toggle-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--dry-space-3);
	}

	select {
		width: 100%;
		min-height: 2.5rem;
		padding: 0 var(--dry-space-3);
		border-radius: var(--dry-radius-md);
		border: 1px solid var(--dry-color-border);
		background: var(--dry-color-surface-raised);
		color: inherit;
	}
</style>
