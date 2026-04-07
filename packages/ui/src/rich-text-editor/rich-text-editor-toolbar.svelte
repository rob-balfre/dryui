<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { getRichTextEditorCtx } from '@dryui/primitives/rich-text-editor';

	interface Props extends HTMLAttributes<HTMLDivElement> {}

	let { ...rest }: Props = $props();

	const ctx = getRichTextEditorCtx();

	let toolbarEl: HTMLDivElement;

	let showLinkInput = $state(false);
	let linkUrl = $state('');
	let linkInputEl = $state<HTMLInputElement>();
	let savedSelection = $state<Range | null>(null);

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

	function openLinkInput(currentLink: string | null) {
		const sel = window.getSelection();
		if (sel && sel.rangeCount > 0) {
			savedSelection = sel.getRangeAt(0).cloneRange();
		}
		linkUrl = currentLink ?? 'https://';
		showLinkInput = true;
		requestAnimationFrame(() => {
			linkInputEl?.focus();
			linkInputEl?.select();
		});
	}

	function closeLinkInput() {
		showLinkInput = false;
		linkUrl = '';
		savedSelection = null;
	}

	function restoreSelection() {
		if (savedSelection) {
			const sel = window.getSelection();
			if (sel) {
				sel.removeAllRanges();
				sel.addRange(savedSelection);
			}
		}
	}
</script>

<div
	bind:this={toolbarEl}
	role="toolbar"
	aria-orientation="horizontal"
	aria-label="Text formatting"
	data-part="toolbar"
	data-rte-toolbar
	onkeydown={handleKeydown}
	{...rest}
