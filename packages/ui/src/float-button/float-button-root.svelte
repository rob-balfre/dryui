<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { setFloatButtonCtx } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		open?: boolean;
		position?: 'bottom-right' | 'bottom-left';
		children: Snippet;
	}

	let {
		open = $bindable(false),
		children,
		class: className,
		position = 'bottom-right',
		...rest
	}: Props = $props();

	setFloatButtonCtx({
		get open() {
			return open;
		},
		toggle() {
			open = !open;
		}
	});
</script>

<div data-state={open ? 'open' : 'closed'} {...rest} class={className}>
	{@render children()}
</div>

<!-- svelte-ignore css_unused_selector -->
<style>
	[data-float-button-wrapper] {
		display: contents;
	}

	[data-float-button-wrapper] :where([data-float-button]) {
		--dry-fab-offset: var(--dry-space-6);
		--dry-fab-gap: var(--dry-space-3);
		--dry-fab-z-index: var(--dry-layer-overlay);

		position: fixed;
		z-index: var(--dry-fab-z-index);
		display: grid;
		justify-items: center;
		gap: var(--dry-fab-gap);
	}

	[data-float-button-wrapper][data-position='bottom-right'] :where([data-float-button]) {
		bottom: var(--dry-fab-offset);
		right: var(--dry-fab-offset);
	}

	[data-float-button-wrapper][data-position='bottom-left'] :where([data-float-button]) {
		bottom: var(--dry-fab-offset);
		left: var(--dry-fab-offset);
	}
</style>
