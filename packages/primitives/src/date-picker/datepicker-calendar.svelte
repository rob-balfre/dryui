<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { getDatePickerCtx } from './context.svelte.js';
	import { getCalendarDays, isSameDay, isToday, isDateInRange, formatDate } from './date-utils.js';
	import {
		generateWeekdayLabels,
		splitIntoWeeks,
		getDayISOString,
		handleCalendarKeydown,
		focusCalendarDay
	} from '../internal/calendar-grid-utils.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {}

	let { class: className, ...rest }: Props = $props();

	const ctx = getDatePickerCtx();

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
		if (!isDateInRange(day, ctx.min, ctx.max)) return;
		ctx.select(day);
		ctx.triggerEl?.focus();
	}

	function handleDayKeydown(e: KeyboardEvent, day: Date) {
		const result = handleCalendarKeydown(e, day, {
			onSelect: (d) => {
				if (isDateInRange(d, ctx.min, ctx.max)) {
					ctx.select(d);
					ctx.triggerEl?.focus();
				}
			},
			onEscape: () => {
				ctx.close();
				ctx.triggerEl?.focus();
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
	<!-- Calendar header: month/year + navigation -->
	<div role="group" aria-label={monthYearLabel}>
		<div class="dp-header">
			<button type="button" aria-label="Previous month" onclick={() => ctx.prevMonth()}> ‹ </button>
			<span aria-live="polite" aria-atomic="true">
				{monthYearLabel}
			</span>
			<button type="button" aria-label="Next month" onclick={() => ctx.nextMonth()}> › </button>
		</div>

		<!-- Day-of-week header row -->
		<div role="grid" aria-label={monthYearLabel}>
			<div role="row">
				{#each weekdayLabels as label}
					<div role="columnheader" aria-label={label}>
						<span aria-hidden="true">{label}</span>
					</div>
				{/each}
			</div>

			<!-- Calendar day grid -->
			{#each weeks as week}
				<div role="row">
					{#each week as day}
						{@const isCurrent = day.getMonth() === ctx.viewMonth}
						{@const selected = ctx.value ? isSameDay(day, ctx.value) : false}
						{@const today = isToday(day)}
						{@const disabled = isDayDisabled(day)}
						{@const focused = isSameDay(day, ctx.focusedDate)}
						{@const isoStr = getDayISOString(day)}
						<div role="gridcell">
							<button
								type="button"
								tabindex={focused ? 0 : -1}
								aria-label={formatDate(day, ctx.locale, {
									year: 'numeric',
									month: 'long',
									day: 'numeric'
								})}
								aria-pressed={selected}
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
</div>
