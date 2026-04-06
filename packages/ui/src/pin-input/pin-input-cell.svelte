<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getPinInputCtx } from './context.svelte.js';
	import type { PinInputCell } from './context.svelte.js';

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
		cell: PinInputCell;
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
			<span>&bull;</span>
		{:else}
			<span>{cell.char}</span>
		{/if}
	{:else if cell.hasFakeCaret}
		<div data-pin-input-caret></div>
	{:else}
		<span data-pin-input-placeholder>{ctx.placeholder}</span>
	{/if}
</div>

<style>
	[data-pin-input-cell] {
		display: grid;
		place-items: center;
		aspect-ratio: 1;
		height: var(--dry-pin-size);
		font-size: var(--dry-pin-font-size);
		font-family: var(--dry-font-mono);
		font-weight: 500;
		color: var(--dry-color-text-strong);
		background: var(--dry-pin-bg);
		box-sizing: border-box;
		position: relative;
		user-select: none;
		border: var(--dry-pin-cell-border, 2px solid var(--dry-pin-border));
		border-bottom: var(--dry-pin-cell-border-bottom, none);
		border-radius: var(--dry-pin-cell-radius, var(--dry-pin-radius));
		transition:
			border-color var(--dry-duration-fast) var(--dry-ease-default),
			box-shadow var(--dry-duration-fast) var(--dry-ease-default),
			background var(--dry-duration-fast) var(--dry-ease-default);
	}

	[data-pin-input-placeholder] {
		color: var(--dry-color-text-weak);
	}

	[data-pin-input-cell][data-state='filled'] {
		border-color: var(--dry-color-stroke-strong);
		background: var(--dry-color-bg-raised);
	}

	[data-pin-input-cell][data-active] {
		border-color: var(--dry-color-fill-brand);
		z-index: 2;
		outline: 2px solid var(--dry-color-focus-ring);
		outline-offset: -2px;
	}

	[data-pin-input-cell][data-error] {
		border-color: var(--dry-color-fill-error);
	}

	[data-pin-input-cell][data-error][data-active] {
		outline-color: var(--dry-color-fill-error);
		border-color: var(--dry-color-fill-error);
	}

	[data-pin-input-caret] {
		height: 60%;
		border-inline-start: 2px solid var(--dry-pin-caret-color);
		animation: caret-blink 1.25s ease-out infinite;
	}

	@keyframes caret-blink {
		0%,
		70%,
		100% {
			opacity: 1;
		}
		20%,
		50% {
			opacity: 0;
		}
	}
</style>
