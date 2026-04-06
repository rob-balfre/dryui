<script lang="ts">
	import type { HTMLSelectAttributes } from 'svelte/elements';
	import type { Snippet } from 'svelte';
	import { getAffixGroupCtx } from './context.svelte.js';

	interface Props extends HTMLSelectAttributes {
		value?: string;
		children?: Snippet;
	}

	let { value = $bindable(''), class: className, children, ...rest }: Props = $props();

	const ctx = getAffixGroupCtx();
</script>

<div
	data-part="suffix"
	data-input-group-selectWrap
	data-size={ctx.size}
	data-disabled={ctx.disabled || undefined}
	data-invalid={ctx.invalid || undefined}
>
	<select bind:value class={className} data-input-group-select {...rest}>
		{@render children?.()}
	</select>
	<span data-input-group-caret aria-hidden="true"></span>
</div>
