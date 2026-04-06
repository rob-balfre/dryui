<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { getAffixGroupCtx } from './context.svelte.js';

	interface Props extends HTMLButtonAttributes {
		children?: Snippet;
	}

	let { disabled = false, children, type = 'button', ...rest }: Props = $props();

	const ctx = getAffixGroupCtx();

	let isDisabled = $derived(disabled || ctx.disabled);
</script>

<button
	{type}
	disabled={isDisabled}
	data-part="action"
	data-size={ctx.size}
	data-disabled={isDisabled || undefined}
	data-invalid={ctx.invalid || undefined}
	{...rest}
>
	{@render children?.()}
</button>
