<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import Button from '../button/button.svelte';
	import { getAffixGroupCtx } from './context.svelte.js';

	interface Props extends HTMLButtonAttributes {
		children?: Snippet;
	}

	let { disabled = false, children, type = 'button', ...rest }: Props = $props();

	const ctx = getAffixGroupCtx();

	let isDisabled = $derived(disabled || ctx.disabled);
</script>

<Button
	variant="trigger"
	{type}
	disabled={isDisabled}
	data-size={ctx.size}
	data-invalid={ctx.invalid || undefined}
	data-orientation={ctx.orientation}
	data-input-group-action
	{...rest}
>
	{@render children?.()}
</Button>
