<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import Button from '../button/button.svelte';

	interface Props extends HTMLButtonAttributes {
		children: Snippet;
	}

	let { children, ...rest }: Props = $props();
</script>

<Button {...rest} variant="solid" color="danger">
	{@render children()}
</Button>
