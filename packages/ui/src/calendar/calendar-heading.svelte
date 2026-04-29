<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { getCalendarCtx } from './context.svelte.js';
	import { formatDate } from '@dryui/primitives';

	interface Props extends HTMLAttributes<HTMLSpanElement> {}

	let { class: className, ...rest }: Props = $props();

	const ctx = getCalendarCtx();

	const monthYearLabel = $derived(
		formatDate(new Date(ctx.viewYear, ctx.viewMonth, 1), ctx.locale, {
			month: 'long',
			year: 'numeric'
		})
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
