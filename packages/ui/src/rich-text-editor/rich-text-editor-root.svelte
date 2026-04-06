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

<!-- svelte-ignore css_unused_selector -->
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

	[data-part='toolbar'] {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(min-content, max-content));
		align-items: center;
		gap: var(--dry-space-1);
		padding: var(--dry-space-1) var(--dry-space-2);
		background: var(--dry-rte-toolbar-bg);
		border-bottom: 1px solid var(--dry-rte-border);
	}

	[data-part='toolbarGroup'] {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		align-items: center;
		gap: var(--dry-space-0_5);
	}

	[data-part='separator'] {
		height: var(--dry-space-5);
		border-inline-start: 1px solid var(--dry-rte-border);
		margin: 0 var(--dry-space-1);
	}

	[data-part='button'] {
		display: inline-grid;
		place-items: center;
		height: var(--dry-rte-button-size);
		aspect-ratio: 1;
		padding: 0;
		font-size: var(--dry-type-small-size, var(--dry-text-sm-size));
		font-family: var(--dry-font-sans);
		font-weight: 600;
		color: var(--dry-color-text-strong);
		background: transparent;
		border: none;
		border-radius: var(--dry-radius-md);
		cursor: pointer;
		transition:
			background var(--dry-duration-fast) var(--dry-ease-default),
			color var(--dry-duration-fast) var(--dry-ease-default);
		line-height: 1;
	}

	[data-part='button']:hover {
		background: var(--dry-color-bg-raised);
	}

	[data-part='button']:focus-visible {
		outline: 2px solid var(--dry-color-focus-ring);
		outline-offset: -2px;
	}

	[data-part='button'][data-active='true'] {
		background: var(--dry-color-fill-brand);
		color: var(--dry-color-on-brand);
	}

	[data-part='button'][data-active='true']:hover {
		background: var(--dry-color-fill-brand-hover);
	}

	[data-part='buttonItalic'] {
		font-style: italic;
	}

	[data-part='buttonUnderline'] {
		text-decoration: underline;
	}

	[data-part='buttonStrikethrough'] {
		text-decoration: line-through;
	}

	[data-part='content'] {
		min-height: 8rem;
		padding: var(--dry-rte-padding);
		font-family: var(--dry-font-sans);
		font-size: var(--dry-type-small-size, var(--dry-text-base-size));
		line-height: var(--dry-type-small-leading, var(--dry-text-base-leading));
		color: var(--dry-color-text-strong);
		outline: none;
		overflow-y: auto;
	}

	[data-part='content']:focus-visible {
		box-shadow: inset 0 0 0 2px var(--dry-color-focus-ring);
	}

	/* Placeholder when empty */
	[data-part='content']:empty::before {
		content: attr(data-placeholder);
		color: var(--dry-color-text-weak);
		pointer-events: none;
	}

	/* Typography inside the editor content */
	[data-part='content'] h1 {
		font-size: var(--dry-type-heading-2-size, var(--dry-text-2xl-size));
		font-weight: 700;
		line-height: 1.3;
		margin: 0 0 0.5em;
	}

	[data-part='content'] h2 {
		font-size: var(--dry-type-heading-3-size, var(--dry-text-xl-size));
		font-weight: 700;
		line-height: 1.35;
		margin: 0 0 0.5em;
	}

	[data-part='content'] h3 {
		font-size: var(--dry-type-heading-4-size, var(--dry-text-lg-size));
		font-weight: 600;
		line-height: 1.4;
		margin: 0 0 0.5em;
	}

	[data-part='content'] p {
		margin: 0 0 0.5em;
	}

	[data-part='content'] p:last-child {
		margin-bottom: 0;
	}

	[data-part='content'] ul,
	[data-part='content'] ol {
		margin: 0 0 0.5em;
		padding-left: 1.5em;
	}

	[data-part='content'] li {
		margin-bottom: 0.25em;
	}

	[data-part='content'] a {
		color: var(--dry-color-fill-brand);
		text-decoration: underline;
	}

	[data-part='content'] a:hover {
		text-decoration: none;
	}

	/* Link input popover */
	[data-part='linkPopover'] {
		display: grid;
		grid-template-columns: minmax(12rem, max-content) max-content max-content;
		align-items: center;
		gap: var(--dry-space-2);
		padding: var(--dry-space-2);
		background: var(--dry-color-bg-overlay);
		border: 1px solid var(--dry-rte-border);
		border-radius: var(--dry-radius-md);
		box-shadow: var(--dry-shadow-md);
		position: absolute;
		z-index: var(--dry-rte-popover-z-index);
	}

	[data-part='linkInput'] {
		font-family: var(--dry-font-sans);
		font-size: var(--dry-type-small-size, var(--dry-text-sm-size));
		padding: var(--dry-space-1) var(--dry-space-2);
		border: 1px solid var(--dry-rte-border);
		border-radius: var(--dry-radius-sm);
		outline: none;
		background: var(--dry-rte-content-bg);
		color: var(--dry-color-text-strong);
	}

	[data-part='linkInput']:focus {
		border-color: var(--dry-color-focus-ring);
		box-shadow: 0 0 0 1px var(--dry-color-focus-ring);
	}

	[data-part='linkApply'] {
		display: inline-grid;
		place-items: center;
		padding: var(--dry-space-1) var(--dry-space-2);
		font-family: var(--dry-font-sans);
		font-size: var(--dry-type-small-size, var(--dry-text-sm-size));
		background: var(--dry-color-fill-brand);
		color: var(--dry-color-on-brand);
		border: none;
		border-radius: var(--dry-radius-sm);
		cursor: pointer;
	}

	[data-part='linkApply']:hover {
		opacity: 0.9;
	}

	[data-part='linkApply']:focus-visible {
		outline: 2px solid var(--dry-color-focus-ring);
		outline-offset: 2px;
	}

	[data-part='linkCancel'] {
		display: inline-grid;
		place-items: center;
		padding: var(--dry-space-1) var(--dry-space-2);
		font-family: var(--dry-font-sans);
		font-size: var(--dry-type-small-size, var(--dry-text-sm-size));
		background: transparent;
		color: var(--dry-color-text-weak);
		border: 1px solid var(--dry-rte-border);
		border-radius: var(--dry-radius-sm);
		cursor: pointer;
	}

	[data-part='linkCancel']:hover {
		color: var(--dry-color-text-strong);
	}

	[data-part='linkCancel']:focus-visible {
		outline: 2px solid var(--dry-color-focus-ring);
		outline-offset: 2px;
	}
</style>
