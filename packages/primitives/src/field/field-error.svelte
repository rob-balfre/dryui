<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getFormControlCtx } from '../utils/form-control.svelte.js';

	interface Props extends HTMLAttributes<HTMLParagraphElement> {
		children: Snippet;
	}

	let { children, ...rest }: Props = $props();

	const ctx = getFormControlCtx();

	function registerError() {
		ctx?.registerError(true);
		return () => {
			ctx?.registerError(false);
		};
	}
</script>

{#if ctx?.hasError}
	<p {@attach registerError} id={ctx.errorId} role="alert" {...rest}>
		{@render children()}
	</p>
{/if}
