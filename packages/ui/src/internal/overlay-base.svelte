<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {}

	let { class: className, ...rest }: Props = $props();
</script>

<div class={className} {...rest}></div>

<style>
	div {
		position: fixed;
		inset: 0;
		background: var(--dry-overlay-bg, var(--dry-color-overlay-backdrop));
		backdrop-filter: blur(var(--dry-overlay-blur, 12px));
		-webkit-backdrop-filter: blur(var(--dry-overlay-blur, 12px));
		z-index: var(--dry-layer-overlay);
		will-change: opacity;
	}

	div[data-state='closed'] {
		display: none;
	}
</style>
