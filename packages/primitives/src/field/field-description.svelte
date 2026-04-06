<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getFormControlCtx } from '../utils/form-control.svelte.js';

	interface Props extends HTMLAttributes<HTMLParagraphElement> {
		children: Snippet;
	}

	let { children, ...rest }: Props = $props();

	const ctx = getFormControlCtx();

	function registerDescription() {
		ctx?.registerDescription(true);
		return () => {
			ctx?.registerDescription(false);
		};
	}
</script>

<p {@attach registerDescription} id={ctx?.descriptionId} {...rest}>
	{@render children()}
</p>
