import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface ToolbarSnippetParams {
	isBold: boolean;
	isItalic: boolean;
	isUnderline: boolean;
	isStrikethrough: boolean;
	isOrderedList: boolean;
	isUnorderedList: boolean;
	currentHeading: string | null;
	currentLink: string | null;
	toggleBold: () => void;
	toggleItalic: () => void;
	toggleUnderline: () => void;
	toggleStrikethrough: () => void;
	toggleOrderedList: () => void;
	toggleUnorderedList: () => void;
	setHeading: (level: 'h1' | 'h2' | 'h3' | 'p') => void;
	insertLink: (url: string) => void;
	removeLink: () => void;
}
interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	children: Snippet<[ToolbarSnippetParams]>;
}
declare const RichTextEditorToolbar: import('svelte').Component<Props, {}, ''>;
type RichTextEditorToolbar = ReturnType<typeof RichTextEditorToolbar>;
export default RichTextEditorToolbar;
