import type { CodeBlockProps as PrimitiveCodeBlockProps } from '@dryui/primitives';
export interface CodeBlockProps extends Omit<PrimitiveCodeBlockProps, 'shell'> {
	showLineNumbers?: boolean;
	showCopyButton?: boolean;
	linkResolver?: (text: string, type: string) => string | undefined;
}
export { default as CodeBlock } from './code-block.svelte';
export type { Token, Highlighter } from './highlighter/types.js';
export { highlight, registerHighlighter } from './highlighter/index.js';
