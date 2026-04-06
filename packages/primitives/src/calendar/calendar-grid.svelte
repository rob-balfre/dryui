<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { getCalendarCtx } from './context.svelte.js';
	import {
		getCalendarDays,
		isSameDay,
		isToday,
		isDateInRange,
		formatDate
	} from '../utils/date-utils.js';
	import {
		generateWeekdayLabels,
		splitIntoWeeks,
		getDayISOString,
		handleCalendarKeydown,
		focusCalendarDay
	} from '../internal/calendar-grid-utils.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {}

	let { class: className, ...rest }: Props = $props();

	const ctx = getCalendarCtx();

	let containerEl = $state<HTMLDivElement>();

	const weekdayLabels = $derived(generateWeekdayLabels(ctx.locale, ctx.weekStartDay));

	const calendarDays = $derived(getCalendarDays(ctx.viewYear, ctx.viewMonth, ctx.weekStartDay));

	const monthYearLabel = $derived(
		formatDate(new Date(ctx.viewYear, ctx.viewMonth, 1), ctx.locale, {
			month: 'long',
			year: 'numeric'
		})
	);

	const weeks = $derived(splitIntoWeeks(calendarDays));

	function handleDayClick(day: Date) {
		if (ctx.disabled) return;
		if (!isDateInRange(day, ctx.min, ctx.max)) return;
		ctx.select(day);
	}

	function handleDayKeydown(e: KeyboardEvent, day: Date) {
		if (ctx.disabled) return;
		const result = handleCalendarKeydown(e, day, {
			onSelect: (d) => {
				if (isDateInRange(d, ctx.min, ctx.max)) ctx.select(d);
			},
			setFocusedDate: (d) => ctx.setFocusedDate(d),
			weekStartDay: ctx.weekStartDay,
			min: ctx.min,
			max: ctx.max
		});
		if (result?.type === 'navigate') {
			requestAnimationFrame(() => focusCalendarDay(containerEl, result.newDate));
		}
	}

	function isDayDisabled(day: Date): boolean {
		return !isDateInRange(day, ctx.min, ctx.max);
	}
</script>

<div bind:this={containerEl} class={className} {...rest}>
	<div role="grid" aria-label={monthYearLabel}>
		<div role="row">
			{#each weekdayLabels as label}
				<div role="columnheader" aria-label={label}>
					<span aria-hidden="true">{label}</span>
				</div>
			{/each}
		</div>

		{#each weeks as week}
			<div role="row">
				{#each week as day}
					{@const isCurrent = day.getMonth() === ctx.viewMonth}
					{@const selected = ctx.value ? isSameDay(day, ctx.value) : false}
					{@const today = isToday(day)}
					{@const disabled = isDayDisabled(day)}
					{@const focused = isSameDay(day, ctx.focusedDate)}
					{@const isoStr = getDayISOString(day)}
					<div>
						<button
							role="gridcell"
							type="button"
							tabindex={focused ? 0 : -1}
							aria-label={formatDate(day, ctx.locale, {
								year: 'numeric',
								month: 'long',
								day: 'numeric'
							})}
							aria-selected={selected}
							aria-disabled={disabled}
							data-calendar-day={isoStr}
							data-today={today ? '' : undefined}
							data-selected={selected ? '' : undefined}
							data-outside-month={!isCurrent ? '' : undefined}
							data-disabled={disabled ? '' : undefined}
							onclick={() => handleDayClick(day)}
							onkeydown={(e) => handleDayKeydown(e, day)}
						>
							{day.getDate()}
						</button>
					</div>
				{/each}
			</div>
		{/each}
	</div>
</div>
