<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { setDateFieldCtx, getLocaleFormat, type DateSegmentType } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		value?: Date | null;
		name?: string;
		locale?: string;
		min?: Date | null;
		max?: Date | null;
		disabled?: boolean;
		children: Snippet;
	}

	let {
		value = $bindable<Date | null>(null),
		name,
		locale = 'en-US',
		min = null,
		max = null,
		disabled = false,
		children,
		...rest
	}: Props = $props();

	let month = $state<number | null>(value ? value.getMonth() + 1 : null);
	let day = $state<number | null>(value ? value.getDate() : null);
	let year = $state<number | null>(value ? value.getFullYear() : null);

	// Sync from value prop
	$effect(() => {
		if (value) {
			month = value.getMonth() + 1;
			day = value.getDate();
			year = value.getFullYear();
		}
	});

	function tryBuildDate() {
		if (month !== null && day !== null && year !== null && year >= 1000) {
			const d = new Date(year, month - 1, day);
			if (d.getMonth() === month - 1 && d.getDate() === day) {
				value = d;
			}
		}
	}

	const localeFormat = $derived(getLocaleFormat(locale));

	const segments = $derived(
		localeFormat.order.map((type) => ({
			type,
			value: type === 'month' ? month : type === 'day' ? day : year
		}))
	);

	function serializeDateValue(date: Date | null): string {
		if (!date) return '';

		const year = String(date.getFullYear());
		const monthValue = String(date.getMonth() + 1).padStart(2, '0');
		const dayValue = String(date.getDate()).padStart(2, '0');

		return `${year}-${monthValue}-${dayValue}`;
	}

	// Segment element registry for index-based navigation
	const segmentElements = new Map<DateSegmentType, HTMLElement>();

	setDateFieldCtx({
		get value() {
			return value;
		},
		get locale() {
			return locale;
		},
		get min() {
			return min;
		},
		get max() {
			return max;
		},
		get disabled() {
			return disabled;
		},
		get segmentOrder() {
			return localeFormat.order;
		},
		get separator() {
			return localeFormat.separator;
		},
		get segments() {
			return segments;
		},
		updateSegment(type: DateSegmentType, val: number) {
			if (type === 'month') month = val;
			else if (type === 'day') day = val;
			else if (type === 'year') year = val;
			tryBuildDate();
		},
		registerSegment(type: DateSegmentType, el: HTMLElement) {
			segmentElements.set(type, el);
		},
		unregisterSegment(type: DateSegmentType) {
			segmentElements.delete(type);
		},
		focusSegment(type: DateSegmentType, direction: 'next' | 'prev') {
			const order = localeFormat.order;
			const idx = order.indexOf(type);
			const targetIdx = direction === 'next' ? idx + 1 : idx - 1;
			if (targetIdx >= 0 && targetIdx < order.length) {
				const targetType = order[targetIdx]!;
				const el = segmentElements.get(targetType);
				el?.focus();
			}
		}
	});
</script>

<div role="group" aria-label="Date" data-disabled={disabled || undefined} {...rest}>
	{@render children()}

	{#if name}
		<input
			type="hidden"
			{name}
			value={serializeDateValue(value)}
			disabled={disabled || undefined}
		/>
	{/if}
</div>
