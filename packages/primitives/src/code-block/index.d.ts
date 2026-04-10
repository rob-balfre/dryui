import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
export interface CodeBlockShellContext {
    copied: boolean;
    handleCopy: () => void;
}
export interface CodeBlockProps extends HTMLAttributes<HTMLElement> {
    code: string;
    language?: string;
    shell?: Snippet<[CodeBlockShellContext]>;
    children?: Snippet;
}
export { default as CodeBlock } from './code-block.svelte';
