<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		title?: string;
		actions?: Snippet;
		children: Snippet;
	}

	let { title, actions, children, ...rest }: Props = $props();
</script>

<div {...rest}>
	<div data-part="chrome" aria-hidden="true">
		<span data-part="dot"></span>
		<span data-part="dot"></span>
		<span data-part="dot"></span>
		{#if title}
			<span data-part="title">{title}</span>
		{/if}
		{#if actions}
			<div data-part="actions">
				{@render actions()}
			</div>
		{/if}
	</div>
	<div data-part="content">
		{@render children()}
	</div>
</div>
