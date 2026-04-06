<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		open?: boolean;
		invisible?: boolean;
		children?: Snippet;
	}

	let { open = false, invisible = false, children, ...rest }: Props = $props();
</script>

{#if open}
	<div
		data-backdrop
		data-invisible={invisible || undefined}
		aria-hidden={children ? undefined : true}
		{...rest}
	>
		{#if children}{@render children()}{/if}
	</div>
{/if}
