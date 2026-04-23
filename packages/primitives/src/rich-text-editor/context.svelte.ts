import { createContext } from '../utils/create-context.js';

export interface RichTextEditorContext {
	readonly isBold: boolean;
	readonly isItalic: boolean;
	readonly isUnderline: boolean;
	readonly isStrikethrough: boolean;
	readonly isOrderedList: boolean;
	readonly isUnorderedList: boolean;
	readonly currentHeading: string | null;
	readonly currentLink: string | null;
	readonly html: string;
	readonly readonly: boolean;
	readonly placeholder: string;
	contentEl: HTMLDivElement | null;
	execCommand: (command: string, value?: string) => void;
	toggleBold: () => void;
	toggleItalic: () => void;
	toggleUnderline: () => void;
	toggleStrikethrough: () => void;
	toggleOrderedList: () => void;
	toggleUnorderedList: () => void;
	setHeading: (level: 'h1' | 'h2' | 'h3' | 'p') => void;
	insertLink: (url: string) => void;
	removeLink: () => void;
	getContent: () => string;
	updateState: () => void;
	syncValue: () => void;
	sanitizeHtml: (html: string) => string;
}
export const [setRichTextEditorCtx, getRichTextEditorCtx] =
	createContext<RichTextEditorContext>('rich-text-editor');
