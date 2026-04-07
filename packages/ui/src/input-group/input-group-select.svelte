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
	data-orientation={ctx.orientation}
>
	<select bind:value class={className} data-input-group-select {...rest}>
		{@render children?.()}
	</select>
	<span data-input-group-caret aria-hidden="true"></span>
</div>

<style>
	[data-input-group-selectWrap] {
		position: relative;
	}

	[data-input-group-selectWrap][data-orientation='horizontal'] {
		grid-column: 6;
	}

	[data-input-group-select] {
		display: inline-grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		align-items: center;
		gap: 0.5rem;
		padding: var(--dry-input-group-padding-y) calc(var(--dry-input-group-padding-x) * 1.75)
			var(--dry-input-group-padding-y) var(--dry-input-group-padding-x);
		white-space: nowrap;
		appearance: none;
		border: 0;
		background: transparent;
		color: var(--dry-color-text-strong);
		font: inherit;
		font-size: var(--dry-input-group-font-size);
		line-height: 1.4;
		outline: none;
		cursor: pointer;
	}

	[data-input-group-caret] {
		position: absolute;
		right: 0.875rem;
		top: 50%;
		aspect-ratio: 1;
		height: 0.5rem;
		border-right: 1.5px solid currentColor;
		border-bottom: 1.5px solid currentColor;
		transform: translateY(-65%) rotate(45deg);
		pointer-events: none;
	}
</style>
