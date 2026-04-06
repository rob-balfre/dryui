<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getContext } from 'svelte';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		children: Snippet;
	}

	let { children, ...rest }: Props = $props();
	const ctx = getContext<{ flipped: boolean }>('flip-card');
</script>

<div data-part="back" aria-live="polite" aria-hidden={!ctx.flipped} {...rest}>
	{@render children()}
</div>
