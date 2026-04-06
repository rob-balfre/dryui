import type { HTMLAttributes } from 'svelte/elements';
import type { Snippet } from 'svelte';
interface Props extends HTMLAttributes<HTMLDivElement> {
	content: string;
	sanitize?: boolean;
	codeBlock?: Snippet<[{ code: string; language: string }]>;
	hr?: Snippet;
}
declare const MarkdownRenderer: import('svelte').Component<Props, {}, ''>;
type MarkdownRenderer = ReturnType<typeof MarkdownRenderer>;
export default MarkdownRenderer;
