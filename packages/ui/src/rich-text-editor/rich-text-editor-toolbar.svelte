<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { RichTextEditor as RichTextEditorPrimitive } from '@dryui/primitives/rich-text-editor';

	interface Props extends HTMLAttributes<HTMLDivElement> {}

	let { ...rest }: Props = $props();

	let showLinkInput = $state(false);
	let linkUrl = $state('');
	let linkInputEl = $state<HTMLInputElement>();
	let savedSelection = $state<Range | null>(null);

	function openLinkInput(currentLink: string | null) {
		// Save the current selection so we can restore it when applying
		const sel = window.getSelection();
		if (sel && sel.rangeCount > 0) {
			savedSelection = sel.getRangeAt(0).cloneRange();
		}
		linkUrl = currentLink ?? 'https://';
		showLinkInput = true;
		// Focus input after render
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

<RichTextEditorPrimitive.Toolbar data-part="toolbar" {...rest}>
	{#snippet children(ctx)}
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
	{/snippet}
</RichTextEditorPrimitive.Toolbar>

<style>
	.toolbarGroupRelative {
		position: relative;
	}
</style>
