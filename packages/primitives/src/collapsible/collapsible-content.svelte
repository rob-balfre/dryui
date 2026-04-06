<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getCollapsibleCtx } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		children: Snippet;
	}

	let { children, class: className, style, ...rest }: Props = $props();

	const ctx = getCollapsibleCtx();

	function applyStyles(node: HTMLElement) {
		$effect(() => {
			node.style.cssText = style || '';
			node.style.setProperty('--dry-collapsible-content-rows', ctx.open ? '1fr' : '0fr');
		});
	}
</script>

<div
	class={['content', className]}
	id={ctx.contentId}
	role="region"
	data-state={ctx.open ? 'open' : 'closed'}
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
		grid-template-rows: var(--dry-collapsible-content-rows, 0fr);
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
