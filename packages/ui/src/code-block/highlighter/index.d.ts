import type { Token, Highlighter } from './types.js';
export type { Token, Highlighter };
export declare function registerHighlighter(languages: string[], highlighter: Highlighter): void;
export declare function highlight(code: string, language?: string): Token[];
