<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getCommandPaletteCtx } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		value: string;
		disabled?: boolean;
		onSelect?: () => void;
		children: Snippet;
	}

	let { value, disabled, onSelect, children, ...rest }: Props = $props();

	const ctx = getCommandPaletteCtx();
	const uid = $props.id();
	const id = `cmd-item-${uid}`;

	let el = $state<HTMLElement>();

	let visible = $derived.by(() => {
		const q = ctx.query.toLowerCase().trim();
		if (!q) return true;
		return value.toLowerCase().includes(q);
	});

	$effect(() => {
		if (el) {
			ctx.registerItem(id, el);
			return () => ctx.unregisterItem(id);
		}
	});
</script>

{#if visible}
	<div
		bind:this={el}
		{id}
		role="option"
		aria-selected={ctx.activeItemId === id}
		data-disabled={disabled || undefined}
		data-active={ctx.activeItemId === id || undefined}
		data-value={value}
		onpointerenter={() => {
			if (!disabled) {
				ctx.setActiveItem(id);
			}
		}}
		onclick={() => {
			if (!disabled) {
				onSelect?.();
				ctx.close();
			}
		}}
		{...rest}
	>
		{@render children()}
	</div>
{/if}
