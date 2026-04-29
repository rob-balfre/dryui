<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { getCalendarCtx } from './context.svelte.js';
	import { formatVisibleMonthRangeLabel } from '../internal/calendar-grid-utils.js';

	interface Props extends HTMLAttributes<HTMLSpanElement> {}

	let { class: className, ...rest }: Props = $props();

	const ctx = getCalendarCtx();

	const monthYearLabel = $derived(
		formatVisibleMonthRangeLabel(ctx.viewYear, ctx.viewMonth, ctx.locale, ctx.visibleMonths)
	);
</script>

<span data-calendar-heading aria-live="polite" aria-atomic="true" class={className} {...rest}>
	{monthYearLabel}
</span>

<style>
	[data-calendar-heading] {
		font-size: var(--dry-type-small-size, var(--dry-type-small-size));
		font-weight: 600;
		letter-spacing: 0;
		text-align: center;
	}
</style>
