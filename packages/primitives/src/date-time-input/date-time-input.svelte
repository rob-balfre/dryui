<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { DateField } from '../date-field/index.js';
	import { getLocaleFormat } from '../date-field/context.svelte.js';
	import { TimeInput } from '../time-input/index.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		value?: Date;
		min?: Date;
		max?: Date;
		disabled?: boolean;
		locale?: string;
		name?: string;
	}

	let {
		value = $bindable(new Date()),
		min,
		max,
		disabled = false,
		locale = 'en-US',
		name,
		...rest
	}: Props = $props();

	// Split the Date into its date-only and time (HH:MM) portions
	let dateValue = $state<Date | null>(value);
	let timeValue = $state(
		String(value.getHours()).padStart(2, '0') + ':' + String(value.getMinutes()).padStart(2, '0')
	);

	// Locale-driven segment ordering
	const localeFormat = $derived(getLocaleFormat(locale));

	// Track whether we're currently updating internally to avoid loops
	let updating = false;

	// Sync from external value prop into internal state
	$effect(() => {
		if (updating) return;
		const v = value;
		if (v) {
			dateValue = new Date(v.getFullYear(), v.getMonth(), v.getDate());
			timeValue =
				String(v.getHours()).padStart(2, '0') + ':' + String(v.getMinutes()).padStart(2, '0');
		}
	});

	// Combine date and time into a single Date whenever either changes
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

		// Clamp to min/max bounds
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

<div data-part="date-time-input" {...rest}>
	<div data-part="date-section">
		<DateField.Root bind:value={dateValue} {locale} {disabled}>
			{#each localeFormat.order as segmentType, i}
				{#if i > 0}
					<DateField.Separator />
				{/if}
				<DateField.Segment type={segmentType} />
			{/each}
		</DateField.Root>
	</div>

	<div data-part="time-section">
		<TimeInput bind:value={timeValue} {disabled} />
	</div>

	{#if name}
		<input type="hidden" {name} value={isoString} {disabled} />
	{/if}
</div>
