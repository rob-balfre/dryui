<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { DatePicker } from '../date-picker/index.js';
	import { TimeInput } from '../time-input/index.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		value?: Date;
		min?: Date;
		max?: Date;
		disabled?: boolean;
		locale?: string;
		name?: string;
		size?: 'sm' | 'md' | 'lg';
	}

	let {
		value = $bindable(new Date()),
		min,
		max,
		disabled = false,
		locale = 'en-US',
		name,
		size = 'md',
		class: className,
		...rest
	}: Props = $props();

	function toTimeString(d: Date): string {
		return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
	}

	let dateValue = $state<Date | null>(value);
	let timeValue = $state(toTimeString(value));

	let updating = false;

	$effect(() => {
		if (updating) return;
		const v = value;
		if (v) {
			dateValue = new Date(v.getFullYear(), v.getMonth(), v.getDate());
			timeValue = toTimeString(v);
		}
	});

	$effect(() => {
		if (!dateValue) return;
		const [hStr, mStr] = timeValue.split(':');
		const hours = parseInt(hStr ?? '0', 10);
		const minutes = parseInt(mStr ?? '0', 10);

		const combined = new Date(
			dateValue.getFullYear(),
			dateValue.getMonth(),
			dateValue.getDate(),
			hours,
			minutes,
			0,
			0
		);

		if (min && combined < min) return;
		if (max && combined > max) return;

		if (combined.getTime() !== value.getTime()) {
			updating = true;
			value = combined;
			updating = false;
		}
	});

	const isoString = $derived(value ? value.toISOString() : '');
</script>

<div data-date-time-input class={className} {...rest}>
	<div data-part="date-section">
		<DatePicker.Root bind:value={dateValue} {locale} {disabled} min={min ?? null} max={max ?? null}>
			<DatePicker.Trigger {size} />
			<DatePicker.Content>
				<DatePicker.Calendar />
			</DatePicker.Content>
		</DatePicker.Root>
	</div>

	<div data-part="time-section">
		<TimeInput bind:value={timeValue} {disabled} {size} />
	</div>

	{#if name}
		<input type="hidden" {name} value={isoString} {disabled} />
	{/if}
</div>

<style>
	[data-date-time-input] {
		--dry-dti-gap: var(--dry-space-2, 0.5rem);

		display: inline-grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		align-items: center;
		gap: var(--dry-dti-gap);
	}
</style>
