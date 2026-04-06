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

function escapeHtml(text: string): string {
	return text
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}

function isSafeUrl(url: string): boolean {
	const trimmed = url.trim();
	if (!trimmed) return false;
	if (trimmed.startsWith('#')) return true;
	if (trimmed.startsWith('/') && !trimmed.startsWith('//')) return true;
	if (trimmed.startsWith('./') || trimmed.startsWith('../')) return true;

	try {
		const parsed = new URL(trimmed, 'http://localhost');
		return parsed.protocol === 'http:' || parsed.protocol === 'https:';
	} catch {
		return false;
	}
}

/** Process inline markdown formatting within a string */
function processInline(text: string, sanitize = true): string {
	let result = sanitize ? escapeHtml(text) : text;

	// Images: ![alt](src) — process before links
	result = result.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt: string, src: string) => {
		const safeSrc = isSafeUrl(src) ? src.trim() : null;
		return safeSrc ? `<img src="${safeSrc}" alt="${alt}" />` : alt;
	});

	// Links: [text](url)
	result = result.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text: string, href: string) => {
		const safeHref = isSafeUrl(href) ? href.trim() : null;
		return safeHref ? `<a href="${safeHref}">${text}</a>` : text;
	});

	// Inline code: `code` — process before bold/italic to avoid conflicts
	result = result.replace(/`([^`]+)`/g, '<code>$1</code>');

	// Bold: **text**
	result = result.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

	// Italic: *text* (but not inside already-processed bold)
	result = result.replace(/(?<!\*)\*([^*]+?)\*(?!\*)/g, '<em>$1</em>');

	return result;
}

/** Check if a line is a horizontal rule */
function isHorizontalRule(line: string): boolean {
	const trimmed = line.trim();
	return /^(-{3,}|\*{3,}|_{3,})$/.test(trimmed);
}

/** Check if a line is a heading and return level + content */
type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
const headingLevels: Record<number, HeadingLevel> = { 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6 };

function parseHeading(line: string): { level: HeadingLevel; content: string } | null {
	const match = line.match(/^(#{1,6})\s+(.+)$/);
	if (!match || !match[1] || !match[2]) return null;
	const level = headingLevels[match[1].length];
	if (!level) return null;
	return { level, content: match[2] };
}

/** Check if a line is an unordered list item */
function parseUnorderedListItem(line: string): string | null {
	const match = line.match(/^[\s]*[-*+]\s+(.+)$/);
	if (!match || !match[1]) return null;
	return match[1];
}

/** Check if a line is an ordered list item */
function parseOrderedListItem(line: string): string | null {
	const match = line.match(/^[\s]*\d+\.\s+(.+)$/);
	if (!match || !match[1]) return null;
	return match[1];
}

/** Check if a line is a blockquote */
function parseBlockquote(line: string): string | null {
	const match = line.match(/^>\s?(.*)$/);
	if (!match) return null;
	return match[1] ?? '';
}

export interface ParseOptions {
	sanitize?: boolean;
}

export type MarkdownNode =
	| { type: 'heading'; level: 1 | 2 | 3 | 4 | 5 | 6; content: string }
	| { type: 'paragraph'; content: string }
	| { type: 'code-block'; language: string; code: string }
	| { type: 'blockquote'; children: MarkdownNode[] }
	| { type: 'unordered-list'; items: string[] }
	| { type: 'ordered-list'; items: string[] }
	| { type: 'hr' };

/**
 * Parse a markdown string into an AST (array of block nodes).
 */
export function parseMarkdownToAst(input: string, options: ParseOptions = {}): MarkdownNode[] {
	const { sanitize = true } = options;
	const lines = input.split('\n');
	const nodes: MarkdownNode[] = [];
	let i = 0;

	while (i < lines.length) {
		const line = lines[i];
		if (line === undefined) {
			i++;
			continue;
		}

		if (line.trim() === '') {
			i++;
			continue;
		}

		// Fenced code block
		if (line.trim().startsWith('```')) {
			const lang = line.trim().slice(3).trim();
			const codeLines: string[] = [];
			i++;
			while (i < lines.length) {
				const codeLine = lines[i];
				if (codeLine === undefined) break;
				if (codeLine.trim().startsWith('```')) break;
				codeLines.push(codeLine);
				i++;
			}
			i++;
			nodes.push({ type: 'code-block', language: lang, code: codeLines.join('\n') });
			continue;
		}

		// Horizontal rule
		if (isHorizontalRule(line)) {
			nodes.push({ type: 'hr' });
			i++;
			continue;
		}

		// Heading
		const heading = parseHeading(line);
		if (heading) {
			nodes.push({
				type: 'heading',
				level: heading.level,
				content: processInline(heading.content, sanitize)
			});
			i++;
			continue;
		}

		// Blockquote
		const bqContent = parseBlockquote(line);
		if (bqContent !== null) {
			const bqLines: string[] = [bqContent];
			i++;
			while (i < lines.length) {
				const nextLine = lines[i];
				if (nextLine === undefined) break;
				const next = parseBlockquote(nextLine);
				if (next !== null) {
					bqLines.push(next);
					i++;
				} else break;
			}
			nodes.push({
				type: 'blockquote',
				children: parseMarkdownToAst(bqLines.join('\n'), { sanitize })
			});
			continue;
		}

		// Unordered list
		const ulItem = parseUnorderedListItem(line);
		if (ulItem !== null) {
			const items: string[] = [ulItem];
			i++;
			while (i < lines.length) {
				const nextLine = lines[i];
				if (nextLine === undefined) break;
				const next = parseUnorderedListItem(nextLine);
				if (next !== null) {
					items.push(next);
					i++;
				} else break;
			}
			nodes.push({
				type: 'unordered-list',
				items: items.map((item) => processInline(item, sanitize))
			});
			continue;
		}

		// Ordered list
		const olItem = parseOrderedListItem(line);
		if (olItem !== null) {
			const items: string[] = [olItem];
			i++;
			while (i < lines.length) {
				const nextLine = lines[i];
				if (nextLine === undefined) break;
				const next = parseOrderedListItem(nextLine);
				if (next !== null) {
					items.push(next);
					i++;
				} else break;
			}
			nodes.push({
				type: 'ordered-list',
				items: items.map((item) => processInline(item, sanitize))
			});
			continue;
		}

		// Paragraph
		const paraLines: string[] = [line];
		i++;
		while (i < lines.length) {
			const next = lines[i];
			if (next === undefined) break;
			if (
				next.trim() === '' ||
				next.trim().startsWith('```') ||
				isHorizontalRule(next) ||
				parseHeading(next) !== null ||
				parseBlockquote(next) !== null ||
				parseUnorderedListItem(next) !== null ||
				parseOrderedListItem(next) !== null
			)
				break;
			paraLines.push(next);
			i++;
		}
		nodes.push({ type: 'paragraph', content: processInline(paraLines.join('\n'), sanitize) });
	}

	return nodes;
}

function astToHtml(nodes: MarkdownNode[]): string {
	return nodes
		.map((node) => {
			switch (node.type) {
				case 'heading':
					return `<h${node.level}>${node.content}</h${node.level}>`;
				case 'paragraph':
					return `<p>${node.content}</p>`;
				case 'code-block': {
					const langAttr = node.language ? ` data-language="${escapeHtml(node.language)}"` : '';
					return `<pre><code${langAttr}>${escapeHtml(node.code)}</code></pre>`;
				}
				case 'blockquote':
					return `<blockquote>${astToHtml(node.children)}</blockquote>`;
				case 'unordered-list':
					return `<ul>${node.items.map((item) => `<li>${item}</li>`).join('')}</ul>`;
				case 'ordered-list':
					return `<ol>${node.items.map((item) => `<li>${item}</li>`).join('')}</ol>`;
				case 'hr':
					return '<hr />';
			}
		})
		.join('\n');
}

/**
 * Parse a markdown string into HTML.
 */
export function parseMarkdown(input: string, options: ParseOptions = {}): string {
	return astToHtml(parseMarkdownToAst(input, options));
}
