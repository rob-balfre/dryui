<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import Button from '../button/button.svelte';
	import { highlight } from './highlighter/index.js';
	import type { Token } from './highlighter/types.js';

	interface Segment {
		text: string;
		tokenType?: string;
	}

	interface Props extends HTMLAttributes<HTMLElement> {
		code: string;
		language?: string;
		showLineNumbers?: boolean;
		showCopyButton?: boolean;
		linkResolver?: (text: string, type: string) => string | undefined;
		children?: Snippet;
	}

	let {
		code,
		language,
		showLineNumbers = false,
		showCopyButton = true,
		linkResolver,
		class: className,
		children,
		...rest
	}: Props = $props();

	let copied = $state(false);
	let copyTimer: ReturnType<typeof setTimeout> | undefined;
	const isSingleLine = $derived(!code.includes('\n'));
	const lineBreak = '\n';

	function handleCopy() {
		navigator.clipboard.writeText(code).then(() => {
			copied = true;
			clearTimeout(copyTimer);
			copyTimer = setTimeout(() => {
				copied = false;
			}, 2000);
		});
	}

	function renderLine(
		code: string,
		tokens: Token[],
		lineStart: number,
		lineEnd: number
	): Segment[] {
		const segments: Segment[] = [];
		let pos = lineStart;

		const lineTokens = tokens.filter((t) => t.end > lineStart && t.start < lineEnd);

		for (const token of lineTokens) {
			const tokenStart = Math.max(token.start, lineStart);
			const tokenEnd = Math.min(token.end, lineEnd);

			if (tokenStart > pos) {
				segments.push({ text: code.slice(pos, tokenStart) });
			}

			segments.push({
				text: code.slice(tokenStart, tokenEnd),
				tokenType: token.type
			});

			pos = tokenEnd;
		}

		if (pos < lineEnd) {
			segments.push({ text: code.slice(pos, lineEnd) });
		}

		return segments;
	}

	const highlightedLines = $derived.by(() => {
		const tokens = highlight(code, language);
		const lines = code.split('\n');
		let offset = 0;

		return lines.map((line, i) => {
			const lineStart = offset;
			const lineEnd = offset + line.length;
			offset = lineEnd + 1;

			return {
				number: i + 1,
				segments: renderLine(code, tokens, lineStart, lineEnd)
			};
		});
	});
</script>

<div
	data-code-block
	data-language={language || undefined}
	data-single-line={isSingleLine || undefined}
	data-copied={copied || undefined}
	class={className}
	{...rest}
