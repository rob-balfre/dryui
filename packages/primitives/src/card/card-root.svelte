<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { setCardCtx } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLElement> {
		as?: 'div' | 'a' | 'button';
		selected?: boolean;
		orientation?: 'vertical' | 'horizontal';
		children: Snippet;
	}

	let { as = 'div', selected, orientation, children, ...rest }: Props = $props();
	setCardCtx();
</script>

<svelte:element
	this={as}
	data-selected={selected ? '' : undefined}
	data-orientation={orientation}
	{...rest}
>
	{@render children()}
</svelte:element>
