import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLElement> {
	code: string;
	language?: string;
	showLineNumbers?: boolean;
	showCopyButton?: boolean;
	linkResolver?: (text: string, type: string) => string | undefined;
	children?: Snippet;
}
declare const CodeBlock: import('svelte').Component<Props, {}, ''>;
type CodeBlock = ReturnType<typeof CodeBlock>;
export default CodeBlock;
