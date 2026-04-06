import { describe, it, expect } from 'bun:test';
import {
	parseMarkdownToAst,
	parseMarkdown
} from '../../../packages/primitives/src/markdown-renderer/markdown-parser.js';

describe('parseMarkdownToAst', () => {
	it('parses headings', () => {
		const nodes = parseMarkdownToAst('# Hello');
		expect(nodes).toEqual([{ type: 'heading', level: 1, content: 'Hello' }]);
	});

	it('parses paragraphs', () => {
		const nodes = parseMarkdownToAst('Hello world');
		expect(nodes).toEqual([{ type: 'paragraph', content: 'Hello world' }]);
	});

	it('parses fenced code blocks', () => {
		const nodes = parseMarkdownToAst('```js\nconst x = 1\n```');
		expect(nodes).toEqual([{ type: 'code-block', language: 'js', code: 'const x = 1' }]);
	});

	it('parses code blocks without language', () => {
		const nodes = parseMarkdownToAst('```\nplain\n```');
		expect(nodes).toEqual([{ type: 'code-block', language: '', code: 'plain' }]);
	});

	it('parses horizontal rules', () => {
		const nodes = parseMarkdownToAst('---');
		expect(nodes).toEqual([{ type: 'hr' }]);
	});

	it('parses unordered lists', () => {
		const nodes = parseMarkdownToAst('- one\n- two');
		expect(nodes).toEqual([{ type: 'unordered-list', items: ['one', 'two'] }]);
	});

	it('parses ordered lists', () => {
		const nodes = parseMarkdownToAst('1. first\n2. second');
		expect(nodes).toEqual([{ type: 'ordered-list', items: ['first', 'second'] }]);
	});

	it('parses blockquotes', () => {
		const nodes = parseMarkdownToAst('> quoted');
		expect(nodes.length).toBe(1);
		const node = nodes[0];
		if (!node || node.type !== 'blockquote') throw new Error('Expected blockquote');
		expect(node.children).toEqual([{ type: 'paragraph', content: 'quoted' }]);
	});

	it('preserves blockquote parsing when sanitize is enabled', () => {
		const nodes = parseMarkdownToAst('> <script>alert(1)</script>');
		const node = nodes[0];
		if (!node || node.type !== 'blockquote') throw new Error('Expected blockquote');
		expect(node.children).toEqual([
			{ type: 'paragraph', content: '&lt;script&gt;alert(1)&lt;/script&gt;' }
		]);
	});

	it('processes inline formatting in paragraphs', () => {
		const nodes = parseMarkdownToAst('**bold** and *italic*');
		const node = nodes[0];
		if (!node || node.type !== 'paragraph') throw new Error('Expected paragraph');
		expect(node.content).toContain('<strong>');
		expect(node.content).toContain('<em>');
	});

	it('processes inline formatting in list items', () => {
		const nodes = parseMarkdownToAst('- `code` item');
		const node = nodes[0];
		if (!node || node.type !== 'unordered-list') throw new Error('Expected unordered-list');
		expect(node.items[0]).toContain('<code>');
	});

	it('preserves raw code in code blocks (no inline processing)', () => {
		const nodes = parseMarkdownToAst('```\n**not bold**\n```');
		const node = nodes[0];
		if (!node || node.type !== 'code-block') throw new Error('Expected code-block');
		expect(node.code).toBe('**not bold**');
	});

	it('parses multiple block types in sequence', () => {
		const md = '# Title\n\nSome text\n\n---\n\n- item';
		const nodes = parseMarkdownToAst(md);
		expect(nodes.map((n) => n.type)).toEqual(['heading', 'paragraph', 'hr', 'unordered-list']);
	});

	it('backwards compat: parseMarkdown still returns HTML string', () => {
		const html = parseMarkdown('# Hello');
		expect(html).toBe('<h1>Hello</h1>');
	});

	it('parseMarkdown round-trip matches for mixed content', () => {
		const md = '# Title\n\nA paragraph\n\n```js\ncode\n```\n\n---\n\n- item';
		const html = parseMarkdown(md);
		expect(html).toContain('<h1>Title</h1>');
		expect(html).toContain('<p>A paragraph</p>');
		expect(html).toContain('<pre><code data-language="js">code</code></pre>');
		expect(html).toContain('<hr />');
		expect(html).toContain('<li>item</li>');
	});

	it('parses a blockquote after a fenced code block', () => {
		const md =
			"## Code Example\n\n```typescript\nimport { Button } from '@dryui/ui';\n```\n\n> Built for developers who value simplicity.";
		const html = parseMarkdown(md);
		expect(html).toContain(
			'<pre><code data-language="typescript">import { Button } from \'@dryui/ui\';</code></pre>'
		);
		expect(html).toContain(
			'<blockquote><p>Built for developers who value simplicity.</p></blockquote>'
		);
	});
});
