<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes, HTMLButtonAttributes } from 'svelte/elements';
	import { setCardCtx } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLElement> {
		as?: 'div' | 'button';
		selected?: boolean;
		orientation?: 'vertical' | 'horizontal';
		children: Snippet;
	}

	let { as = 'div', selected, orientation, children, ...rest }: Props = $props();
	setCardCtx();
</script>

{#if as === 'button'}
	<button
		type="button"
		data-selected={selected ? '' : undefined}
		data-orientation={orientation}
		{...rest as HTMLButtonAttributes}
	>
		{@render children()}
	</button>
{:else}
	<div data-selected={selected ? '' : undefined} data-orientation={orientation} {...rest}>
		{@render children()}
	</div>
{/if}
