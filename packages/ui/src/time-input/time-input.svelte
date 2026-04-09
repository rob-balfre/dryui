<script lang="ts">
	import { getFormControlCtx } from '@dryui/primitives';
	import { Select } from '../select/index.js';

	type TimeParts = {
		hour: string;
		minute: string;
	};

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
	const hasError = $derived(ctx?.hasError || false);
	const describedBy = $derived(ctx?.describedBy);
	const errorMessageId = $derived(ctx?.hasError ? ctx?.errorMessageId : undefined);

	function parseTime(nextValue: string): TimeParts {
		const [hour = '', minute = ''] = nextValue.split(':');
		return { hour, minute };
	}

	let draftHour = $state('');
	let draftMinute = $state('');

	const parsedValue = $derived.by(() => parseTime(value));
	const hourStr = $derived(value ? parsedValue.hour : draftHour);
	const minuteStr = $derived(value ? parsedValue.minute : draftMinute);

	function setTime(nextHour: string, nextMinute: string) {
		draftHour = nextHour;
		draftMinute = nextMinute;

		if (nextHour && nextMinute) {
			value = `${nextHour}:${nextMinute}`;
			draftHour = '';
			draftMinute = '';
			return;
		}

		value = '';
	}

	function setHour(nextHour: string) {
		setTime(nextHour, minuteStr);
	}

	function setMinute(nextMinute: string) {
		setTime(hourStr, nextMinute);
	}

	const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));

	const minutes = $derived.by(() => {
		const stepMinutes = step && step >= 60 ? Math.floor(step / 60) : 1;
		const count = Math.floor(60 / stepMinutes);
		return Array.from({ length: count }, (_, i) => String(i * stepMinutes).padStart(2, '0'));
	});
</script>

<div
	role="group"
	aria-label="Time"
	data-time-input-wrapper
	data-disabled={isDisabled || undefined}
	id={ctx?.id}
	class={className}
>
	<Select.Root bind:value={() => hourStr, setHour} disabled={isDisabled}>
		<Select.Trigger
			{size}
			aria-label="Hour"
			aria-describedby={describedBy}
			aria-invalid={hasError || undefined}
			aria-errormessage={errorMessageId}
		>
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

	<Select.Root bind:value={() => minuteStr, setMinute} disabled={isDisabled}>
		<Select.Trigger
			{size}
			aria-label="Minute"
			aria-describedby={describedBy}
			aria-invalid={hasError || undefined}
			aria-errormessage={errorMessageId}
		>
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
