import type { HTMLAttributes } from 'svelte/elements';
export interface MarkdownRendererProps extends HTMLAttributes<HTMLDivElement> {
	content: string;
	sanitize?: boolean;
}
export { default as MarkdownRenderer } from './markdown-renderer.svelte';
export { parseMarkdown, parseMarkdownToAst } from './markdown-parser.js';
export type { MarkdownNode } from './markdown-parser.js';
