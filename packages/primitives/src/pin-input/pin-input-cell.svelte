<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getPinInputCtx, type PinInputCellState } from './context.svelte.js';

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
		cell: PinInputCellState;
		children?: Snippet<[{ char: string | null; isActive: boolean; hasFakeCaret: boolean }]>;
	}

	let { cell, children, class: className, ...rest }: Props = $props();

	const ctx = getPinInputCtx();
</script>

<div
	data-pin-input-cell
	data-active={cell.isActive || undefined}
	data-inactive={!cell.isActive || undefined}
	data-state={cell.char ? 'filled' : 'empty'}
	data-disabled={ctx.disabled || undefined}
	data-error={ctx.hasError || undefined}
	data-mask={ctx.mask || undefined}
	aria-hidden="true"
	class={className}
	{...rest}
>
	{#if children}
		{@render children({
			char: cell.char,
			isActive: cell.isActive,
			hasFakeCaret: cell.hasFakeCaret
		})}
	{:else if cell.char}
		{#if ctx.mask}
			<span>•</span>
		{:else}
			<span>{cell.char}</span>
		{/if}
	{:else if cell.hasFakeCaret}
		<div data-pin-input-caret></div>
	{:else}
		<span data-pin-input-placeholder>{ctx.placeholder}</span>
	{/if}
</div>
