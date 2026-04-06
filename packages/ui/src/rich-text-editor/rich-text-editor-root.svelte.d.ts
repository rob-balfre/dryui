import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	value?: string;
	placeholder?: string;
	readonly?: boolean;
	children: Snippet;
}
declare const RichTextEditorRoot: import('svelte').Component<Props, {}, 'value'>;
type RichTextEditorRoot = ReturnType<typeof RichTextEditorRoot>;
export default RichTextEditorRoot;
