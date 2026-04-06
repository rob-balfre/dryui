<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAnchorAttributes, HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAnchorAttributes {
		href?: string;
		current?: boolean;
		children: Snippet;
	}

	let { href, current = false, children, ...rest }: Props = $props();
</script>

{#if current}
	<span aria-current="page" {...rest as HTMLAttributes<HTMLSpanElement>}>
		{@render children()}
	</span>
{:else}
	<a {href} {...rest}>
		{@render children()}
	</a>
{/if}
