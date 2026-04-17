<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { isSameDay } from '@dryui/primitives';
	import { getCalendarCtx } from './context.svelte.js';
	import CalendarGridButton, {
		type CalendarGridAdapter
	} from '../internal/calendar-grid-button.svelte';

	interface Props extends HTMLAttributes<HTMLDivElement> {}

	let props: Props = $props();

	const ctx = getCalendarCtx();

	const adapter: CalendarGridAdapter = {
		get viewYear() {
			return ctx.viewYear;
		},
		get viewMonth() {
			return ctx.viewMonth;
		},
		get locale() {
			return ctx.locale;
		},
		get weekStartDay() {
			return ctx.weekStartDay;
		},
		get focusedDate() {
			return ctx.focusedDate;
		},
		get min() {
			return ctx.min;
		},
		get max() {
			return ctx.max;
		},
		get disabled() {
			return ctx.disabled;
		},
		isSelected: (day) => (ctx.value ? isSameDay(day, ctx.value) : false),
		isInRange: () => false,
		isRangeStart: () => false,
		isRangeEnd: () => false,
		selectDate: (day) => ctx.select(day),
		setFocusedDate: (day) => ctx.setFocusedDate(day),
		prevMonth: () => ctx.prevMonth(),
		nextMonth: () => ctx.nextMonth()
	};
</script>

<CalendarGridButton {adapter} hideHeader {...props} />
