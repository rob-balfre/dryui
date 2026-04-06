import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	content: string;
	sanitize?: boolean;
}
declare const MarkdownRenderer: import('svelte').Component<Props, {}, ''>;
type MarkdownRenderer = ReturnType<typeof MarkdownRenderer>;
export default MarkdownRenderer;
