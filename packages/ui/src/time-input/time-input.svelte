<script lang="ts">
	import { untrack } from 'svelte';
	import { getFormControlCtx } from '@dryui/primitives';
	import { Select } from '../select/index.js';

	interface Props {
		value?: string;
		disabled?: boolean;
		step?: number;
		size?: 'sm' | 'md' | 'lg';
		name?: string;
		class?: string;
	}

	let {
		value = $bindable(''),
		disabled = false,
		step,
		size = 'md',
		name,
		class: className
	}: Props = $props();

	const ctx = getFormControlCtx();
	const isDisabled = $derived(disabled || ctx?.disabled || false);

	let hourStr = $state('');
	let minuteStr = $state('');
	let updating = false;

	// Parse incoming value into hour/minute (only reacts to value changes)
	$effect(() => {
		if (updating) return;
		const parts = value.split(':');
		const h = parts[0] ?? '';
		const m = parts[1] ?? '';
		untrack(() => {
			if (h !== hourStr) hourStr = h;
			if (m !== minuteStr) minuteStr = m;
		});
	});

	// Reconstruct value when selects change (only reacts to hourStr/minuteStr)
	$effect(() => {
		const h = hourStr;
		const m = minuteStr;
		if (h && m) {
			const newVal = `${h}:${m}`;
			untrack(() => {
				if (newVal !== value) {
					updating = true;
					value = newVal;
					updating = false;
				}
			});
		}
	});

	// Generate hour options 00-23
	const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));

	// Generate minute options based on step
	const minutes = $derived.by(() => {
		const stepMinutes = step && step >= 60 ? Math.floor(step / 60) : 1;
		const count = Math.floor(60 / stepMinutes);
		return Array.from({ length: count }, (_, i) =>
			String(i * stepMinutes).padStart(2, '0')
		);
	});
</script>

<div
	role="group"
	aria-label="Time"
	data-time-input-wrapper
	data-disabled={isDisabled || undefined}
	id={ctx?.id}
	aria-describedby={ctx?.describedBy}
	aria-invalid={ctx?.hasError || undefined}
	aria-errormessage={ctx?.errorMessageId}
	class={className}
>
	<Select.Root bind:value={hourStr} disabled={isDisabled}>
		<Select.Trigger {size} aria-label="Hour">
			<span data-time-display data-placeholder={!hourStr ? '' : undefined}>
				{hourStr || 'HH'}
			</span>
		</Select.Trigger>
		<Select.Content>
			{#each hours as h (h)}
				<Select.Item value={h}>{h}</Select.Item>
			{/each}
		</Select.Content>
	</Select.Root>

	<span data-time-separator>:</span>

	<Select.Root bind:value={minuteStr} disabled={isDisabled}>
		<Select.Trigger {size} aria-label="Minute">
			<span data-time-display data-placeholder={!minuteStr ? '' : undefined}>
				{minuteStr || 'MM'}
			</span>
		</Select.Trigger>
		<Select.Content>
			{#each minutes as m (m)}
				<Select.Item value={m}>{m}</Select.Item>
			{/each}
		</Select.Content>
	</Select.Root>

	{#if name}
		<input type="hidden" {name} {value} disabled={isDisabled || undefined} />
	{/if}
</div>

<style>
	[data-time-input-wrapper] {
		display: inline-grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		align-items: center;
		gap: var(--dry-space-1);
	}

	[data-time-display][data-placeholder] {
		color: var(--dry-color-text-weak);
	}

	[data-time-separator] {
		font-family: var(--dry-font-sans);
		font-size: var(--dry-type-small-size);
		color: var(--dry-color-text-strong);
		font-weight: 600;
		line-height: 1;
	}

	[data-time-input-wrapper][data-disabled] {
		opacity: 0.55;
		pointer-events: none;
	}
</style>
