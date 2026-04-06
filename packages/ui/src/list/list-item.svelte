<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getListCtx } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLLIElement> {
		interactive?: boolean;
		disabled?: boolean;
		children: Snippet;
	}

	let {
		interactive = false,
		disabled = false,
		class: className,
		children,
		onclick,
		...rest
	}: Props = $props();

	const ctx = getListCtx();

	function handleKeydown(e: KeyboardEvent) {
		if (!interactive || disabled) return;
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			if (onclick) {
				(onclick as (e: Event) => void)(e);
			}
		}
	}
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<li
	data-list-item
	data-interactive={interactive || undefined}
	data-disabled={disabled || undefined}
	data-dense={ctx.dense || undefined}
	role={interactive ? 'button' : undefined}
	tabindex={interactive && !disabled ? 0 : undefined}
	aria-disabled={disabled || undefined}
	class={className}
	{onclick}
	onkeydown={interactive ? handleKeydown : undefined}
	{...rest}
>
	{@render children()}
</li>
