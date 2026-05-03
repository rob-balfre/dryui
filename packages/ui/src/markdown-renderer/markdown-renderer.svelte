<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { parseMarkdownToAst, type MarkdownNode } from '@dryui/primitives/markdown-renderer';
	import { CodeBlock } from '../code-block/index.js';
	import { Separator } from '../separator/index.js';
	interface Props extends HTMLAttributes<HTMLDivElement> {
		content: string;
		dangerouslyAllowRawHtml?: boolean;
	}

	let { content, dangerouslyAllowRawHtml = false, class: className, ...rest }: Props = $props();

	const nodes = $derived(parseMarkdownToAst(content, { sanitize: !dangerouslyAllowRawHtml }));
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

	/* ── Headings ─────────────────────────────────────────────────────────────── */

	[data-markdown-renderer-root] :global(h1),
	[data-markdown-renderer-root] :global(h2),
	[data-markdown-renderer-root] :global(h3),
	[data-markdown-renderer-root] :global(h4),
	[data-markdown-renderer-root] :global(h5),
	[data-markdown-renderer-root] :global(h6) {
		color: var(--dry-markdown-heading-color);
		font-weight: 600;
		line-height: 1.25;
		margin-top: 1.5em;
		margin-bottom: 0.5em;
	}

	[data-markdown-renderer-root] :global(h1) {
		font-size: var(--dry-type-heading-2-size, var(--dry-type-heading-2-size));
		margin-top: 0;
	}

	[data-markdown-renderer-root] :global(h2) {
		font-size: var(--dry-type-heading-2-size, var(--dry-type-heading-2-size));
		padding-bottom: 0.25em;
		border-bottom: 1px solid var(--dry-markdown-hr-color);
	}

	[data-markdown-renderer-root] :global(h3) {
		font-size: var(--dry-type-heading-3-size, var(--dry-type-heading-3-size));
	}

	[data-markdown-renderer-root] :global(h4) {
		font-size: var(--dry-type-heading-4-size, var(--dry-type-heading-4-size));
	}

	[data-markdown-renderer-root] :global(h5) {
		font-size: var(--dry-markdown-font-size);
	}

	[data-markdown-renderer-root] :global(h6) {
		font-size: var(--dry-type-small-size, var(--dry-type-small-size));
		color: var(--dry-color-text-weak);
	}

	/* ── Paragraph ────────────────────────────────────────────────────────────── */

	[data-markdown-renderer-root] :global(p) {
		margin-top: 0;
		margin-bottom: 1em;
	}

	/* ── Links ────────────────────────────────────────────────────────────────── */

	[data-markdown-renderer-root] :global(a) {
		color: var(--dry-markdown-link-color);
		text-decoration: underline;
		text-underline-offset: 2px;
	}

	[data-markdown-renderer-root] :global(a:hover) {
		color: var(--dry-markdown-link-hover-color);
	}

	/* ── Images ───────────────────────────────────────────────────────────────── */

	[data-markdown-renderer-root] :global(img) {
		height: auto;
		border-radius: var(--dry-radius-md);
		margin-top: 0.5em;
		margin-bottom: 0.5em;
	}

	/* ── Lists ────────────────────────────────────────────────────────────────── */

	[data-markdown-renderer-root] :global(ul),
	[data-markdown-renderer-root] :global(ol) {
		margin-top: 0;
		margin-bottom: 1em;
		padding-left: 1.5em;
	}

	[data-markdown-renderer-root] :global(li) {
		margin-bottom: 0.25em;
	}

	[data-markdown-renderer-root] :global(ul) {
		list-style-type: disc;
	}

	[data-markdown-renderer-root] :global(ol) {
		list-style-type: decimal;
	}

	/* ── Blockquotes ──────────────────────────────────────────────────────────── */

	[data-markdown-renderer-root] :global(blockquote) {
		margin: 0 0 1em 0;
		padding: var(--dry-space-2) var(--dry-space-4);
		border-left: 3px solid var(--dry-markdown-blockquote-border);
		color: var(--dry-markdown-blockquote-color);
	}

	[data-markdown-renderer-root] :global(blockquote p:last-child) {
		margin-bottom: 0;
	}

	/* ── Inline code ──────────────────────────────────────────────────────────── */

	[data-markdown-renderer-root] :global(code) {
		font-family: var(--dry-font-mono);
		font-size: 0.875em;
		padding: 0.125em 0.375em;
		background: var(--dry-markdown-code-bg);
		color: var(--dry-markdown-code-color);
		border: 1px solid var(--dry-markdown-code-border);
		border-radius: var(--dry-radius-sm);
	}

	/* Reset inline code styles inside CodeBlock */
	[data-markdown-renderer-root] :global([data-code-block] code) {
		padding: 0;
		background: none;
		color: inherit;
		border: none;
		border-radius: 0;
	}

	/* ── Strong & Em ──────────────────────────────────────────────────────────── */

	[data-markdown-renderer-root] :global(strong) {
		font-weight: 600;
		color: var(--dry-markdown-heading-color);
	}

	[data-markdown-renderer-root] :global(em) {
		font-style: italic;
	}
</style>
