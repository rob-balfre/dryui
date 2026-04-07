<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { SvelteMap } from 'svelte/reactivity';
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

	interface SegmentValues {
		month: number | null;
		day: number | null;
		year: number | null;
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

	let draftValues = $state<SegmentValues | null>(null);

	function getSegmentValues(date: Date | null): SegmentValues {
		if (!date) {
			return { month: null, day: null, year: null };
		}

		return {
			month: date.getMonth() + 1,
			day: date.getDate(),
			year: date.getFullYear()
		};
	}

	function commitSegments(nextValues: SegmentValues) {
		if (
			nextValues.month !== null &&
			nextValues.day !== null &&
			nextValues.year !== null &&
			nextValues.year >= 1000
		) {
			const d = new Date(nextValues.year, nextValues.month - 1, nextValues.day);
			if (d.getMonth() === nextValues.month - 1 && d.getDate() === nextValues.day) {
				value = d;
				draftValues = null;
				return;
			}
		}

		draftValues = nextValues;
	}

	const localeFormat = $derived(getLocaleFormat(locale));
	const committedValues = $derived(getSegmentValues(value));
	const activeValues = $derived(draftValues ?? committedValues);

	const segments = $derived(
		localeFormat.order.map((type) => ({
			type,
			value:
				type === 'month'
					? activeValues.month
					: type === 'day'
						? activeValues.day
						: activeValues.year
		}))
	);

	function focusPreferredSegment() {
		const targetType =
			segments.find((segment) => segment.value === null)?.type ?? localeFormat.order[0];
		if (!targetType) return;
		segmentElements.get(targetType)?.focus();
	}

	function serializeDateValue(date: Date | null): string {
		if (!date) return '';

		const year = String(date.getFullYear());
		const monthValue = String(date.getMonth() + 1).padStart(2, '0');
		const dayValue = String(date.getDate()).padStart(2, '0');

		return `${year}-${monthValue}-${dayValue}`;
	}

	// Segment element registry for index-based navigation
	const segmentElements = new SvelteMap<DateSegmentType, HTMLElement>();

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
			commitSegments({
				month: type === 'month' ? val : activeValues.month,
				day: type === 'day' ? val : activeValues.day,
				year: type === 'year' ? val : activeValues.year
			});
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

	function handleMousedown(event: MouseEvent) {
		if (disabled) return;
		const target = event.target;
		if (!(target instanceof HTMLElement)) return;
		if (target.closest('[data-df-segment]')) return;

		event.preventDefault();
		focusPreferredSegment();
	}
</script>

<div
	role="group"
	aria-label="Date"
	data-df-wrapper
	data-df-root
	data-disabled={disabled || undefined}
	onmousedown={handleMousedown}
	{...rest}
>
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
