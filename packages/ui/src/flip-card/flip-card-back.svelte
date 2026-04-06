<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getContext } from 'svelte';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		children: Snippet;
	}

	let { class: className, children, ...rest }: Props = $props();
	const ctx = getContext<{ flipped: boolean }>('flip-card');
</script>

<div
	data-part="back"
	data-flip-card-back
	aria-live="polite"
	aria-hidden={!ctx.flipped}
	class={className}
	{...rest}
>
	{@render children()}
</div>

<style>
	[data-flip-card-back] {
		z-index: 1;
	}
</style>
