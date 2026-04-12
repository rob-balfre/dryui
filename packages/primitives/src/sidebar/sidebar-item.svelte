<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAnchorAttributes } from 'svelte/elements';

	interface Props extends HTMLAnchorAttributes {
		active?: boolean;
		children: Snippet;
	}

	let { href, active = false, class: className, children, ...rest }: Props = $props();
</script>

<a {href} data-active={active || undefined} class={className} {...rest}>
	{@render children()}
</a>
