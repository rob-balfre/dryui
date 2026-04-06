<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { setRangeCalendarCtx } from './context.svelte.js';
	import { getWeekStartDay, addMonths } from '../utils/date-utils.js';

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
		children,
		...rest
	}: Props = $props();

	const weekStartDay = $derived(getWeekStartDay(locale));

	let viewMonth = $state(startDate ? startDate.getMonth() : new Date().getMonth());
	let viewYear = $state(startDate ? startDate.getFullYear() : new Date().getFullYear());
	let focusedDate = $state<Date>(startDate ?? new Date());
	let hoveredDate = $state<Date | null>(null);

	// Selection state: first click sets start, second click sets end
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
				// First click: set start, clear end
				startDate = date;
				endDate = null;
				selecting = true;
			} else {
				// Second click: set end (ensure start < end)
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

<div {...rest}>
	{@render children()}
</div>
