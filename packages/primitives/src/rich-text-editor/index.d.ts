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
export interface RichTextEditorRootProps extends HTMLAttributes<HTMLDivElement> {
    value?: string;
    placeholder?: string;
    readonly?: boolean;
    children: Snippet;
}
export interface RichTextEditorToolbarProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
    children: Snippet<[ToolbarSnippetParams]>;
}
export interface RichTextEditorContentProps extends HTMLAttributes<HTMLDivElement> {
}
export { setRichTextEditorCtx, getRichTextEditorCtx } from './context.svelte.js';
export type { RichTextEditorContext } from './context.svelte.js';
import RichTextEditorRoot from './rich-text-editor-root.svelte';
import RichTextEditorToolbar from './rich-text-editor-toolbar.svelte';
import RichTextEditorContent from './rich-text-editor-content.svelte';
export declare const RichTextEditor: {
    Root: typeof RichTextEditorRoot;
    Toolbar: typeof RichTextEditorToolbar;
    Content: typeof RichTextEditorContent;
};
