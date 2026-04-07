<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';
	import { getAffixGroupCtx } from './context.svelte.js';

	interface Props extends HTMLInputAttributes {
		value?: string;
	}

	let { value = $bindable(''), class: className, ...rest }: Props = $props();

	const ctx = getAffixGroupCtx();
</script>

<div
	data-part="input"
	data-size={ctx.size}
	data-disabled={ctx.disabled || undefined}
	data-invalid={ctx.invalid || undefined}
	data-orientation={ctx.orientation}
	data-input-group-inputWrap
>
	<input
		bind:value
		disabled={ctx.disabled || undefined}
		data-input-group-input
		class={className}
		{...rest}
	/>
</div>

<style>
	[data-input-group-inputWrap] {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		align-items: center;
	}

	[data-input-group-inputWrap][data-orientation='horizontal'] {
		grid-column: 2;
	}

	[data-input-group-input] {
		border: 0;
		background: transparent;
		color: inherit;
		font: inherit;
		font-size: var(--dry-input-group-font-size);
		line-height: 1.4;
		padding: var(--dry-input-group-padding-y) var(--dry-input-group-padding-x);
		outline: none;
		box-sizing: border-box;
	}

	[data-input-group-input]::placeholder {
		color: var(--dry-input-group-muted);
	}
</style>
