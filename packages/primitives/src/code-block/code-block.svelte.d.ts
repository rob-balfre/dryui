import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface ShellContext {
	copied: boolean;
	handleCopy: () => void;
}
interface Props extends HTMLAttributes<HTMLElement> {
	code: string;
	language?: string;
	shell?: Snippet<[ShellContext]>;
	children?: Snippet;
}
declare const CodeBlock: import('svelte').Component<Props, {}, ''>;
type CodeBlock = ReturnType<typeof CodeBlock>;
export default CodeBlock;
