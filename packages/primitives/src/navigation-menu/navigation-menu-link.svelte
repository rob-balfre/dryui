<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAnchorAttributes } from 'svelte/elements';

	interface Props extends HTMLAnchorAttributes {
		active?: boolean;
		children: Snippet;
	}

	let { href, active, children, ...rest }: Props = $props();
</script>

<a {href} data-active={active || undefined} {...rest}>
	{@render children()}
</a>