>
	<div data-part="toolbarGroup">
		<button
			type="button"
			data-part="button"
			data-active={ctx.isBold}
			aria-pressed={ctx.isBold}
			aria-label="Bold"
			title="Bold (Ctrl+B)"
			tabindex={-1}
			onmousedown={(e) => e.preventDefault()}
			onclick={() => ctx.toggleBold()}><strong>B</strong></button
		>

		<button
			type="button"
			data-part="button"
			data-format="italic"
			data-active={ctx.isItalic}
			aria-pressed={ctx.isItalic}
			aria-label="Italic"
			title="Italic (Ctrl+I)"
			tabindex={-1}
			onmousedown={(e) => e.preventDefault()}
			onclick={() => ctx.toggleItalic()}>I</button
		>

		<button
			type="button"
			data-part="button"
			data-format="underline"
			data-active={ctx.isUnderline}
			aria-pressed={ctx.isUnderline}
			aria-label="Underline"
			title="Underline (Ctrl+U)"
			tabindex={-1}
			onmousedown={(e) => e.preventDefault()}
			onclick={() => ctx.toggleUnderline()}>U</button
		>

		<button
			type="button"
			data-part="button"
			data-format="strikethrough"
			data-active={ctx.isStrikethrough}
			aria-pressed={ctx.isStrikethrough}
			aria-label="Strikethrough"
			title="Strikethrough"
			tabindex={-1}
			onmousedown={(e) => e.preventDefault()}
			onclick={() => ctx.toggleStrikethrough()}>S</button
		>
	</div>

	<div data-part="separator" role="separator"></div>

	<div data-part="toolbarGroup">
		<button
			type="button"
			data-part="button"
			data-active={ctx.currentHeading === 'h1'}
			aria-pressed={ctx.currentHeading === 'h1'}
			aria-label="Heading 1"
			title="Heading 1"
			tabindex={-1}
			onmousedown={(e) => e.preventDefault()}
			onclick={() => ctx.setHeading('h1')}>H1</button
		>

		<button
			type="button"
			data-part="button"
			data-active={ctx.currentHeading === 'h2'}
			aria-pressed={ctx.currentHeading === 'h2'}
			aria-label="Heading 2"
			title="Heading 2"
			tabindex={-1}
			onmousedown={(e) => e.preventDefault()}
			onclick={() => ctx.setHeading('h2')}>H2</button
		>

		<button
			type="button"
			data-part="button"
			data-active={ctx.currentHeading === 'h3'}
			aria-pressed={ctx.currentHeading === 'h3'}
			aria-label="Heading 3"
			title="Heading 3"
			tabindex={-1}
			onmousedown={(e) => e.preventDefault()}
			onclick={() => ctx.setHeading('h3')}>H3</button
		>
	</div>

	<div data-part="separator" role="separator"></div>

	<div data-part="toolbarGroup">
		<button
			type="button"
			data-part="button"
			data-active={ctx.isUnorderedList}
			aria-pressed={ctx.isUnorderedList}
			aria-label="Bullet list"
			title="Bullet list"
			tabindex={-1}
			onmousedown={(e) => e.preventDefault()}
			onclick={() => ctx.toggleUnorderedList()}
		>
			<svg
				width="16"
				height="16"
				viewBox="0 0 16 16"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				aria-hidden="true"
			>
				<circle cx="3" cy="4" r="1" fill="currentColor" stroke="none" />
				<circle cx="3" cy="8" r="1" fill="currentColor" stroke="none" />
				<circle cx="3" cy="12" r="1" fill="currentColor" stroke="none" />
				<line x1="6.5" y1="4" x2="14" y2="4" />
				<line x1="6.5" y1="8" x2="14" y2="8" />
				<line x1="6.5" y1="12" x2="14" y2="12" />
			</svg>
		</button>

		<button
			type="button"
			data-part="button"
			data-active={ctx.isOrderedList}
			aria-pressed={ctx.isOrderedList}
			aria-label="Numbered list"
			title="Numbered list"
			tabindex={-1}
			onmousedown={(e) => e.preventDefault()}
			onclick={() => ctx.toggleOrderedList()}
		>
			<svg
				width="16"
				height="16"
				viewBox="0 0 16 16"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				aria-hidden="true"
			>
				<text
					x="1"
					y="5.5"
					font-size="5"
					fill="currentColor"
					stroke="none"
					font-family="sans-serif"
					font-weight="bold">1</text
				>
				<text
					x="1"
					y="9.5"
					font-size="5"
					fill="currentColor"
					stroke="none"
					font-family="sans-serif"
					font-weight="bold">2</text
				>
				<text
					x="1"
					y="13.5"
					font-size="5"
					fill="currentColor"
					stroke="none"
					font-family="sans-serif"
					font-weight="bold">3</text
				>
				<line x1="6.5" y1="4" x2="14" y2="4" />
				<line x1="6.5" y1="8" x2="14" y2="8" />
				<line x1="6.5" y1="12" x2="14" y2="12" />
			</svg>
		</button>
	</div>

	<div data-part="separator" role="separator"></div>

	<div data-part="toolbarGroup" class="toolbarGroupRelative">
		<button
			type="button"
			data-part="button"
			data-active={ctx.currentLink !== null}
			aria-pressed={ctx.currentLink !== null}
			aria-label={ctx.currentLink ? 'Edit link' : 'Insert link'}
			title="Link (Ctrl+K)"
			tabindex={-1}
			onmousedown={(e) => e.preventDefault()}
			onclick={() => {
				if (ctx.currentLink) {
					openLinkInput(ctx.currentLink);
				} else {
					openLinkInput(null);
				}
			}}
		>
			<svg
				width="16"
				height="16"
				viewBox="0 0 16 16"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				aria-hidden="true"
			>
				<path d="M6.5 9.5L9.5 6.5" />
				<path d="M8.5 10.5L7 12C5.9 13.1 4.1 13.1 3 12C1.9 10.9 1.9 9.1 3 8L4.5 6.5" />
				<path d="M7.5 5.5L9 4C10.1 2.9 11.9 2.9 13 4C14.1 5.1 14.1 6.9 13 8L11.5 9.5" />
			</svg>
		</button>

		{#if ctx.currentLink}
			<button
				type="button"
				data-part="button"
				aria-label="Remove link"
				title="Remove link"
				tabindex={-1}
				onmousedown={(e) => e.preventDefault()}
				onclick={() => ctx.removeLink()}
			>
				<svg
					width="16"
					height="16"
					viewBox="0 0 16 16"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					aria-hidden="true"
				>
					<path d="M6.5 9.5L9.5 6.5" />
					<path d="M8.5 10.5L7 12C5.9 13.1 4.1 13.1 3 12C1.9 10.9 1.9 9.1 3 8L4.5 6.5" />
					<path d="M7.5 5.5L9 4C10.1 2.9 11.9 2.9 13 4C14.1 5.1 14.1 6.9 13 8L11.5 9.5" />
					<path d="M3 13L13 3" />
				</svg>
			</button>
		{/if}

		{#if showLinkInput}
			<div data-part="linkPopover">
				<input
					bind:value={linkUrl}
					bind:this={linkInputEl}
					data-part="linkInput"
					type="url"
					placeholder="https://example.com"
					onkeydown={(e) => {
						if (e.key === 'Enter') {
							e.preventDefault();
							if (linkUrl) {
								restoreSelection();
								ctx.insertLink(linkUrl);
							}
							closeLinkInput();
						} else if (e.key === 'Escape') {
							closeLinkInput();
						}
					}}
				/>
				<button
					type="button"
					data-part="linkApply"
					onclick={() => {
						if (linkUrl) {
							restoreSelection();
							ctx.insertLink(linkUrl);
						}
						closeLinkInput();
					}}>Apply</button
				>
				<button type="button" data-part="linkCancel" onclick={() => closeLinkInput()}
					>Cancel</button
				>
			</div>
		{/if}
	</div>
</div>

<style>
	[data-part='toolbar'] {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
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

	.toolbarGroupRelative {
		position: relative;
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
