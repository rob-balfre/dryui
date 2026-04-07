<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { setRichTextEditorCtx } from '@dryui/primitives/rich-text-editor';

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

		const block = document.queryCommandValue('formatBlock');
		if (block && /^h[1-3]$/i.test(block)) {
			currentHeading = block.toLowerCase();
		} else {
			currentHeading = null;
		}

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

			if (sel.isCollapsed) {
				const a = document.createElement('a');
				a.href = url;
				a.textContent = url;
				a.target = '_blank';
				a.rel = 'noopener noreferrer';
				const range = sel.getRangeAt(0);
				range.insertNode(a);
				range.setStartAfter(a);
				range.collapse(true);
				sel.removeAllRanges();
				sel.addRange(range);
			} else {
				document.execCommand('createLink', false, url);
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

<div data-part="root" data-rte-root data-readonly={readonlyProp || undefined} {...rest}>
	{@render children()}
</div>

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
