<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLElement> {
		keys?: string[];
		children?: Snippet;
	}

	let { class: className, keys, children, ...rest }: Props = $props();
</script>

<kbd class={className} {...rest}>
	{#if keys}
		{#each keys as key, i}
			<kbd>{key}</kbd>{#if i < keys.length - 1}<span>+</span>{/if}
		{/each}
	{:else if children}
		{@render children()}
	{/if}
</kbd>

<style>
	kbd {
		--dry-kbd-bg: var(--dry-color-bg-overlay);
		--dry-kbd-border: var(--dry-color-stroke-weak);
		--dry-kbd-radius: var(--dry-radius-md);
		--dry-kbd-font-size: var(--dry-type-tiny-size, var(--dry-text-xs-size));

		display: inline-grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		align-items: center;
		gap: 0.35em;
		padding: var(--dry-space-1) var(--dry-space-2);
		border: 1px solid var(--dry-kbd-border);
		border-bottom-width: 2px;
		border-radius: var(--dry-kbd-radius);
		background: var(--dry-kbd-bg);
		color: var(--dry-color-text-strong);
		font-family: var(--dry-font-mono);
		font-size: var(--dry-kbd-font-size);
		font-weight: 600;
		line-height: 1;
		box-shadow: inset 0 -1px 0 color-mix(in srgb, var(--dry-color-text-strong) 10%, transparent);
		user-select: none;
		white-space: nowrap;
	}

	kbd kbd {
		padding: 0;
		margin: 0;
		border: 0;
		background: transparent;
		font: inherit;
	}

	kbd span {
		color: var(--dry-color-text-weak);
	}
</style>
