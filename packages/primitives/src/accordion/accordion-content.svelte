<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getAccordionItemCtx } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		children: Snippet;
	}

	let { children, class: className, style, ...rest }: Props = $props();

	const itemCtx = getAccordionItemCtx();

	function applyStyles(node: HTMLElement) {
		$effect(() => {
			node.style.cssText = style || '';
			node.style.setProperty('--dry-accordion-content-rows', itemCtx.open ? '1fr' : '0fr');
		});
	}
</script>

<div
	class={['content', className]}
	id={itemCtx.contentId}
	role="region"
	data-state={itemCtx.open ? 'open' : 'closed'}
	{...rest}
	use:applyStyles
>
	<div class="inner">
		{@render children()}
	</div>
</div>

<style>
	.content {
		display: grid;
		grid-template-rows: var(--dry-accordion-content-rows, 0fr);
		transition: grid-template-rows var(--dry-duration-normal, 200ms) var(--dry-ease-default, ease);
	}

	.inner {
		overflow: hidden;
	}

	@media (prefers-reduced-motion: reduce) {
		.content {
			transition: none;
		}
	}
</style>
