<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';

	interface Props extends HTMLButtonAttributes {
		disabled?: boolean;
		children: Snippet;
	}

	let { disabled = false, children, ...rest }: Props = $props();
</script>

<button type="button" {disabled} data-disabled={disabled || undefined} tabindex={-1} {...rest}>
	{@render children()}
</button>
