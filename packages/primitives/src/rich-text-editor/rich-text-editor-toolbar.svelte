<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getRichTextEditorCtx } from './context.svelte.js';

	interface ToolbarSnippetParams {
		isBold: boolean;
		isItalic: boolean;
		isUnderline: boolean;
		isStrikethrough: boolean;
		isOrderedList: boolean;
		isUnorderedList: boolean;
		currentHeading: string | null;
		currentLink: string | null;
		toggleBold: () => void;
		toggleItalic: () => void;
		toggleUnderline: () => void;
		toggleStrikethrough: () => void;
		toggleOrderedList: () => void;
		toggleUnorderedList: () => void;
		setHeading: (level: 'h1' | 'h2' | 'h3' | 'p') => void;
		insertLink: (url: string) => void;
		removeLink: () => void;
	}

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
		children: Snippet<[ToolbarSnippetParams]>;
	}

	let { children, ...rest }: Props = $props();

	const ctx = getRichTextEditorCtx();

	let toolbarEl: HTMLDivElement;

	// Roving tabindex keyboard navigation
	function getFocusableItems(toolbar: HTMLElement): HTMLElement[] {
		return Array.from(
			toolbar.querySelectorAll<HTMLElement>(
				'button:not([disabled]), [role="button"]:not([disabled])'
			)
		);
	}

	$effect(() => {
		if (!toolbarEl) return;
		const items = getFocusableItems(toolbarEl);
		if (items.length > 0 && !items.some((el) => el.getAttribute('tabindex') === '0')) {
			items[0]!.setAttribute('tabindex', '0');
		}
	});

	function handleKeydown(event: KeyboardEvent) {
		const toolbar = event.currentTarget as HTMLElement;
		const items = getFocusableItems(toolbar);
		if (items.length === 0) return;

		const currentIndex = items.indexOf(event.target as HTMLElement);
		if (currentIndex === -1) return;

		let nextIndex: number | null = null;

		if (event.key === 'ArrowLeft') {
			nextIndex = currentIndex - 1 < 0 ? items.length - 1 : currentIndex - 1;
		} else if (event.key === 'ArrowRight') {
			nextIndex = currentIndex + 1 >= items.length ? 0 : currentIndex + 1;
		} else if (event.key === 'Home') {
			nextIndex = 0;
		} else if (event.key === 'End') {
			nextIndex = items.length - 1;
		}

		if (nextIndex !== null) {
			event.preventDefault();
			items[currentIndex]!.setAttribute('tabindex', '-1');
			items[nextIndex]!.setAttribute('tabindex', '0');
			items[nextIndex]!.focus();
		}
	}

	const snippetParams: ToolbarSnippetParams = {
		get isBold() {
			return ctx.isBold;
		},
		get isItalic() {
			return ctx.isItalic;
		},
		get isUnderline() {
			return ctx.isUnderline;
		},
		get isStrikethrough() {
			return ctx.isStrikethrough;
		},
		get isOrderedList() {
			return ctx.isOrderedList;
		},
		get isUnorderedList() {
			return ctx.isUnorderedList;
		},
		get currentHeading() {
			return ctx.currentHeading;
		},
		get currentLink() {
			return ctx.currentLink;
		},
		toggleBold: () => ctx.toggleBold(),
		toggleItalic: () => ctx.toggleItalic(),
		toggleUnderline: () => ctx.toggleUnderline(),
		toggleStrikethrough: () => ctx.toggleStrikethrough(),
		toggleOrderedList: () => ctx.toggleOrderedList(),
		toggleUnorderedList: () => ctx.toggleUnorderedList(),
		setHeading: (level) => ctx.setHeading(level),
		insertLink: (url) => ctx.insertLink(url),
		removeLink: () => ctx.removeLink()
	};
</script>

<div
	bind:this={toolbarEl}
	role="toolbar"
	aria-orientation="horizontal"
	aria-label="Text formatting"
	data-rte-toolbar
	onkeydown={handleKeydown}
	{...rest}
>
	{@render children(snippetParams)}
</div>
