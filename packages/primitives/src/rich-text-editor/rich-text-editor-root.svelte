<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { setRichTextEditorCtx } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		value?: string;
		placeholder?: string;
		readonly?: boolean;
		children: Snippet;
	}

	let {
		value = $bindable(''),
		placeholder = '',
		readonly: readonlyProp = false,
		children,
		...rest
	}: Props = $props();

	let isBold = $state(false);
	let isItalic = $state(false);
	let isUnderline = $state(false);
	let isStrikethrough = $state(false);
	let isOrderedList = $state(false);
	let isUnorderedList = $state(false);
	let currentHeading = $state<string | null>(null);
	let currentLink = $state<string | null>(null);

	function execCommand(command: string, cmdValue?: string) {
		if (readonlyProp) return;
		// Ensure focus is on the content area
		ctx.contentEl?.focus();
		document.execCommand(command, false, cmdValue);
		updateState();
		syncValue();
	}

	function updateState() {
		isBold = document.queryCommandState('bold');
		isItalic = document.queryCommandState('italic');
		isUnderline = document.queryCommandState('underline');
		isStrikethrough = document.queryCommandState('strikethrough');
		isOrderedList = document.queryCommandState('insertOrderedList');
		isUnorderedList = document.queryCommandState('insertUnorderedList');

		// Detect heading
		const block = document.queryCommandValue('formatBlock');
		if (block && /^h[1-3]$/i.test(block)) {
			currentHeading = block.toLowerCase();
		} else {
			currentHeading = null;
		}

		// Detect link
		const sel = window.getSelection();
		if (sel && sel.rangeCount > 0) {
			let node: Node | null = sel.anchorNode;
			while (node && node !== ctx.contentEl) {
				if (node instanceof HTMLAnchorElement) {
					currentLink = node.href;
					return;
				}
				node = node.parentNode;
			}
		}
		currentLink = null;
	}

	function syncValue() {
		if (ctx.contentEl) {
			value = ctx.contentEl.innerHTML;
		}
	}

	const ctx = setRichTextEditorCtx({
		get isBold() {
			return isBold;
		},
		get isItalic() {
			return isItalic;
		},
		get isUnderline() {
			return isUnderline;
		},
		get isStrikethrough() {
			return isStrikethrough;
		},
		get isOrderedList() {
			return isOrderedList;
		},
		get isUnorderedList() {
			return isUnorderedList;
		},
		get currentHeading() {
			return currentHeading;
		},
		get currentLink() {
			return currentLink;
		},
		get html() {
			return value;
		},
		get readonly() {
			return readonlyProp;
		},
		get placeholder() {
			return placeholder;
		},
		contentEl: null,
		execCommand,
		toggleBold() {
			execCommand('bold');
		},
		toggleItalic() {
			execCommand('italic');
		},
		toggleUnderline() {
			execCommand('underline');
		},
		toggleStrikethrough() {
			execCommand('strikethrough');
		},
		toggleOrderedList() {
			execCommand('insertOrderedList');
		},
		toggleUnorderedList() {
			execCommand('insertUnorderedList');
		},
		setHeading(level: 'h1' | 'h2' | 'h3' | 'p') {
			if (level === 'p') {
				execCommand('formatBlock', 'p');
			} else {
				// Toggle heading: if already this level, go back to paragraph
				if (currentHeading === level) {
					execCommand('formatBlock', 'p');
				} else {
					execCommand('formatBlock', level);
				}
			}
		},
		insertLink(url: string) {
			if (readonlyProp) return;
			const sel = window.getSelection();
			if (!sel || sel.rangeCount === 0) return;

			// If no text selected, insert the URL as link text
			if (sel.isCollapsed) {
				const a = document.createElement('a');
				a.href = url;
				a.textContent = url;
				a.target = '_blank';
				a.rel = 'noopener noreferrer';
				const range = sel.getRangeAt(0);
				range.insertNode(a);
				// Move cursor after the link
				range.setStartAfter(a);
				range.collapse(true);
				sel.removeAllRanges();
				sel.addRange(range);
			} else {
				document.execCommand('createLink', false, url);
				// Add target and rel to newly created links
				if (ctx.contentEl) {
					const links = ctx.contentEl.querySelectorAll('a[href="' + CSS.escape(url) + '"]');
					links.forEach((link) => {
						link.setAttribute('target', '_blank');
						link.setAttribute('rel', 'noopener noreferrer');
					});
				}
			}
			updateState();
			syncValue();
		},
		removeLink() {
			execCommand('unlink');
		},
		getContent() {
			return ctx.contentEl?.innerHTML ?? '';
		},
		updateState,
		syncValue
	});
</script>

<div data-rte-root data-readonly={readonlyProp || undefined} {...rest}>
	{@render children()}
</div>
