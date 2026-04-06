<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { setCalendarCtx } from './context.svelte.js';
	import { getWeekStartDay, addMonths } from '../utils/date-utils.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		value?: Date | null;
		locale?: string;
		min?: Date | null;
		max?: Date | null;
		disabled?: boolean;
		children: Snippet;
	}

	let {
		value = $bindable<Date | null>(null),
		locale = 'en-US',
		min = null,
		max = null,
		disabled = false,
		class: className,
		children,
		...rest
	}: Props = $props();

	const weekStartDay = $derived(getWeekStartDay(locale));

	// View state: which month/year is the calendar showing
	let viewMonth = $state(value ? value.getMonth() : new Date().getMonth());
	let viewYear = $state(value ? value.getFullYear() : new Date().getFullYear());

	// The day that has keyboard focus within the calendar grid
	let focusedDate = $state<Date>(value ?? new Date());

	setCalendarCtx({
		get value() {
			return value;
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
		get multiple() {
			return false;
		},
		get selectedDates() {
			return value ? [value] : [];
		},
		select(date: Date) {
			value = date;
			focusedDate = date;
			viewMonth = date.getMonth();
			viewYear = date.getFullYear();
		},
		goToMonth(month: number) {
			if (month < 0) {
				viewMonth = 11;
				viewYear = viewYear - 1;
			} else if (month > 11) {
				viewMonth = 0;
				viewYear = viewYear + 1;
			} else {
				viewMonth = month;
			}
		},
		goToYear(year: number) {
			viewYear = year;
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

<div
	data-disabled={disabled || undefined}
	class={className}
	role="group"
	aria-label="Calendar"
	{...rest}
>
	{@render children()}
</div>
