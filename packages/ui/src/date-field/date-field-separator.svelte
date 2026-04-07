<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { getDateFieldCtx } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLSpanElement> {
		separator?: string;
	}

	let { separator, class: className, ...rest }: Props = $props();

	const ctx = getDateFieldCtx();

	const display = $derived(separator ?? ctx.separator);
</script>

<span
	aria-hidden="true"
	data-df-separator
	data-separator=""
	{...rest}
	class={className}
>
	{display}
</span>

<style>
	[data-df-separator] {
		color: var(--dry-color-text-weak);
		padding: 0 var(--dry-space-0_5);
	}
</style>
