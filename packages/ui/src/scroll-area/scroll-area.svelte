<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		orientation?: 'vertical' | 'horizontal' | 'both';
		children: Snippet;
	}

	let { orientation = 'vertical', class: className, children, ...rest }: Props = $props();
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<div
	role="region"
	aria-label="Scrollable content"
	data-scroll-area
	data-orientation={orientation}
	tabindex={0}
	class={className}
	{...rest}
>
	{@render children()}
</div>

<style>
	[data-scroll-area] {
		position: relative;
		min-height: 0;

		scrollbar-width: thin;
		scrollbar-color: var(--dry-scrollbar-thumb) var(--dry-scrollbar-track);
	}

	[data-scroll-area][data-orientation='vertical'] {
		overflow-y: auto;
		overflow-x: hidden;
	}

	[data-scroll-area][data-orientation='horizontal'] {
		overflow-y: hidden;
		overflow-x: auto;
	}

	[data-scroll-area][data-orientation='both'] {
		overflow: auto;
	}

	[data-scroll-area]::-webkit-scrollbar {
		height: var(--dry-scrollbar-width);
	}

	[data-scroll-area]::-webkit-scrollbar-track {
		background: var(--dry-scrollbar-track);
	}

	[data-scroll-area]::-webkit-scrollbar-thumb {
		background: var(--dry-scrollbar-thumb);
		border-radius: var(--dry-radius-full);
		border: 2px solid transparent;
		background-clip: content-box;
	}

	[data-scroll-area]::-webkit-scrollbar-thumb:hover {
		background: var(--dry-scrollbar-thumb-hover);
		background-clip: content-box;
	}

	[data-scroll-area]:focus-visible {
		outline: var(--dry-focus-ring);
		outline-offset: -2px;
	}
</style>
