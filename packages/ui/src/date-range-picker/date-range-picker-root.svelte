<script lang="ts">
	import type { Snippet } from 'svelte';
	import {
		createDateViewController,
		createPickerPopoverController
	} from '../internal/date-family-controller.svelte.js';
	import { setDateRangePickerCtx } from './context.svelte.js';

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

	const view = createDateViewController({
		initialDate: startDate,
		locale: () => locale
	});

	// Hover date for range preview
	let hoverDate = $state<Date | null>(null);

	// Selection mode: 'start' means next click sets start, 'end' means next click sets end
	let selecting = $state<'start' | 'end'>('start');

	const popover = createPickerPopoverController({
		triggerIdPrefix: 'date-range-picker-trigger',
		contentIdPrefix: 'date-range-picker-content',
		uid,
		open: () => open,
		setOpen: (nextOpen) => {
			open = nextOpen;
		},
		disabled: () => disabled,
		onShow: () => {
			selecting = 'start';
		},
		onClose: () => {
			hoverDate = null;
		}
	});

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
		get triggerId() {
			return popover.triggerId;
		},
		get contentId() {
			return popover.contentId;
		},
		get triggerEl() {
			return popover.triggerEl;
		},
		set triggerEl(element: HTMLElement | null) {
			popover.setTriggerEl(element);
		},
		show() {
			popover.show();
		},
		close() {
			popover.close();
		},
		toggle() {
			popover.toggle();
		},
		selectDate(date: Date) {
			if (selecting === 'start') {
				startDate = date;
				endDate = null;
				selecting = 'end';
				view.focusDate(date);
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
				popover.close();
			}
		},
		setHoverDate(date: Date | null) {
			hoverDate = date;
		},
		nextMonth() {
			view.nextMonth();
		},
		prevMonth() {
			view.prevMonth();
		},
		setFocusedDate(date: Date) {
			view.setFocusedDate(date);
		}
	});
</script>

{@render children()}
