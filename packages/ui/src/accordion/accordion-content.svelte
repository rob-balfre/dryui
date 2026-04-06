<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getAccordionItemCtx } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		children: Snippet;
	}

	let { class: className, children, ...rest }: Props = $props();

	const itemCtx = getAccordionItemCtx();
</script>

<div
	class={className}
	id={itemCtx.contentId}
	role="region"
	hidden={!itemCtx.open}
	data-state={itemCtx.open ? 'open' : 'closed'}
	data-accordion-content
	{...rest}
>
	<div data-accordion-content-inner>
		{@render children()}
	</div>
</div>

<style>
	[data-accordion-content] {
		font-size: var(--dry-type-small-size, var(--dry-text-sm-size));
	}

	[data-accordion-content-inner] {
		padding: var(--dry-space-2) var(--dry-space-4) var(--dry-space-4);
	}
</style>
