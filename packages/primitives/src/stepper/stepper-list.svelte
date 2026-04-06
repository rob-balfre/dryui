<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getStepperCtx } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLOListElement> {
		children: Snippet;
	}

	let { children, ...rest }: Props = $props();

	const ctx = getStepperCtx();
</script>

<ol role="list" data-orientation={ctx.orientation} {...rest}>
	{@render children()}
</ol>
