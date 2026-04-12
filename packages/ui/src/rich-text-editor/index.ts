import type { HTMLAttributes } from 'svelte/elements';

export type { RichTextEditorRootProps, RichTextEditorContentProps } from '@dryui/primitives';

export interface RichTextEditorToolbarProps extends HTMLAttributes<HTMLDivElement> {}

import RichTextEditorRoot from './rich-text-editor-root.svelte';
import RichTextEditorToolbar from './rich-text-editor-toolbar-button-input.svelte';
import RichTextEditorContent from './rich-text-editor-content.svelte';

export const RichTextEditor: {
	Root: typeof RichTextEditorRoot;
	Toolbar: typeof RichTextEditorToolbar;
	Content: typeof RichTextEditorContent;
} = {
	Root: RichTextEditorRoot,
	Toolbar: RichTextEditorToolbar,
	Content: RichTextEditorContent
};
