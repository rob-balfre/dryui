<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLSpanElement> {
		children?: Snippet;
		variant?: string;
		pulse?: boolean;
		icon?: Snippet;
	}

	let { children, variant, pulse, icon, ...rest }: Props = $props();
</script>

<span {...rest} data-variant={variant ?? undefined} data-pulse={pulse ? '' : undefined}>
	{#if variant === 'dot'}
		<!-- dot variant renders no content -->
	{:else if icon}
		{@render icon()}
	{:else if children}
		{@render children()}
	{/if}
</span>
