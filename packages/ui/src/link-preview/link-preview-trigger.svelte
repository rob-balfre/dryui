<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAnchorAttributes } from 'svelte/elements';
	import { getLinkPreviewCtx } from './context.svelte.js';

	interface Props extends HTMLAnchorAttributes {
		children: Snippet;
	}

	let { class: className, children, ...rest }: Props = $props();

	const ctx = getLinkPreviewCtx();

	let anchorEl = $state<HTMLAnchorElement>();

	$effect(() => {
		if (anchorEl) {
			ctx.triggerEl = anchorEl;
		}
	});
</script>

<a
	bind:this={anchorEl}
	id={ctx.triggerId}
	data-link-preview-trigger
	aria-describedby={ctx.open ? ctx.contentId : undefined}
	onmouseenter={() => ctx.show()}
	onmouseleave={() => ctx.close()}
	onfocusin={() => ctx.showImmediate()}
	onfocusout={() => ctx.closeImmediate()}
	class={className}
	{...rest}
>
	{@render children()}
</a>

<style>
	[data-link-preview-trigger] {
		--dry-link-preview-color: var(--dry-color-text-brand);
		--dry-link-preview-underline-offset: 0.18em;

		display: inline-grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		align-items: baseline;
		gap: 0.2em;
		color: var(--dry-link-preview-color);
		text-decoration: underline;
		text-decoration-color: color-mix(in srgb, currentColor 45%, transparent);
		text-underline-offset: var(--dry-link-preview-underline-offset);
		cursor: pointer;
		transition:
			color var(--dry-duration-fast) var(--dry-ease-default),
			text-decoration-color var(--dry-duration-fast) var(--dry-ease-default);
	}

	[data-link-preview-trigger]:hover {
		color: var(--dry-color-fill-brand-hover);
		text-decoration-color: currentColor;
	}
</style>
