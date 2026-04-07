<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { getRangeCalendarCtx } from './context.svelte.js';
	import {
		getCalendarDays,
		isSameDay,
		isToday,
		isDateInRange,
		formatDate
	} from '@dryui/primitives';

	interface Props extends HTMLAttributes<HTMLDivElement> {}

	let { class: className, ...rest }: Props = $props();

	const ctx = getRangeCalendarCtx();

	let gridEl = $state<HTMLDivElement>();

	const weekdayLabels = $derived(generateWeekdayLabels(ctx.locale, ctx.weekStartDay));

	const calendarDays = $derived(getCalendarDays(ctx.viewYear, ctx.viewMonth, ctx.weekStartDay));

	const monthYearLabel = $derived(
		formatDate(new Date(ctx.viewYear, ctx.viewMonth, 1), ctx.locale, {
			month: 'long',
			year: 'numeric'
		})
	);

	const weeks = $derived(splitIntoWeeks(calendarDays));

	function generateWeekdayLabels(locale: string, weekStartDay: number): string[] {
		const formatter = new Intl.DateTimeFormat(locale, { weekday: 'short' });
		const labels: string[] = [];
		for (let i = 0; i < 7; i++) {
			const d = new Date(2024, 0, 7 + ((i + weekStartDay) % 7));
			labels.push(formatter.format(d));
		}
		return labels;
	}

	function splitIntoWeeks(days: Date[]): Date[][] {
		const result: Date[][] = [];
		for (let i = 0; i < days.length; i += 7) {
			result.push(days.slice(i, i + 7));
		}
		return result;
	}

	function getDayISOString(day: Date): string {
		return `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;
	}

	function isInRange(day: Date): boolean {
		const start = ctx.startDate;
		const end = ctx.endDate ?? ctx.hoveredDate;
		if (!start || !end) return false;
		const lo = start < end ? start : end;
		const hi = start < end ? end : start;
		const time = day.getTime();
		return time >= lo.getTime() && time <= hi.getTime();
	}

	function isRangeStart(day: Date): boolean {
		if (!ctx.startDate) return false;
		const end = ctx.endDate ?? ctx.hoveredDate;
		if (!end) return isSameDay(day, ctx.startDate);
		const lo = ctx.startDate < end ? ctx.startDate : end;
		return isSameDay(day, lo);
	}

	function isRangeEnd(day: Date): boolean {
		const end = ctx.endDate ?? ctx.hoveredDate;
		if (!ctx.startDate || !end) return false;
		const hi = ctx.startDate < end ? end : ctx.startDate;
		return isSameDay(day, hi);
	}

	function handleDayClick(day: Date) {
		if (!isDateInRange(day, ctx.min, ctx.max)) return;
		ctx.selectDate(day);
	}

	function handleDayKeydown(e: KeyboardEvent, day: Date) {
		const { key } = e;
		let newDate: Date | null = null;

		if (key === 'ArrowLeft') {
			e.preventDefault();
			newDate = new Date(day);
			newDate.setDate(newDate.getDate() - 1);
		} else if (key === 'ArrowRight') {
			e.preventDefault();
			newDate = new Date(day);
			newDate.setDate(newDate.getDate() + 1);
		} else if (key === 'ArrowUp') {
			e.preventDefault();
			newDate = new Date(day);
			newDate.setDate(newDate.getDate() - 7);
		} else if (key === 'ArrowDown') {
			e.preventDefault();
			newDate = new Date(day);
			newDate.setDate(newDate.getDate() + 7);
		} else if (key === 'Enter' || key === ' ') {
			e.preventDefault();
			if (isDateInRange(day, ctx.min, ctx.max)) ctx.selectDate(day);
			return;
		} else return;

		if (newDate) {
			ctx.setFocusedDate(newDate);
			requestAnimationFrame(() => {
				const isoStr = getDayISOString(newDate!);
				const btn = gridEl?.querySelector(`[data-calendar-day="${isoStr}"]`) as HTMLButtonElement;
				btn?.focus();
			});
		}
	}

	function isDayDisabled(day: Date): boolean {
		return !isDateInRange(day, ctx.min, ctx.max);
	}
</script>

<div bind:this={gridEl} data-range-calendar-grid class={className} {...rest}>
	<div role="group" aria-label={monthYearLabel}>
		<div data-calendar-header>
			<button type="button" aria-label="Previous month" onclick={() => ctx.prevMonth()}>
				&#8249;
			</button>
			<span aria-live="polite" aria-atomic="true">
				{monthYearLabel}
			</span>
			<button type="button" aria-label="Next month" onclick={() => ctx.nextMonth()}>
				&#8250;
			</button>
		</div>

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
						{@const inRange = isInRange(day)}
						{@const rangeStart = isRangeStart(day)}
						{@const rangeEnd = isRangeEnd(day)}
						{@const today = isToday(day)}
						{@const disabled = isDayDisabled(day)}
						{@const focused = isSameDay(day, ctx.focusedDate)}
						{@const isoStr = getDayISOString(day)}
						<div role="gridcell" aria-selected={inRange || undefined}>
							<button
								type="button"
								tabindex={focused ? 0 : -1}
								aria-label={formatDate(day, ctx.locale, {
									year: 'numeric',
									month: 'long',
									day: 'numeric'
								})}
								aria-disabled={disabled}
								data-calendar-day={isoStr}
								data-today={today ? '' : undefined}
								data-in-range={inRange ? '' : undefined}
								data-range-start={rangeStart ? '' : undefined}
								data-range-end={rangeEnd ? '' : undefined}
								data-outside-month={!isCurrent ? '' : undefined}
								data-disabled={disabled ? '' : undefined}
								onclick={() => handleDayClick(day)}
								onkeydown={(e) => handleDayKeydown(e, day)}
								onmouseenter={() => ctx.setHoveredDate(day)}
								onmouseleave={() => ctx.setHoveredDate(null)}
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
	[data-range-calendar-grid] {
		display: grid;
		gap: var(--dry-space-2);

		[role='group'] {
			display: grid;
			gap: var(--dry-space-2);
		}

		[role='group'] > div:first-child {
			display: grid;
			grid-template-columns: auto 1fr auto;
			align-items: center;
			gap: var(--dry-space-2);
		}

		[role='group'] > div:first-child button {
			display: inline-grid;
			place-items: center;
			height: var(--dry-space-8);
			aspect-ratio: 1;
			border: 1px solid transparent;
			border-radius: var(--dry-range-calendar-day-radius);
			background: transparent;
			color: var(--dry-color-text-strong);
			cursor: pointer;
			transition:
				background var(--dry-duration-fast) var(--dry-ease-default),
				border-color var(--dry-duration-fast) var(--dry-ease-default);
		}

		[role='group'] > div:first-child button:hover:not([disabled]) {
			background: var(--dry-range-calendar-day-hover-bg);
			border-color: var(--dry-color-stroke-strong);
		}

		[role='group'] > div:first-child button:focus-visible {
			outline: 2px solid var(--dry-color-focus-ring);
			outline-offset: 1px;
		}

		[role='group'] > div:first-child span {
			font-size: var(--dry-type-small-size, var(--dry-type-small-size));
			font-weight: 600;
			letter-spacing: -0.01em;
		}

		[role='grid'] {
			display: grid;
			gap: 1px;
		}

		[role='row'] {
			display: grid;
			grid-template-columns: repeat(7, minmax(0, 1fr));
			gap: 1px;
		}

		[role='columnheader'] {
			display: grid;
			place-items: center;
			min-height: var(--dry-space-8);
			font-size: var(--dry-type-tiny-size, var(--dry-type-tiny-size));
			color: var(--dry-range-calendar-outside-color);
			text-transform: uppercase;
			letter-spacing: 0.04em;
		}

		[role='gridcell'] {
			display: grid;
			place-items: center;
		}

		[role='gridcell'] button {
			display: inline-grid;
			place-items: center;
			min-height: var(--dry-range-calendar-day-size);
			aspect-ratio: 1;
			border: none;
			border-radius: var(--dry-range-calendar-day-radius);
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

		[role='gridcell'] button:hover:not([data-disabled]) {
			background: var(--dry-range-calendar-day-hover-bg);
		}

		[role='gridcell'] button:focus-visible {
			outline: 2px solid var(--dry-color-focus-ring);
			outline-offset: 1px;
		}

		[role='gridcell'] button[data-today]:not([data-range-start]):not([data-range-end]) {
			color: var(--dry-range-calendar-today-color);
			font-weight: 600;
		}

		[role='gridcell'] button[data-range-start],
		[role='gridcell'] button[data-range-end] {
			background: var(--dry-range-calendar-selected-bg);
			color: var(--dry-range-calendar-selected-color);
			font-weight: 600;
		}

		[role='gridcell'] button[data-range-start]:hover:not([data-disabled]),
		[role='gridcell'] button[data-range-end]:hover:not([data-disabled]) {
			background: var(--dry-range-calendar-selected-hover-bg);
		}

		[role='gridcell'] button[data-in-range] {
			background: var(--dry-range-calendar-range-bg);
			border-radius: 0;
		}

		[role='gridcell'] button[data-range-start],
		[role='gridcell'] button[data-range-end] {
			border-radius: var(--dry-range-calendar-day-radius);
		}

		[role='gridcell'] button[data-outside-month] {
			color: var(--dry-range-calendar-outside-color);
			opacity: 0.6;
		}

		[role='gridcell'] button[data-disabled] {
			cursor: not-allowed;
			opacity: 0.4;
			pointer-events: none;
		}
	}
</style>
