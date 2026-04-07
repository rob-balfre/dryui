<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { parseMarkdownToAst, type MarkdownNode } from '@dryui/primitives/markdown-renderer';
	import { CodeBlock } from '../code-block/index.js';
	import { Separator } from '../separator/index.js';
	interface Props extends HTMLAttributes<HTMLDivElement> {
		content: string;
		sanitize?: boolean;
	}

	let { content, sanitize = true, class: className, ...rest }: Props = $props();

	const nodes = $derived(parseMarkdownToAst(content, { sanitize }));
</script>

{#snippet renderNodes(items: MarkdownNode[])}
	{#each items as node}
		{#if node.type === 'heading'}
			{#if node.level === 1}<h1>{@html node.content}</h1>
			{:else if node.level === 2}<h2>{@html node.content}</h2>
			{:else if node.level === 3}<h3>{@html node.content}</h3>
			{:else if node.level === 4}<h4>{@html node.content}</h4>
			{:else if node.level === 5}<h5>{@html node.content}</h5>
			{:else}<h6>{@html node.content}</h6>
			{/if}
		{:else if node.type === 'paragraph'}
			<p>{@html node.content}</p>
		{:else if node.type === 'code-block'}
			<CodeBlock code={node.code} language={node.language} />
		{:else if node.type === 'blockquote'}
			<blockquote>
				{@render renderNodes(node.children)}
			</blockquote>
		{:else if node.type === 'unordered-list'}
			<ul>
				{#each node.items as item}
					<li>{@html item}</li>
				{/each}
			</ul>
		{:else if node.type === 'ordered-list'}
			<ol>
				{#each node.items as item}
					<li>{@html item}</li>
				{/each}
			</ol>
		{:else if node.type === 'hr'}
			<Separator />
		{/if}
	{/each}
{/snippet}

<div data-markdown-renderer class={className} data-markdown-renderer-root {...rest}>
	{@render renderNodes(nodes)}
</div>

<style>
	[data-markdown-renderer-root] {
		/* Component tokens (Tier 3) — use semantic tokens so dark mode works */
		--dry-markdown-color: var(--dry-color-text-strong);
		--dry-markdown-heading-color: var(--dry-color-text-strong);
		--dry-markdown-link-color: var(--dry-color-fill-brand);
		--dry-markdown-link-hover-color: var(--dry-color-fill-brand-hover);
		--dry-markdown-code-bg: var(--dry-color-bg-raised);
		--dry-markdown-code-color: var(--dry-color-text-weak);
		--dry-markdown-code-border: var(--dry-color-stroke-weak);
		--dry-markdown-blockquote-border: var(--dry-color-stroke-weak);
		--dry-markdown-blockquote-color: var(--dry-color-text-weak);
		--dry-markdown-hr-color: var(--dry-color-stroke-weak);
		--dry-markdown-font-size: var(--dry-type-small-size, var(--dry-type-small-size));
		--dry-markdown-line-height: var(--dry-type-small-leading, var(--dry-type-small-leading));
		--dry-markdown-max-width: 65ch;

		display: grid;
		grid-template-columns: minmax(0, var(--dry-markdown-max-width));
		font-family: var(--dry-font-sans);
		font-size: var(--dry-markdown-font-size);
		line-height: var(--dry-markdown-line-height);
		color: var(--dry-markdown-color);
	}

	[data-markdown-renderer-root] :global {
		/* ── Headings ─────────────────────────────────────────────────────────────── */

		h1,
		h2,
		h3,
		h4,
		h5,
		h6 {
			color: var(--dry-markdown-heading-color);
			font-weight: 600;
			line-height: 1.25;
			margin-top: 1.5em;
			margin-bottom: 0.5em;
		}

		h1 {
			font-size: var(--dry-type-heading-2-size, var(--dry-type-heading-2-size));
			margin-top: 0;
		}

		h2 {
			font-size: var(--dry-type-heading-2-size, var(--dry-type-heading-2-size));
			padding-bottom: 0.25em;
			border-bottom: 1px solid var(--dry-markdown-hr-color);
		}

		h3 {
			font-size: var(--dry-type-heading-3-size, var(--dry-type-heading-3-size));
		}

		h4 {
			font-size: var(--dry-type-heading-4-size, var(--dry-type-heading-4-size));
		}

		h5 {
			font-size: var(--dry-markdown-font-size);
		}

		h6 {
			font-size: var(--dry-type-small-size, var(--dry-type-small-size));
			color: var(--dry-color-text-weak);
		}

		/* ── Paragraph ────────────────────────────────────────────────────────────── */

		p {
			margin-top: 0;
			margin-bottom: 1em;
		}

		/* ── Links ────────────────────────────────────────────────────────────────── */

		a {
			color: var(--dry-markdown-link-color);
			text-decoration: underline;
			text-underline-offset: 2px;

			&:hover {
				color: var(--dry-markdown-link-hover-color);
			}
		}

		/* ── Images ───────────────────────────────────────────────────────────────── */

		img {
			height: auto;
			border-radius: var(--dry-radius-md);
			margin-top: 0.5em;
			margin-bottom: 0.5em;
		}

		/* ── Lists ────────────────────────────────────────────────────────────────── */

		ul,
		ol {
			margin-top: 0;
			margin-bottom: 1em;
			padding-left: 1.5em;
		}

		li {
			margin-bottom: 0.25em;
		}

		ul {
			list-style-type: disc;
		}

		ol {
			list-style-type: decimal;
		}

		/* ── Blockquotes ──────────────────────────────────────────────────────────── */

		blockquote {
			margin: 0 0 1em 0;
			padding: var(--dry-space-2) var(--dry-space-4);
			border-left: 3px solid var(--dry-markdown-blockquote-border);
			color: var(--dry-markdown-blockquote-color);
		}

		blockquote p:last-child {
			margin-bottom: 0;
		}

		/* ── Inline code ──────────────────────────────────────────────────────────── */

		code {
			font-family: var(--dry-font-mono);
			font-size: 0.875em;
			padding: 0.125em 0.375em;
			background: var(--dry-markdown-code-bg);
			color: var(--dry-markdown-code-color);
			border: 1px solid var(--dry-markdown-code-border);
			border-radius: var(--dry-radius-sm);
		}

		/* Reset inline code styles inside CodeBlock */
		[data-code-block] code {
			padding: 0;
			background: none;
			color: inherit;
			border: none;
			border-radius: 0;
		}

		/* ── Strong & Em ──────────────────────────────────────────────────────────── */

		strong {
			font-weight: 600;
			color: var(--dry-markdown-heading-color);
		}

		em {
			font-style: italic;
		}
	}
</style>
