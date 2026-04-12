<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import Button from '../button/button.svelte';
	import { getCalendarCtx } from './context.svelte.js';
	import {
		getCalendarDays,
		isSameDay,
		isToday,
		isDateInRange,
		formatDate
	} from '@dryui/primitives';
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
			onEscape: () => {},
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

<div bind:this={containerEl} data-calendar-grid class={className} {...rest}>
	<div role="grid" aria-label={monthYearLabel}>
		<div data-calendar-row role="row">
			{#each weekdayLabels as label (label)}
				<div data-calendar-columnheader role="columnheader" aria-label={label}>
					<span aria-hidden="true">{label}</span>
				</div>
			{/each}
		</div>

		{#each weeks as week, wi (wi)}
			<div data-calendar-row role="row">
				{#each week as day (day.getTime())}
					{@const isCurrent = day.getMonth() === ctx.viewMonth}
					{@const selected = ctx.value ? isSameDay(day, ctx.value) : false}
					{@const today = isToday(day)}
					{@const disabled = isDayDisabled(day)}
					{@const focused = isSameDay(day, ctx.focusedDate)}
					{@const isoStr = getDayISOString(day)}
					<div data-calendar-cell>
						<Button
							variant="trigger"
							size="icon-sm"
							type="button"
							role="gridcell"
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
							{disabled}
							onclick={() => handleDayClick(day)}
							onkeydown={(e) => handleDayKeydown(e, day)}
						>
							{day.getDate()}
						</Button>
					</div>
				{/each}
			</div>
		{/each}
	</div>
</div>

<style>
	[data-calendar-grid] {
		--dry-calendar-grid-gap: 1px;
		display: grid;
		gap: var(--dry-space-2);
	}

	[role='grid'] {
		display: grid;
		gap: var(--dry-calendar-grid-gap);
	}

	[data-calendar-row] {
		display: grid;
		grid-template-columns: repeat(7, minmax(0, 1fr));
		gap: var(--dry-calendar-grid-gap);
	}

	[data-calendar-columnheader] {
		display: grid;
		place-items: center;
		min-height: var(--dry-space-8);
		font-size: var(--dry-type-tiny-size);
		color: var(--dry-calendar-muted-color, var(--dry-color-text-weak));
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}

	[data-calendar-cell] {
		display: grid;
		place-items: center;
	}
</style>
