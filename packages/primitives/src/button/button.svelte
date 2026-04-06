<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAnchorAttributes, HTMLButtonAttributes } from 'svelte/elements';

	interface SharedProps {
		disabled?: boolean;
		href?: string;
		rel?: string;
		target?: string;
		download?: boolean | string;
		type?: 'button' | 'submit' | 'reset';
		onclick?: (event: MouseEvent) => void;
		children: Snippet;
	}

	type Props = SharedProps &
		Omit<HTMLButtonAttributes, 'type' | 'disabled' | 'onclick' | 'children'> &
		Omit<HTMLAnchorAttributes, 'href' | 'rel' | 'target' | 'download' | 'onclick' | 'children'>;

	let {
		disabled = false,
		href,
		rel,
		target,
		download,
		type = 'button',
		onclick,
		children,
		...rest
	}: Props = $props();

	const linkProps = $derived(rest as Record<string, unknown>);
	const buttonProps = $derived(rest as HTMLButtonAttributes);

	function handleLinkClick(event: MouseEvent) {
		if (disabled) {
			event.preventDefault();
			event.stopPropagation();
			return;
		}

		(onclick as ((event: MouseEvent) => void) | undefined)?.(event);
	}
</script>

{#if href !== undefined}
	<a
		{...linkProps}
		href={disabled ? undefined : href}
		{rel}
		{target}
		{download}
		aria-disabled={disabled || undefined}
		data-disabled={disabled || undefined}
		tabindex={disabled ? -1 : undefined}
		onclick={handleLinkClick}
	>
		{@render children()}
	</a>
{:else}
	<button {type} {disabled} data-disabled={disabled || undefined} {onclick} {...buttonProps}>
		{@render children()}
	</button>
{/if}
