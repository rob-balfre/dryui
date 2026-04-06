<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends Omit<HTMLAttributes<HTMLLIElement>, 'children'> {
		children?: Snippet | undefined;
	}

	let { children, ...rest }: Props = $props();
</script>

<li role="presentation" aria-hidden="true" {...rest}>
	{#if children}
		{@render children()}
	{:else}
		/
	{/if}
</li>
