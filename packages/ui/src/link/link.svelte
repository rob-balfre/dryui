<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAnchorAttributes } from 'svelte/elements';

	interface Props extends HTMLAnchorAttributes {
		external?: boolean;
		disabled?: boolean;
		underline?: 'always' | 'hover' | 'none';
		children: Snippet;
	}

	let {
		external = false,
		disabled = false,
		underline = 'always',
		href,
		class: className,
		children,
		onclick,
		...rest
	}: Props = $props();

	function handleClick(event: MouseEvent & { currentTarget: HTMLAnchorElement }) {
		if (disabled) {
			event.preventDefault();
			event.stopPropagation();
			return;
		}

		onclick?.(event);
	}
</script>

<a
	class={className}
	href={disabled ? undefined : href}
	rel={external ? 'noopener noreferrer' : rest.rel}
	target={external ? '_blank' : rest.target}
	aria-disabled={disabled || undefined}
	data-disabled={disabled || undefined}
	data-underline={underline}
	tabindex={disabled ? -1 : undefined}
	onclick={handleClick}
	{...rest}
>
	{@render children()}
</a>

<style>
	a {
		/* Component tokens */
		--dry-link-hover-color: var(--dry-color-fill-brand-hover, var(--dry-color-text-brand));

		display: inline-grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		align-items: center;
		gap: var(--dry-space-1);
		color: var(--dry-link-color, var(--dry-color-text-brand));
		text-underline-offset: var(--dry-link-underline-offset, var(--dry-space-0_5));
		text-decoration-color: currentColor;
		text-decoration-thickness: from-font;
		transition:
			color var(--dry-duration-fast) var(--dry-ease-default),
			opacity var(--dry-duration-fast) var(--dry-ease-default);
	}

	a[data-underline='always'] {
		text-decoration-line: underline;
	}

	a[data-underline='hover'] {
		text-decoration-line: none;
	}

	a[data-underline='hover']:hover:not([data-disabled]) {
		color: var(--dry-link-hover-color);
		text-decoration-line: underline;
	}

	a[data-underline='none'] {
		text-decoration-line: none;
	}

	a:hover:not([data-disabled]) {
		color: var(--dry-link-hover-color);
	}

	a:focus-visible {
		outline: var(--dry-focus-ring);
		outline-offset: 2px;
		border-radius: var(--dry-radius-sm);
	}

	a[data-disabled] {
		color: var(--dry-color-text-disabled);
		text-decoration-color: var(--dry-color-stroke-disabled);
		cursor: not-allowed;
		pointer-events: none;
	}
</style>
