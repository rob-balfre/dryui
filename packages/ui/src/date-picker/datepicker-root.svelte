<script lang="ts">
	import type { Snippet } from 'svelte';
	import { generateFormId } from '@dryui/primitives';
	import { setDatePickerCtx } from './context.svelte.js';
	import { getWeekStartDay, addMonths } from '@dryui/primitives';

	interface Props {
		open?: boolean;
		value?: Date | null;
		name?: string;
		locale?: string;
		min?: Date | null;
		max?: Date | null;
		disabled?: boolean;
		children: Snippet;
	}

	let {
		open = $bindable(false),
		value = $bindable<Date | null>(null),
		name,
		locale = 'en-US',
		min = null,
		max = null,
		disabled = false,
		children
	}: Props = $props();

	const weekStartDay = $derived(getWeekStartDay(locale));

	const triggerId = generateFormId('datepicker-trigger');
	const contentId = generateFormId('datepicker-content');

	// View state: which month/year is the calendar showing
	let viewMonth = $state(value ? value.getMonth() : new Date().getMonth());
	let viewYear = $state(value ? value.getFullYear() : new Date().getFullYear());

	// The day that has keyboard focus within the calendar grid
	let focusedDate = $state<Date>(value ?? new Date());

	function serializeDateValue(date: Date | null): string {
		if (!date) return '';

		const year = String(date.getFullYear());
		const monthValue = String(date.getMonth() + 1).padStart(2, '0');
		const dayValue = String(date.getDate()).padStart(2, '0');

		return `${year}-${monthValue}-${dayValue}`;
	}

	setDatePickerCtx({
		get open() {
			return open;
		},
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
		triggerId,
		contentId,
		triggerEl: null,
		show() {
			if (!disabled) open = true;
		},
		close() {
			open = false;
		},
		toggle() {
			if (!disabled) open = !open;
		},
		select(date: Date) {
			value = date;
			focusedDate = date;
			viewMonth = date.getMonth();
			viewYear = date.getFullYear();
			open = false;
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

{@render children()}

{#if name}
	<input type="hidden" {name} value={serializeDateValue(value)} disabled={disabled || undefined} />
{/if}
