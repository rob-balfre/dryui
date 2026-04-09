<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getWeekStartDay, addMonths } from '@dryui/primitives';
	import { setRangeCalendarCtx } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		startDate?: Date | null;
		endDate?: Date | null;
		locale?: string;
		min?: Date | null;
		max?: Date | null;
		disabled?: boolean;
		children: Snippet;
	}

	let {
		startDate = $bindable<Date | null>(null),
		endDate = $bindable<Date | null>(null),
		locale = 'en-US',
		min = null,
		max = null,
		disabled = false,
		class: className,
		children,
		...rest
	}: Props = $props();

	const weekStartDay = $derived(getWeekStartDay(locale));

	let viewMonth = $state(startDate ? startDate.getMonth() : new Date().getMonth());
	let viewYear = $state(startDate ? startDate.getFullYear() : new Date().getFullYear());
	let focusedDate = $state<Date>(startDate ?? new Date());
	let hoveredDate = $state<Date | null>(null);

	let selecting = $state(false);

	setRangeCalendarCtx({
		get startDate() {
			return startDate;
		},
		get endDate() {
			return endDate;
		},
		get hoveredDate() {
			return hoveredDate;
		},
		get focusedDate() {
			return focusedDate;
		},
		get viewMonth() {
			return viewMonth;
		},
		get viewYear() {
			return viewYear;
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
		get weekStartDay() {
			return weekStartDay;
		},
		selectDate(date: Date) {
			if (!selecting) {
				startDate = date;
				endDate = null;
				selecting = true;
			} else {
				if (date < startDate!) {
					endDate = startDate;
					startDate = date;
				} else {
					endDate = date;
				}
				selecting = false;
			}
			focusedDate = date;
		},
		setHoveredDate(date: Date | null) {
			hoveredDate = date;
		},
		nextMonth() {
			const next = addMonths(new Date(viewYear, viewMonth, 1), 1);
			viewMonth = next.getMonth();
			viewYear = next.getFullYear();
		},
		prevMonth() {
			const prev = addMonths(new Date(viewYear, viewMonth, 1), -1);
			viewMonth = prev.getMonth();
			viewYear = prev.getFullYear();
		},
		setFocusedDate(date: Date) {
			focusedDate = date;
			viewMonth = date.getMonth();
			viewYear = date.getFullYear();
		}
	});
</script>

<div data-range-calendar-root class={className} {...rest}>
	{@render children()}
</div>

<style>
	[data-range-calendar-root] {
		--dry-range-calendar-bg: var(--dry-color-bg-base);
		--dry-range-calendar-border: var(--dry-color-stroke-weak);
		--dry-range-calendar-panel-bg: var(--dry-color-bg-overlay);
		--dry-range-calendar-panel-border: color-mix(
			in srgb,
			var(--dry-color-stroke-strong) 18%,
			transparent
		);
		--dry-range-calendar-heading-color: var(--dry-color-text-strong);
		--dry-range-calendar-nav-bg: var(--dry-color-bg-raised);
		--dry-range-calendar-nav-border: var(--dry-color-stroke-weak);
		--dry-range-calendar-nav-color: var(--dry-color-text-weak);
		--dry-range-calendar-radius: var(--dry-radius-xl);
		--dry-range-calendar-shadow: var(--dry-shadow-raised, var(--dry-shadow-sm));
		--dry-range-calendar-padding: var(--dry-space-3);
		--dry-range-calendar-day-size: 2.5rem;
		--dry-range-calendar-day-radius: var(--dry-radius-md);
		--dry-range-calendar-day-hover-bg: var(--dry-color-fill-hover);
		--dry-range-calendar-selected-bg: var(--dry-color-fill-brand);
		--dry-range-calendar-selected-color: var(--dry-color-on-brand);
		--dry-range-calendar-selected-hover-bg: var(--dry-color-fill-brand-hover);
		--dry-range-calendar-range-bg: color-mix(in srgb, var(--dry-color-fill-brand) 14%, transparent);
		--dry-range-calendar-today-color: var(--dry-color-text-brand);
		--dry-range-calendar-outside-color: var(--dry-color-text-weak);

		display: inline-grid;
		box-sizing: border-box;
		justify-items: start;
		gap: var(--dry-space-3);
		padding: var(--dry-range-calendar-padding);
		background: var(--dry-range-calendar-bg);
		border: 1px solid var(--dry-range-calendar-border);
		border-radius: var(--dry-range-calendar-radius);
		box-shadow: var(--dry-range-calendar-shadow);
		color: var(--dry-color-text-strong);
		font-family: var(--dry-font-sans);
	}
</style>
