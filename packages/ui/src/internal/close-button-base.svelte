<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import Button from '../button/button.svelte';
	import type { ButtonVariant, ButtonSize } from '../button/index.js';

	interface Props extends HTMLButtonAttributes {
		variant?: ButtonVariant;
		size?: ButtonSize;
		label?: string;
		children?: Snippet;
	}

	let {
		variant = 'trigger',
		size = 'icon-sm',
		label = 'Dismiss',
		children,
		...rest
	}: Props = $props();
</script>

<Button
	{variant}
	{size}
	type="button"
	aria-label={children !== undefined ? undefined : label}
	{...rest}
>
	{#if children}
		{@render children()}
	{:else}
		<span aria-hidden="true">&times;</span>
	{/if}
</Button>
