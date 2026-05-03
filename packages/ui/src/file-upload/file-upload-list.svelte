<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getFileUploadCtx } from './context.svelte.js';

	interface Props extends Omit<HTMLAttributes<HTMLUListElement>, 'children'> {
		size?: 'sm' | 'md' | 'lg';
		children: Snippet<[{ file: File; index: number }]>;
	}

	let { children, class: className, size = 'md', ...rest }: Props = $props();

	const ctx = getFileUploadCtx();
</script>

<ul data-fu-list data-size={size} class={className} {...rest}>
	{#each ctx.files as file, index}
		{@render children({ file, index })}
	{/each}
</ul>

<style>
	[data-fu-list] {
		display: grid;
		gap: var(--dry-space-2);
		list-style: none;
		margin: 0;
		padding: 0;
	}

	[data-fu-list][data-size='sm'] {
		gap: var(--dry-space-1);
	}
	[data-fu-list][data-size='lg'] {
		gap: var(--dry-space-3);
	}
</style>
