<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		open?: boolean;
		invisible?: boolean;
		children?: Snippet;
	}

	let { open = false, invisible = false, children, class: className, ...rest }: Props = $props();
</script>

{#if open}
	<div
		data-backdrop
		data-invisible={invisible || undefined}
		aria-hidden={children ? undefined : true}
		class={className}
		{...rest}
	>
		{#if children}{@render children()}{/if}
	</div>
{/if}

<style>
	[data-backdrop] {
		--dry-backdrop-bg: var(--dry-color-overlay-backdrop);
		--dry-backdrop-blur: 10px;
		--dry-backdrop-padding: var(--dry-space-6);

		position: fixed;
		inset: 0;
		z-index: var(--dry-layer-overlay);
		display: grid;
		place-items: center;
		padding: var(--dry-backdrop-padding);
		background: var(--dry-backdrop-bg);
		backdrop-filter: blur(var(--dry-backdrop-blur));
		-webkit-backdrop-filter: blur(var(--dry-backdrop-blur));
	}

	[data-backdrop][data-invisible] {
		background: transparent;
		backdrop-filter: none;
		-webkit-backdrop-filter: none;
	}
</style>
