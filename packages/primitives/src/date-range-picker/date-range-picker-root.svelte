<script lang="ts">
	import type { Snippet } from 'svelte';
	import { setDateRangePickerCtx } from './context.svelte.js';
	import { createDateViewState } from '../internal/date-view-state.svelte.js';

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

	const uid = $props.id();
	const triggerId = `date-range-picker-trigger-${uid}`;
	const contentId = `date-range-picker-content-${uid}`;
	let triggerEl = $state<HTMLElement | null>(null);
	const view = createDateViewState({
		getLocale: () => locale,
		getInitialDate: () => startDate
	});

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
			return view.focusedDate;
		},
		get viewMonth() {
			return view.viewMonth;
		},
		get viewYear() {
			return view.viewYear;
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
			return view.weekStartDay;
		},
		get hoverDate() {
			return hoverDate;
		},
		get selecting() {
			return selecting;
		},
		triggerId,
		contentId,
		get triggerEl() {
			return triggerEl;
		},
		set triggerEl(element: HTMLElement | null) {
			triggerEl = element;
		},
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
				view.setFocusedDate(date);
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
		nextMonth: view.nextMonth,
		prevMonth: view.prevMonth,
		setFocusedDate: view.setFocusedDate
	});
</script>

{@render children()}
