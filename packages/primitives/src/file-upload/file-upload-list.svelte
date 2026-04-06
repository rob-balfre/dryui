<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getFileUploadCtx } from './context.svelte.js';

	interface Props extends Omit<HTMLAttributes<HTMLUListElement>, 'children'> {
		children: Snippet<[{ file: File; index: number }]>;
	}

	let { children, class: className, ...rest }: Props = $props();

	const ctx = getFileUploadCtx();
</script>

<ul class={className} {...rest}>
	{#each ctx.files as file, index}
		{@render children({ file, index })}
	{/each}
</ul>
