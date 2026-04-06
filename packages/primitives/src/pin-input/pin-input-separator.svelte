<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		children?: Snippet;
	}

	let { children, class: className, ...rest }: Props = $props();
</script>

<div role="separator" data-pin-input-separator class={className} {...rest}>
	{#if children}
		{@render children()}
	{:else}
		<span aria-hidden="true">–</span>
	{/if}
</div>
