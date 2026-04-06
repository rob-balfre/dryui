<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getCollapsibleCtx } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		children: Snippet;
	}

	let { class: className, children, style, ...rest }: Props = $props();

	const ctx = getCollapsibleCtx();

	function applyStyles(node: HTMLElement) {
		$effect(() => {
			node.style.cssText = style || '';
			node.style.setProperty('--dry-collapsible-content-rows', ctx.open ? '1fr' : '0fr');
		});
	}
</script>

<div
	class={className}
	id={ctx.contentId}
	role="region"
	data-state={ctx.open ? 'open' : 'closed'}
	data-collapsible-content
	{...rest}
	use:applyStyles
>
	<div data-collapsible-content-inner>
		{@render children()}
	</div>
</div>

<style>
	[data-collapsible-content] {
		display: grid;
		grid-template-rows: var(--dry-collapsible-content-rows, 0fr);
		transition: grid-template-rows var(--dry-duration-normal) var(--dry-ease-spring-soft);
	}

	[data-collapsible-content][data-state='open'] {
		grid-template-rows: 1fr;
	}

	[data-collapsible-content-inner] {
		overflow: hidden;
		padding-top: 0;
		transition: padding-top var(--dry-duration-normal) var(--dry-ease-spring-soft);
	}

	[data-collapsible-content][data-state='open'] [data-collapsible-content-inner] {
		padding-top: var(--dry-space-3);
	}
</style>
