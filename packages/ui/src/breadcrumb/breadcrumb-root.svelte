<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLElement> {
		children: Snippet;
	}

	let { class: className, children, ...rest }: Props = $props();
</script>

<nav aria-label="Breadcrumb" data-breadcrumb class={className} {...rest}>
	{@render children()}
</nav>
