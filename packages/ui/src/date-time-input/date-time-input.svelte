<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { DateField } from '../date-field/index.js';
	import { TimeInput } from '../time-input/index.js';

	type DateSegmentType = 'month' | 'day' | 'year';

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

	function getSegmentOrder(loc: string): DateSegmentType[] {
		const formatter = new Intl.DateTimeFormat(loc, {
			year: 'numeric',
			month: '2-digit',
			day: '2-digit'
		});
		const parts = formatter.formatToParts(new Date(2000, 0, 1));
		const order: DateSegmentType[] = [];
		for (const part of parts) {
			if (part.type === 'month') order.push('month');
			else if (part.type === 'day') order.push('day');
			else if (part.type === 'year') order.push('year');
		}
		return order.length === 3 ? order : ['month', 'day', 'year'];
	}

	const segmentOrder = $derived(getSegmentOrder(locale));

	let dateValue = $state<Date | null>(value);
	let timeValue = $state(
		String(value.getHours()).padStart(2, '0') + ':' + String(value.getMinutes()).padStart(2, '0')
	);

	let updating = false;

	$effect(() => {
		if (updating) return;
		const v = value;
		if (v) {
			dateValue = new Date(v.getFullYear(), v.getMonth(), v.getDate());
			timeValue =
				String(v.getHours()).padStart(2, '0') + ':' + String(v.getMinutes()).padStart(2, '0');
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
		<DateField.Root bind:value={dateValue} {locale} {disabled} {size}>
			{#each segmentOrder as segmentType, i}
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
