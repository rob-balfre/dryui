<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAnchorAttributes, HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAnchorAttributes {
		href?: string;
		current?: boolean;
		children: Snippet;
	}

	let { href, current = false, class: className, children, ...rest }: Props = $props();
</script>

{#if current}
	<span
		aria-current="page"
		data-breadcrumb-current
		class={className}
		{...rest as HTMLAttributes<HTMLSpanElement>}
	>
		{@render children()}
	</span>
{:else}
	<a {href} data-breadcrumb-link class={className} {...rest}>
		{@render children()}
	</a>
{/if}

<style>
	[data-breadcrumb-link] {
		color: var(--dry-breadcrumb-link-color, var(--dry-color-text-weak));
		text-decoration: underline;
		text-decoration-color: color-mix(in srgb, currentColor 40%, transparent);
		text-underline-offset: 0.2em;
		transition:
			color var(--dry-duration-fast),
			text-decoration-color var(--dry-duration-fast);

		&:hover {
			color: var(--dry-breadcrumb-link-color-hover, var(--dry-color-text-strong));
			text-decoration-color: currentColor;
		}

		&:active {
			color: var(--dry-breadcrumb-link-color-hover, var(--dry-color-text-strong));
		}

		&:focus-visible {
			outline: 2px solid var(--dry-color-focus-ring);
			outline-offset: 2px;
			border-radius: var(--dry-radius-sm);
		}
	}

	[data-breadcrumb-current] {
		color: var(--dry-breadcrumb-current-color, var(--dry-color-text-strong));
		font-weight: var(--dry-breadcrumb-current-weight, 600);
		text-decoration: none;
	}
</style>
