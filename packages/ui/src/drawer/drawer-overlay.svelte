<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { getDrawerCtx } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {}

	let { class: className, ...rest }: Props = $props();

	const ctx = getDrawerCtx();
</script>

<div
	data-drawer-overlay
	data-state={ctx.open ? 'open' : 'closed'}
	aria-hidden="true"
	class={className}
	{...rest}
></div>

<style>
	[data-drawer-overlay] {
		position: fixed;
		inset: 0;
		background: var(--dry-overlay-bg, var(--dry-color-overlay-backdrop-strong));
		backdrop-filter: blur(var(--dry-overlay-blur, 8px));
		-webkit-backdrop-filter: blur(var(--dry-overlay-blur, 8px));
		z-index: var(--dry-layer-overlay);
		will-change: opacity;
	}

	[data-drawer-overlay][data-state='closed'] {
		display: none;
	}
</style>
