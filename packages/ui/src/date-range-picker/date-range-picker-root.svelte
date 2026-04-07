<script lang="ts">
	import type { Snippet } from 'svelte';
	import { generateFormId } from '@dryui/primitives';
	import { setDateRangePickerCtx } from './context.svelte.js';
	import { getWeekStartDay, addMonths, isSameDay } from '@dryui/primitives';

	interface Props {
		open?: boolean;
		startDate?: Date | null;
		endDate?: Date | null;
		locale?: string;
		min?: Date | null;
		max?: Date | null;
		disabled?: boolean;
		children: Snippet;
	}

	let {
		open = $bindable(false),
		startDate = $bindable<Date | null>(null),
		endDate = $bindable<Date | null>(null),
		locale = 'en-US',
		min = null,
		max = null,
		disabled = false,
		children
	}: Props = $props();

	const weekStartDay = $derived(getWeekStartDay(locale));

	const triggerId = generateFormId('date-range-picker-trigger');
	const contentId = generateFormId('date-range-picker-content');

	// View state: which month/year is the calendar showing
	let viewMonth = $state(startDate ? startDate.getMonth() : new Date().getMonth());
	let viewYear = $state(startDate ? startDate.getFullYear() : new Date().getFullYear());

	// The day that has keyboard focus within the calendar grid
	let focusedDate = $state<Date>(startDate ?? new Date());

	// Hover date for range preview
	let hoverDate = $state<Date | null>(null);

	// Selection mode: 'start' means next click sets start, 'end' means next click sets end
	let selecting = $state<'start' | 'end'>('start');

	setDateRangePickerCtx({
		get open() {
			return open;
		},
		get startDate() {
			return startDate;
		},
		get endDate() {
			return endDate;
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
		get hoverDate() {
			return hoverDate;
		},
		get selecting() {
			return selecting;
		},
		triggerId,
		contentId,
		triggerEl: null,
		show() {
			if (!disabled) {
				selecting = 'start';
				open = true;
			}
		},
		close() {
			open = false;
			hoverDate = null;
		},
		toggle() {
			if (!disabled) {
				if (!open) {
					selecting = 'start';
				}
				open = !open;
				if (!open) {
					hoverDate = null;
				}
			}
		},
		selectDate(date: Date) {
			if (selecting === 'start') {
				startDate = date;
				endDate = null;
				selecting = 'end';
				focusedDate = date;
			} else {
				// 'end' mode
				if (startDate && date.getTime() < startDate.getTime()) {
					// Swap: clicked date becomes start, previous start becomes end
					endDate = startDate;
					startDate = date;
				} else {
					endDate = date;
				}
				selecting = 'start';
				hoverDate = null;
				open = false;
			}
		},
		setHoverDate(date: Date | null) {
			hoverDate = date;
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
