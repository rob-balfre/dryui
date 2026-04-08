<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { getDateRangePickerCtx } from './context.svelte.js';
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

	const ctx = getDateRangePickerCtx();

	let containerEl = $state<HTMLDivElement>();

	function bindContainer(node: HTMLDivElement) {
		containerEl = node;

		return () => {
			if (containerEl === node) {
				containerEl = undefined;
			}
		};
	}

	const weekdayLabels = $derived(generateWeekdayLabels(ctx.locale, ctx.weekStartDay));

	const calendarDays = $derived(getCalendarDays(ctx.viewYear, ctx.viewMonth, ctx.weekStartDay));

	const monthYearLabel = $derived(
		formatDate(new Date(ctx.viewYear, ctx.viewMonth, 1), ctx.locale, {
			month: 'long',
			year: 'numeric'
		})
	);

	const weeks = $derived(splitIntoWeeks(calendarDays));

	function isInSelectedRange(day: Date): boolean {
		const start = ctx.startDate;
		const end = ctx.endDate;
		if (!start || !end) return false;
		const time = day.getTime();
		return time > start.getTime() && time < end.getTime();
	}

	function isInPreviewRange(day: Date): boolean {
		if (ctx.selecting !== 'end' || !ctx.startDate || !ctx.hoverDate) return false;
		const time = day.getTime();
		const startTime = ctx.startDate.getTime();
		const hoverTime = ctx.hoverDate.getTime();
		if (hoverTime >= startTime) {
			return time >= startTime && time <= hoverTime;
		} else {
			return time >= hoverTime && time <= startTime;
		}
	}

	function isRangeStart(day: Date): boolean {
		if (!ctx.startDate) return false;
		if (ctx.endDate) {
			return isSameDay(day, ctx.startDate);
		}
		if (ctx.selecting === 'end' && ctx.hoverDate) {
			if (ctx.hoverDate.getTime() < ctx.startDate.getTime()) {
				return isSameDay(day, ctx.hoverDate);
			}
		}
		return isSameDay(day, ctx.startDate);
	}

	function isRangeEnd(day: Date): boolean {
		if (ctx.endDate) {
			return isSameDay(day, ctx.endDate);
		}
		if (ctx.selecting === 'end' && ctx.startDate && ctx.hoverDate) {
			if (ctx.hoverDate.getTime() < ctx.startDate.getTime()) {
				return isSameDay(day, ctx.startDate);
			}
			return isSameDay(day, ctx.hoverDate);
		}
		return false;
	}

	function isSelected(day: Date): boolean {
		return isRangeStart(day) || isRangeEnd(day);
	}

	function handleDayClick(day: Date) {
		if (!isDateInRange(day, ctx.min, ctx.max)) return;
		ctx.selectDate(day);
	}

	function handleDayKeydown(e: KeyboardEvent, day: Date) {
		const result = handleCalendarKeydown(e, day, {
			onSelect: (d) => {
				if (isDateInRange(d, ctx.min, ctx.max)) ctx.selectDate(d);
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

<div {@attach bindContainer} class={className} {...rest} data-drp-calendar>
	<!-- Calendar header: month/year + navigation -->
	<div role="group" aria-label={monthYearLabel} data-calendar-panel>
		<div data-calendar-header>
			<button
				type="button"
				aria-label="Previous month"
				data-calendar-nav
				disabled={ctx.disabled}
				onclick={() => ctx.prevMonth()}
			>
				&#8249;
			</button>
			<span aria-live="polite" aria-atomic="true" data-calendar-heading>
				{monthYearLabel}
			</span>
			<button
				type="button"
				aria-label="Next month"
				data-calendar-nav
				disabled={ctx.disabled}
				onclick={() => ctx.nextMonth()}
			>
				&#8250;
			</button>
		</div>

		<!-- Day-of-week header row -->
		<div role="grid" aria-label={monthYearLabel}>
			<div role="row" data-calendar-row>
				{#each weekdayLabels as label (label)}
					<div role="columnheader" aria-label={label} data-calendar-columnheader>
						<span aria-hidden="true">{label}</span>
					</div>
				{/each}
			</div>

			<!-- Calendar day grid -->
			{#each weeks as week, weekIndex (weekIndex)}
				<div role="row" data-calendar-row>
					{#each week as day (getDayISOString(day))}
						{@const isCurrent = day.getMonth() === ctx.viewMonth}
						{@const selected = isSelected(day)}
						{@const today = isToday(day)}
						{@const disabled = isDayDisabled(day)}
						{@const focused = isSameDay(day, ctx.focusedDate)}
						{@const isoStr = getDayISOString(day)}
						{@const inRange = isInSelectedRange(day) || isInPreviewRange(day)}
						{@const rangeStart = isRangeStart(day)}
						{@const rangeEnd = isRangeEnd(day)}
						<div
							role="gridcell"
							data-calendar-cell
							data-in-range={inRange ? '' : undefined}
							data-range-start={rangeStart ? '' : undefined}
							data-range-end={rangeEnd ? '' : undefined}
						>
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
								data-calendar-day-button
								data-calendar-day={isoStr}
								data-today={today ? '' : undefined}
								data-selected={selected ? '' : undefined}
								data-in-range={inRange ? '' : undefined}
								data-range-start={rangeStart ? '' : undefined}
								data-range-end={rangeEnd ? '' : undefined}
								data-outside-month={!isCurrent ? '' : undefined}
								data-disabled={disabled ? '' : undefined}
								onclick={() => handleDayClick(day)}
								onkeydown={(e) => handleDayKeydown(e, day)}
								onmouseenter={() => {
									if (ctx.selecting === 'end') {
										ctx.setHoverDate(day);
									}
								}}
								onmouseleave={() => {
									if (ctx.selecting === 'end') {
										ctx.setHoverDate(null);
									}
								}}
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

<style>
	[data-drp-calendar] {
		display: grid;
		gap: var(--dry-space-2);
		user-select: none;
		color: var(--dry-color-text-strong);
		font-family: var(--dry-font-sans);
	}

	[data-drp-calendar] [data-calendar-panel] {
		display: grid;
		gap: var(--dry-space-2);
	}

	[data-drp-calendar] [data-calendar-header] {
		display: grid;
		grid-template-columns: auto 1fr auto;
		align-items: center;
		gap: var(--dry-space-2);
	}

	[data-drp-calendar] [data-calendar-nav] {
		display: inline-grid;
		place-items: center;
		height: var(--dry-space-8);
		aspect-ratio: 1;
		border: 1px solid transparent;
		border-radius: var(--dry-range-calendar-day-radius, var(--dry-radius-md));
		background: transparent;
		color: var(--dry-color-text-strong);
		cursor: pointer;
		transition:
			background var(--dry-duration-fast) var(--dry-ease-default),
			border-color var(--dry-duration-fast) var(--dry-ease-default);
	}

	[data-drp-calendar] [data-calendar-nav]:hover:not([disabled]) {
		background: var(--dry-range-calendar-day-hover-bg, var(--dry-color-bg-raised));
		border-color: var(--dry-color-stroke-strong);
	}

	[data-drp-calendar] [data-calendar-nav]:focus-visible {
		outline: 2px solid var(--dry-color-focus-ring);
		outline-offset: 1px;
	}

	[data-drp-calendar] [data-calendar-heading] {
		font-size: var(--dry-type-small-size, var(--dry-type-small-size));
		font-weight: 600;
		letter-spacing: -0.01em;
	}

	[data-drp-calendar] [role='grid'] {
		display: grid;
		gap: 1px;
	}

	[data-drp-calendar] [data-calendar-row] {
		display: grid;
		grid-template-columns: repeat(7, minmax(0, 1fr));
	}

	[data-drp-calendar] [data-calendar-columnheader] {
		display: grid;
		place-items: center;
		min-height: var(--dry-space-8);
		font-size: var(--dry-type-tiny-size, var(--dry-type-tiny-size));
		color: var(--dry-range-calendar-outside-color, var(--dry-color-text-weak));
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}

	[data-drp-calendar] [data-calendar-cell] {
		display: grid;
		place-items: center;
	}

	/* ── Cell-level range band (seamless, fills entire grid track) ── */

	[data-drp-calendar] [data-calendar-cell][data-in-range],
	[data-drp-calendar] [data-calendar-cell][data-range-start],
	[data-drp-calendar] [data-calendar-cell][data-range-end] {
		background: var(
			--dry-range-calendar-range-bg,
			color-mix(in srgb, var(--dry-color-fill-brand) 15%, transparent)
		);
	}

	[data-drp-calendar] [data-calendar-cell][data-range-start] {
		border-radius: var(--dry-range-calendar-day-radius, var(--dry-radius-md)) 0 0
			var(--dry-range-calendar-day-radius, var(--dry-radius-md));
	}

	[data-drp-calendar] [data-calendar-cell][data-range-end] {
		border-radius: 0 var(--dry-range-calendar-day-radius, var(--dry-radius-md))
			var(--dry-range-calendar-day-radius, var(--dry-radius-md)) 0;
	}

	/* ── Day button base ── */

	[data-drp-calendar] [data-calendar-day-button] {
		display: inline-grid;
		place-items: center;
		min-height: var(--dry-range-calendar-day-size, 2.25rem);
		aspect-ratio: 1;
		border: none;
		border-radius: var(--dry-range-calendar-day-radius, var(--dry-radius-md));
		background: transparent;
		color: var(--dry-color-text-strong);
		font: inherit;
		font-size: var(--dry-type-small-size, var(--dry-type-small-size));
		font-variant-numeric: tabular-nums;
		cursor: pointer;
		transition:
			background var(--dry-duration-fast) var(--dry-ease-default),
			color var(--dry-duration-fast) var(--dry-ease-default);
	}

	[data-drp-calendar] [data-calendar-day-button]:hover:not([data-disabled]) {
		background: var(--dry-range-calendar-day-hover-bg, var(--dry-color-bg-raised));
	}

	[data-drp-calendar] [data-calendar-day-button]:focus-visible {
		outline: 2px solid var(--dry-color-focus-ring);
		outline-offset: 1px;
	}

	[data-drp-calendar]
		[data-calendar-day-button][data-today]:not([data-range-start]):not([data-range-end]) {
		color: var(--dry-range-calendar-today-color, var(--dry-color-fill-brand));
		font-weight: 600;
	}

	[data-drp-calendar] [data-calendar-day-button][data-outside-month] {
		color: var(--dry-range-calendar-outside-color, var(--dry-color-text-weak));
		opacity: 0.6;
	}

	[data-drp-calendar] [data-calendar-day-button][data-disabled] {
		cursor: not-allowed;
		opacity: 0.4;
		pointer-events: none;
	}

	/* ── Range endpoints (last to win specificity over in-range/outside) ── */

	[data-drp-calendar] [data-calendar-day-button][data-range-start],
	[data-drp-calendar] [data-calendar-day-button][data-range-end] {
		background: var(--dry-range-calendar-selected-bg, var(--dry-color-fill-brand));
		color: var(--dry-range-calendar-selected-color, var(--dry-color-on-brand));
		font-weight: 600;
		border-radius: var(--dry-range-calendar-day-radius, var(--dry-radius-md));
	}

	[data-drp-calendar] [data-calendar-day-button][data-range-start]:hover:not([data-disabled]),
	[data-drp-calendar] [data-calendar-day-button][data-range-end]:hover:not([data-disabled]) {
		background: var(--dry-range-calendar-selected-hover-bg, var(--dry-color-fill-brand-hover));
	}
</style>
