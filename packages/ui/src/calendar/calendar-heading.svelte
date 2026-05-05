<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { formatDate } from '@dryui/primitives';
	import { getCalendarCtx } from './context.svelte.js';
	import { formatVisibleMonthRangeLabel } from '../internal/calendar-grid-utils.js';
	import { getWeekDays } from './week-utils.js';

	interface Props extends HTMLAttributes<HTMLSpanElement> {}

	let { class: className, ...rest }: Props = $props();

	const ctx = getCalendarCtx();

	const label = $derived.by(() => {
		if (ctx.view === 'week') {
			const days = getWeekDays(ctx.focusedDate, ctx.weekStartDay);
			const start = days[0]!;
			const end = days[6]!;
			const sameMonth = start.getMonth() === end.getMonth();
			const monthStr = formatDate(start, ctx.locale, { month: 'long' });
			if (sameMonth) {
				return `${monthStr} ${start.getDate()}–${end.getDate()}`;
			}
			const endMonthStr = formatDate(end, ctx.locale, { month: 'short' });
			return `${monthStr} ${start.getDate()} - ${endMonthStr} ${end.getDate()}`;
		}
		return formatVisibleMonthRangeLabel(ctx.viewYear, ctx.viewMonth, ctx.locale, ctx.visibleMonths);
	});
</script>

<span data-calendar-heading aria-live="polite" aria-atomic="true" class={className} {...rest}>
	{label}
</span>

<style>
	[data-calendar-heading] {
		font-size: var(--dry-type-small-size, var(--dry-type-small-size));
		font-weight: 600;
		letter-spacing: 0;
		text-align: center;
	}
</style>
