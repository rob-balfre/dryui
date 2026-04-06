<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { RichTextEditor as RichTextEditorPrimitive } from '@dryui/primitives/rich-text-editor';

	interface Props extends HTMLAttributes<HTMLDivElement> {}

	let { ...rest }: Props = $props();
</script>

<RichTextEditorPrimitive.Content data-part="content" {...rest} />

<style>
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
</style>
