<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';
	import { getCommandPaletteCtx } from './context.svelte.js';

	interface Props extends HTMLInputAttributes {
		placeholder?: string;
	}

	let { placeholder, ...rest }: Props = $props();

	const ctx = getCommandPaletteCtx();

	function getOrderedItemIds(): string[] {
		const entries = Array.from(ctx.getItems().entries());
		entries.sort((a, b) => {
			const position = a[1].compareDocumentPosition(b[1]);
			if (position & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
			if (position & Node.DOCUMENT_POSITION_PRECEDING) return 1;
			return 0;
		});
		return entries.map(([id]) => id);
	}

	function getEnabledItemIds(): string[] {
		return getOrderedItemIds().filter((id) => {
			const el = ctx.getItems().get(id);
			return el && !el.hasAttribute('data-disabled');
		});
	}

	function handleKeydown(e: KeyboardEvent) {
		const enabledIds = getEnabledItemIds();
		if (enabledIds.length === 0) return;

		if (e.key === 'ArrowDown') {
			e.preventDefault();
			const currentIndex = enabledIds.indexOf(ctx.activeItemId);
			const nextIndex = currentIndex < enabledIds.length - 1 ? currentIndex + 1 : 0;
			ctx.setActiveItem(enabledIds[nextIndex]!);
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			const currentIndex = enabledIds.indexOf(ctx.activeItemId);
			const prevIndex = currentIndex > 0 ? currentIndex - 1 : enabledIds.length - 1;
			ctx.setActiveItem(enabledIds[prevIndex]!);
		} else if (e.key === 'Enter') {
			e.preventDefault();
			if (ctx.activeItemId) {
				const el = ctx.getItems().get(ctx.activeItemId);
				if (el && !el.hasAttribute('data-disabled')) {
					el.click();
				}
			}
		} else if (e.key === 'Escape') {
			e.preventDefault();
			ctx.close();
		}
	}
</script>

<input
	type="text"
	role="combobox"
	{placeholder}
	autocomplete="off"
	id={ctx.inputId}
	aria-expanded={ctx.open}
	aria-controls={ctx.listId}
	aria-activedescendant={ctx.activeItemId || undefined}
	bind:value={ctx.query}
	onkeydown={handleKeydown}
	{...rest}
/>
