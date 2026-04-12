<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLHeadingElement> {
		level?: 1 | 2 | 3 | 4 | 5 | 6;
		children: Snippet;
	}

	let { level = 2, children, ...rest }: Props = $props();

	let tag = $derived(`h${level}` as const);
</script>

<!-- dryui-allow svelte-element: polymorphic h1–h6 heading share the same UA styles and semantic family -->
<svelte:element this={tag} data-page-header-title data-level={level} {...rest}>
	{@render children()}
</svelte:element>
