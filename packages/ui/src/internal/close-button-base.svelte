<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import Button from '../button/button.svelte';
	import type { ButtonVariant, ButtonSize } from '../button/index.js';

	interface Props extends HTMLButtonAttributes {
		variant?: ButtonVariant;
		size?: ButtonSize;
		children?: Snippet;
	}

	let { variant = 'trigger', size = 'icon-sm', children, ...rest }: Props = $props();
</script>

<Button {variant} {size} type="button" {...rest}>
	{#if children}
		{@render children()}
	{:else}
		<span aria-hidden="true">&times;</span>
	{/if}
</Button>
