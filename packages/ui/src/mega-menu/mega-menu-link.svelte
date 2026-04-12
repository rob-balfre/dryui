<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAnchorAttributes, HTMLButtonAttributes } from 'svelte/elements';

	interface Props extends Omit<HTMLAnchorAttributes, 'children' | 'type'> {
		href?: string;
		rel?: string;
		target?: string;
		download?: boolean | string;
		type?: 'button' | 'submit' | 'reset';
		icon?: Snippet;
		description?: Snippet;
		children: Snippet;
	}

	let {
		href,
		rel,
		target,
		download,
		type = 'button',
		icon,
		description,
		class: className,
		children,
		...rest
	}: Props = $props();
</script>

{#snippet body()}
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
{/snippet}

{#if href !== undefined}
	<a data-mega-menu-link {href} {rel} {target} {download} class={className} {...rest}>
		{@render body()}
	</a>
{:else}
	<button data-mega-menu-link {type} class={className} {...rest as HTMLButtonAttributes}>
		{@render body()}
	</button>
{/if}

<style>
	[data-mega-menu-link] {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		align-items: start;
		gap: var(--dry-space-3, 0.75rem);
		padding: var(--dry-space-2, 0.5rem) var(--dry-space-3, 0.75rem);
		border: 0;
		border-radius: var(--dry-radius-md, 0.375rem);
		background: none;
		font: inherit;
		text-align: start;
		text-decoration: none;
		color: inherit;
		cursor: pointer;
		appearance: none;
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
