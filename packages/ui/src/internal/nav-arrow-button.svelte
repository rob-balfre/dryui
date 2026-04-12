<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import Button from '../button/button.svelte';
	import type { ButtonVariant, ButtonSize } from '../button/index.js';

	interface Props extends Omit<HTMLButtonAttributes, 'type' | 'aria-label'> {
		direction: 'prev' | 'next';
		variant?: ButtonVariant;
		size?: ButtonSize;
		label: string;
		children?: Snippet;
	}

	let { direction, variant = 'nav', size = 'icon', label, children, ...rest }: Props = $props();

	const glyph = $derived(direction === 'prev' ? '\u2039' : '\u203A');
</script>

<Button {variant} {size} type="button" aria-label={label} {...rest}>
	{#if children}
		{@render children()}
	{:else}
		{glyph}
	{/if}
</Button>
