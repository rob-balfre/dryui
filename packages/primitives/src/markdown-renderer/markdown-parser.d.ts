/**
 * Minimal Markdown-to-HTML parser — zero dependencies.
 *
 * Supported syntax:
 *  - Headings: # H1 through ###### H6
 *  - Bold: **text**
 *  - Italic: *text*
 *  - Inline code: `code`
 *  - Fenced code blocks: ```lang\ncode\n```
 *  - Links: [text](url)
 *  - Images: ![alt](src)
 *  - Unordered lists: - item / * item
 *  - Ordered lists: 1. item
 *  - Blockquotes: > text
 *  - Horizontal rules: --- / *** / ___
 *  - Paragraphs (double newline separated)
 */
export interface ParseOptions {
    sanitize?: boolean;
}
export type MarkdownNode = {
    type: 'heading';
    level: 1 | 2 | 3 | 4 | 5 | 6;
    content: string;
} | {
    type: 'paragraph';
    content: string;
} | {
    type: 'code-block';
    language: string;
    code: string;
} | {
    type: 'blockquote';
    children: MarkdownNode[];
} | {
    type: 'unordered-list';
    items: string[];
} | {
    type: 'ordered-list';
    items: string[];
} | {
    type: 'hr';
};
/**
 * Parse a markdown string into an AST (array of block nodes).
 */
export declare function parseMarkdownToAst(input: string, options?: ParseOptions): MarkdownNode[];
/**
 * Parse a markdown string into HTML.
 */
export declare function parseMarkdown(input: string, options?: ParseOptions): string;
