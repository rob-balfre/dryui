<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { getRichTextEditorCtx } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {}

	let { ...rest }: Props = $props();

	const ctx = getRichTextEditorCtx();

	let contentEl = $state<HTMLDivElement>();

	// Register the content element with the context
	$effect(() => {
		if (contentEl) {
			ctx.contentEl = contentEl;
		}
	});

	// Sync initial value into contenteditable
	$effect(() => {
		if (contentEl && ctx.html && contentEl.innerHTML !== ctx.html) {
			// Only set innerHTML if the editor is not focused (avoid clobbering user edits)
			if (document.activeElement !== contentEl) {
				contentEl.innerHTML = ctx.html;
			}
		}
	});

	// Listen for selectionchange on document to track formatting state
	$effect(() => {
		if (!contentEl) return;

		function onSelectionChange() {
			const sel = window.getSelection();
			if (!sel || sel.rangeCount === 0) return;
			// Only update if selection is inside our editor
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
				// For Ctrl+K, dispatch a custom event so the UI layer can show a link dialog
				contentEl?.dispatchEvent(new CustomEvent('rte-link-request', { bubbles: true }));
				break;
		}
	}
</script>

<div
	bind:this={contentEl}
	contenteditable={!ctx.readonly}
	role="textbox"
	aria-multiline="true"
	aria-placeholder={ctx.placeholder || undefined}
	data-placeholder={ctx.placeholder || undefined}
	data-rte-content
	data-readonly={ctx.readonly || undefined}
	oninput={handleInput}
	onkeydown={handleKeydown}
	{...rest}
></div>
