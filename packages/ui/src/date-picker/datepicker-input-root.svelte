<script lang="ts">
	import type { Snippet } from 'svelte';
	import {
		createDateViewController,
		createPickerPopoverController
	} from '../internal/date-family-controller.svelte.js';
	import { setDatePickerCtx } from './context.svelte.js';

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

	const view = createDateViewController({
		initialDate: value,
		locale: () => locale
	});

	const popover = createPickerPopoverController({
		triggerIdPrefix: 'datepicker-trigger',
		contentIdPrefix: 'datepicker-content',
		open: () => open,
		setOpen: (nextOpen) => {
			open = nextOpen;
		},
		disabled: () => disabled
	});

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
		select(date: Date) {
			value = date;
			view.setFocusedDate(date);
			popover.close();
		},
		goToMonth(month: number) {
			view.goToMonth(month);
		},
		goToYear(year: number) {
			view.goToYear(year);
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

{#if name}
	<input type="hidden" {name} value={serializeDateValue(value)} disabled={disabled || undefined} />
{/if}
