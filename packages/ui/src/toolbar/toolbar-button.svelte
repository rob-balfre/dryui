<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import Button from '../button/button.svelte';

	interface Props extends HTMLButtonAttributes {
		disabled?: boolean;
		children: Snippet;
	}

	let { disabled = false, children, ...rest }: Props = $props();
</script>

<Button variant="trigger" size="sm" type="button" tabindex={-1} {disabled} {...rest}>
	{@render children()}
</Button>
