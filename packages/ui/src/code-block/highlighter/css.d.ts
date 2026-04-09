import type { Token, Highlighter } from './types.js';
/**
 * Highlights CSS code and returns tokens with positions offset by `base`.
 */
export declare function highlightCSS(code: string, base?: number): Token[];
export declare const cssHighlighter: Highlighter;
