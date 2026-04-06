<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
		name: string;
		description?: string;
		children?: Snippet | undefined;
	}

	let { name, description, children, ...rest }: Props = $props();
</script>

<div role="group" aria-label={name} {...rest}>
	{#if children}
		{@render children()}
	{:else}
		<span>{name}</span>
		{#if description}
			<span>{description}</span>
		{/if}
	{/if}
</div>