>
	{#if language && language !== 'text'}
		<div data-code-block-header>
			<span data-code-block-language>{language}</span>
		</div>
	{/if}

	{#if children}
		<pre data-code-block-pre>{@render children()}</pre>
	{:else}
		<!-- prettier-ignore -->
		<pre data-code-block-pre><code data-code-block-code data-language={language || undefined}>{#each highlightedLines as line, i (i)}{#if showLineNumbers}<span data-code-block-line-number>{line.number}</span>{/if}<span data-code-block-line-content>{#each line.segments as segment, segmentIndex (segmentIndex)}{@const href = linkResolver && segment.tokenType ? linkResolver(segment.text, segment.tokenType) : undefined}{#if href}<a {href} data-token-type={segment.tokenType} data-code-block-token-link>{segment.text}</a>{:else if segment.tokenType}<span data-token-type={segment.tokenType}>{segment.text}</span>{:else}{segment.text}{/if}{/each}</span>{#if i < highlightedLines.length - 1}{lineBreak}{/if}{/each}</code></pre>
	{/if}

	{#if showCopyButton}
		<span class="copy-btn-slot">
			<Button
				variant="trigger"
				size="icon-sm"
				type="button"
				data-code-block-copy
				onclick={handleCopy}
				aria-label={copied ? 'Copied' : 'Copy code'}
			>
				{#if copied}
					<svg
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<polyline points="20 6 9 17 4 12"></polyline>
					</svg>
				{:else}
					<svg
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
						<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
					</svg>
				{/if}
			</Button>
		</span>
	{/if}
</div>

<style>
	[data-code-block] {
		--dry-code-bg: #0d1117;
		--dry-code-color: #e6edf3;
		--dry-code-border: #30363d;
		--dry-code-font-size: var(--dry-type-small-size, var(--dry-text-sm-size));
		--dry-code-line-height: var(--dry-type-small-leading, var(--dry-text-sm-leading));
		--dry-code-padding: var(--dry-space-4);
		--dry-code-radius: var(--dry-radius-lg);
		--dry-code-header-bg: #161b22;
		--dry-code-header-color: #8b949e;
		--dry-code-copy-color: #8b949e;
		--dry-code-copy-hover-color: #e6edf3;

		position: relative;
		background: var(--dry-code-bg);
		border: 1px solid var(--dry-code-border);
		border-radius: var(--dry-code-radius);
		overflow: hidden;
	}

	[data-code-block-header] {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		align-items: center;
		padding: var(--dry-space-2) var(--dry-code-padding);
		background: var(--dry-code-header-bg);
		border-bottom: 1px solid var(--dry-code-border);
	}

	[data-code-block-language] {
		font-size: var(--dry-type-tiny-size, var(--dry-text-xs-size));
		font-family: var(--dry-font-sans);
		color: var(--dry-code-header-color);
		text-transform: lowercase;
		user-select: none;
	}

	.copy-btn-slot {
		position: absolute;
		top: var(--dry-space-2);
		right: var(--dry-space-2);
		z-index: 1;
		display: inline-grid;
		color: var(--dry-code-copy-color);
	}

	[data-code-block]:has([data-code-block-header]) .copy-btn-slot {
		top: calc(
			var(--dry-space-2) + var(--dry-type-tiny-size, var(--dry-text-xs-size)) + var(--dry-space-2) *
				2 + 1px
		);
	}

	[data-code-block][data-single-line] {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
	}

	[data-code-block][data-single-line] [data-code-block-header] {
		grid-column: 1 / -1;
	}

	[data-code-block][data-single-line] .copy-btn-slot {
		position: static;
		align-self: center;
		margin-right: var(--dry-space-2);
	}

	[data-code-block][data-single-line]:has(.copy-btn-slot) [data-code-block-pre] {
		-webkit-mask-image: linear-gradient(to right, black calc(100% - 0.75rem), transparent);
		mask-image: linear-gradient(to right, black calc(100% - 0.75rem), transparent);
	}

	[data-code-block]:not([data-single-line]):has(.copy-btn-slot) [data-code-block-pre] {
		padding-right: calc(var(--dry-code-padding) + var(--dry-space-12));
	}

	[data-code-block-pre] {
		margin: 0;
		padding: var(--dry-code-padding);
		overflow-x: auto;
		-webkit-overflow-scrolling: touch;
		text-align: left;
	}

	[data-code-block-code] {
		display: block;
		font-family: var(--dry-font-mono);
		font-size: var(--dry-code-font-size);
		line-height: var(--dry-code-line-height);
		color: var(--dry-code-color);
		background: transparent;
		padding: 0;
		border-radius: 0;
		white-space: pre;
		tab-size: 2;
	}

	[data-code-block-code]:has([data-code-block-line-number]) {
		display: grid;
		grid-template-columns: 3ch 1fr;
	}

	[data-code-block-line-number] {
		margin-right: var(--dry-space-3);
		color: #484f58;
		text-align: right;
		user-select: none;
	}

	[data-token-type='comment'] {
		color: #6e7681;
		font-style: italic;
	}
	[data-token-type='string'] {
		color: #7ee787;
	}
	[data-token-type='keyword'] {
		color: #c084fc;
	}
	[data-token-type='number'] {
		color: #fb923c;
	}
	[data-token-type='tag'] {
		color: #60a5fa;
	}
	[data-token-type='component'] {
		color: #fde68a;
	}
	[data-token-type='attribute'] {
		color: #93c5fd;
	}
	[data-token-type='svelte-keyword'] {
		color: #d8b4fe;
	}
	[data-token-type='rune'] {
		color: #f87171;
	}
	[data-token-type='function'] {
		color: #facc15;
	}
	[data-token-type='type'] {
		color: #86efac;
	}
	[data-token-type='operator'] {
		color: #8b949e;
	}
	[data-token-type='punctuation'] {
		color: #6e7681;
	}

	[data-code-block-token-link] {
		text-decoration: none;
		cursor: pointer;
		border-radius: var(--dry-radius-sm);
		transition: background var(--dry-duration-fast) var(--dry-ease-default);

		&:hover {
			background: color-mix(in srgb, currentColor 15%, transparent);
		}
	}
</style>
