<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import {
		getRichTextEditorCtx,
		setSanitizedRichTextHtml
	} from '@dryui/primitives/rich-text-editor';

	interface Props extends HTMLAttributes<HTMLDivElement> {}

	let { ...rest }: Props = $props();

	const ctx = getRichTextEditorCtx();

	let contentEl = $state<HTMLDivElement>();

	// Register the content element with the context
	$effect(() => {
		if (!contentEl) return;
		ctx.contentEl = contentEl;
		return () => {
			if (ctx.contentEl === contentEl) ctx.contentEl = null;
		};
	});

	// Sync value into contenteditable (also clears hint elements on mount)
	$effect(() => {
		if (!contentEl) return;
		const html = ctx.sanitizeHtml(ctx.html || '');
		if (contentEl.innerHTML !== html && document.activeElement !== contentEl) {
			setSanitizedRichTextHtml(contentEl, html);
		}
	});

	// Listen for selectionchange on document to track formatting state
	$effect(() => {
		if (!contentEl) return;

		function onSelectionChange() {
			const sel = window.getSelection();
			if (!sel || sel.rangeCount === 0) return;
			if (contentEl!.contains(sel.anchorNode)) {
				ctx.updateState();
			}
		}

		document.addEventListener('selectionchange', onSelectionChange);
		return () => {
			document.removeEventListener('selectionchange', onSelectionChange);
		};
	});

	function handleInput() {
		ctx.updateState();
		ctx.syncValue();
	}

	function handleKeydown(event: KeyboardEvent) {
		if (ctx.readonly) return;

		const mod = event.metaKey || event.ctrlKey;
		if (!mod) return;

		switch (event.key.toLowerCase()) {
			case 'b':
				event.preventDefault();
				ctx.toggleBold();
				break;
			case 'i':
				event.preventDefault();
				ctx.toggleItalic();
				break;
			case 'u':
				event.preventDefault();
				ctx.toggleUnderline();
				break;
			case 'k':
				event.preventDefault();
				contentEl?.dispatchEvent(new CustomEvent('rte-link-request', { bubbles: true }));
				break;
		}
	}
</script>

<!--
	The elements below (h1–h3, p, ul, ol, li, a) are created dynamically by the
	browser's execCommand API inside the contenteditable div. They are declared
	here so Svelte can verify the scoped CSS selectors that style them. The
	$effect that syncs ctx.html into innerHTML replaces these on mount.
-->
<div
	bind:this={contentEl}
	contenteditable={!ctx.readonly}
	role="textbox"
	aria-multiline="true"
	aria-placeholder={ctx.placeholder || undefined}
	data-placeholder={ctx.placeholder || undefined}
	data-part="content"
	data-rte-content
	data-readonly={ctx.readonly || undefined}
	oninput={handleInput}
	onkeydown={handleKeydown}
	{...rest}
>
	<!-- dryui-allow raw-heading: hidden seed nodes make Svelte retain scoped styles for sanitized contenteditable HTML. -->
	<h1>.</h1>
	<!-- dryui-allow raw-heading: hidden seed nodes make Svelte retain scoped styles for sanitized contenteditable HTML. -->
	<h2>.</h2>
	<!-- dryui-allow raw-heading: hidden seed nodes make Svelte retain scoped styles for sanitized contenteditable HTML. -->
	<h3>.</h3>
	<p></p>
	<ul><li></li></ul>
	<ol><li></li></ol>
	<a aria-hidden="true" href="https://example.com">.</a>
</div>

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

	/* Typography for contenteditable elements created by execCommand */
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
