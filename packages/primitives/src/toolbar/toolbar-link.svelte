<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAnchorAttributes } from 'svelte/elements';

	interface Props extends HTMLAnchorAttributes {
		href: string;
		children: Snippet;
	}

	let { href, children, ...rest }: Props = $props();
</script>

<a {href} tabindex={-1} {...rest}>
	{@render children()}
</a>
