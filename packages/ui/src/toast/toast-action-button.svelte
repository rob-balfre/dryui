<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import Button from '../button/button.svelte';

	interface Props extends HTMLAttributes<HTMLButtonElement> {
		children: Snippet;
		onclick?: () => void;
	}

	let { children, ...rest }: Props = $props();
</script>

<Button variant="trigger" size="sm" type="button" data-toast-action {...rest}>
	{@render children()}
</Button>
