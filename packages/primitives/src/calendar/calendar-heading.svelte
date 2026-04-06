<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { getCalendarCtx } from './context.svelte.js';
	import { formatDate } from '../utils/date-utils.js';

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

<span aria-live="polite" aria-atomic="true" class={className} {...rest}>
	{monthYearLabel}
</span>
