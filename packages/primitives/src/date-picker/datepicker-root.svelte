<script lang="ts">
	import type { Snippet } from 'svelte';
	import { generateFormId } from '../utils/form-control.svelte.js';
	import { setDatePickerCtx } from './context.svelte.js';
	import { createDateViewState } from '../internal/date-view-state.svelte.js';

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

	const triggerId = generateFormId('datepicker-trigger');
	const contentId = generateFormId('datepicker-content');
	let triggerEl = $state<HTMLElement | null>(null);
	const view = createDateViewState({
		getLocale: () => locale,
		getInitialDate: () => value
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
		triggerId,
		contentId,
		get triggerEl() {
			return triggerEl;
		},
		set triggerEl(element: HTMLElement | null) {
			triggerEl = element;
		},
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
			view.setFocusedDate(date);
			open = false;
		},
		goToMonth: view.goToMonth,
		goToYear: view.goToYear,
		nextMonth: view.nextMonth,
		prevMonth: view.prevMonth,
		setFocusedDate: view.setFocusedDate
	});
</script>

{@render children()}

{#if name}
	<input type="hidden" {name} value={serializeDateValue(value)} disabled={disabled || undefined} />
{/if}
