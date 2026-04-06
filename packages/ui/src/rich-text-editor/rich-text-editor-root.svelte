<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { RichTextEditor as RichTextEditorPrimitive } from '@dryui/primitives/rich-text-editor';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		value?: string;
		placeholder?: string;
		readonly?: boolean;
		children: Snippet;
	}

	let { value = $bindable(''), children, ...rest }: Props = $props();
</script>

<RichTextEditorPrimitive.Root bind:value data-part="root" {children} {...rest} />

<style>
	[data-part='root'] {
		--dry-rte-border: var(--dry-color-stroke-weak);
		--dry-rte-radius: var(--dry-radius-lg);
		--dry-rte-toolbar-bg: var(--dry-color-bg-overlay);
		--dry-rte-content-bg: var(--dry-color-bg-raised);
		--dry-rte-button-size: var(--dry-space-9);
		--dry-rte-padding: var(--dry-space-4);
		--dry-rte-popover-z-index: var(--dry-layer-overlay);

		border: 1px solid var(--dry-rte-border);
		border-radius: var(--dry-rte-radius);
		overflow: hidden;
		background: var(--dry-rte-content-bg);
	}

	[data-part='root'][data-readonly] {
		opacity: 0.7;
		pointer-events: none;
	}
</style>
