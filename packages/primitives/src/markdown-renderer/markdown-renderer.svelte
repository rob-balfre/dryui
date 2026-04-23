<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import type { Snippet } from 'svelte';
	import { parseMarkdownToAst, type MarkdownNode } from './markdown-parser.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		content: string;
		dangerouslyAllowRawHtml?: boolean;
		codeBlock?: Snippet<[{ code: string; language: string }]>;
		hr?: Snippet;
	}

	let { content, dangerouslyAllowRawHtml = false, codeBlock, hr, ...rest }: Props = $props();

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
			{#if codeBlock}
				{@render codeBlock({ code: node.code, language: node.language })}
			{:else}
				<pre><code data-language={node.language || undefined}>{node.code}</code></pre>
			{/if}
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
			{#if hr}
				{@render hr()}
			{:else}
				<hr />
			{/if}
		{/if}
	{/each}
{/snippet}

<div data-markdown-renderer {...rest}>
	{@render renderNodes(nodes)}
</div>
