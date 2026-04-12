<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAnchorAttributes } from 'svelte/elements';

	interface Props extends HTMLAnchorAttributes {
		icon?: Snippet;
		description?: Snippet;
		children: Snippet;
	}

	let { icon, description, class: className, children, ...rest }: Props = $props();
</script>

<a data-mega-menu-link class={className} {...rest}>
	{#if icon}
		<span data-part="link-icon">
			{@render icon()}
		</span>
	{/if}
	<span data-part="link-content">
		<span data-part="link-text">
			{@render children()}
		</span>
		{#if description}
			<span data-part="link-description">
				{@render description()}
			</span>
		{/if}
	</span>
</a>

<style>
	[data-mega-menu-link] {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		align-items: start;
		gap: var(--dry-space-3, 0.75rem);
		border-radius: var(--dry-radius-md, 0.375rem);
		text-decoration: none;
		color: inherit;
		transition: background var(--dry-duration-fast, 100ms) ease;
	}

	[data-mega-menu-link]:hover {
		background: var(--dry-color-bg-overlay, #f3f4f6);
	}

	[data-mega-menu-link] [data-part='link-icon'] {
		color: var(--dry-color-text-weak);
	}

	[data-mega-menu-link] [data-part='link-text'] {
		font-size: var(--dry-type-ui-control-size, var(--dry-text-sm-size, 0.875rem));
		font-weight: 500;
		color: var(--dry-color-text-strong, #1a1a2e);
	}

	[data-mega-menu-link] [data-part='link-description'] {
		font-size: var(--dry-type-ui-caption-size, var(--dry-text-xs-size, 0.75rem));
		color: var(--dry-color-text-weak, #64748b);
		margin-top: var(--dry-space-0_5, 0.125rem);
	}
</style>
