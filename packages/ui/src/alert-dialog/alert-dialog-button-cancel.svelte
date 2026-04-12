<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import Button from '../button/button.svelte';
	import { getAlertDialogCtx } from './context.svelte.js';

	interface Props extends HTMLButtonAttributes {
		children: Snippet;
	}

	let { children, ...rest }: Props = $props();

	const ctx = getAlertDialogCtx();
</script>

<Button {...rest} variant="outline" onclick={() => ctx.close()}>
	{@render children()}
</Button>
