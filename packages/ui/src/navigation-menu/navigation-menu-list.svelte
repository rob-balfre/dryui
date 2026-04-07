<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLUListElement> {
		children: Snippet;
	}

	let { class: className, children, ...rest }: Props = $props();
</script>

<ul data-nav-menu-list class={className} {...rest}>
	{@render children()}
</ul>

<style>
	[data-nav-menu-list] {
		--dry-nav-menu-bg: var(--dry-color-bg-raised);
		--dry-nav-menu-border: var(--dry-color-stroke-weak);
		--dry-nav-menu-radius: var(--dry-radius-xl);
		--dry-nav-menu-shadow: var(--dry-shadow-sm);
		--dry-nav-menu-gap: var(--dry-space-1);
		--dry-nav-menu-padding: var(--dry-space-2);
		--dry-nav-menu-trigger-padding-x: var(--dry-space-3);
		--dry-nav-menu-trigger-padding-y: var(--dry-space-2);
		--dry-nav-menu-content-bg: var(--dry-color-bg-overlay);
		--dry-nav-menu-content-border: var(--dry-color-stroke-weak);
		--dry-nav-menu-content-radius: var(--dry-radius-xl);
		--dry-nav-menu-content-shadow: var(--dry-shadow-lg);
		--dry-nav-menu-content-padding: var(--dry-space-2);
		--dry-nav-menu-link-padding-x: var(--dry-space-3);
		--dry-nav-menu-link-padding-y: var(--dry-space-2);

		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		align-items: stretch;
		gap: var(--dry-nav-menu-gap);
		margin: 0;
		padding: var(--dry-nav-menu-padding);
		list-style: none;
		background: var(--dry-nav-menu-bg);
		border: 1px solid var(--dry-nav-menu-border);
		border-radius: var(--dry-nav-menu-radius);
		box-shadow: var(--dry-nav-menu-shadow);
	}

</style>
