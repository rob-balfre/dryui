<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAnchorAttributes } from 'svelte/elements';

	interface Props extends HTMLAnchorAttributes {
		external?: boolean;
		disabled?: boolean;
		children: Snippet;
	}

	let { external = false, disabled = false, href, children, onclick, ...rest }: Props = $props();

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
	href={disabled ? undefined : href}
	rel={external ? 'noopener noreferrer' : rest.rel}
	target={external ? '_blank' : rest.target}
	aria-disabled={disabled || undefined}
	data-disabled={disabled || undefined}
	tabindex={disabled ? -1 : undefined}
	onclick={handleClick}
	{...rest}
>
	{@render children()}
</a>
