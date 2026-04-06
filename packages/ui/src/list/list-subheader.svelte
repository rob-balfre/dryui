<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLLIElement> {
		children: Snippet;
	}

	let { class: className, children, ...rest }: Props = $props();
</script>

<li role="presentation" data-list-subheader class={className} {...rest}>
	{@render children()}
</li>
