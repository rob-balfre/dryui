import { describe, it, expect } from 'bun:test';
import { genericHighlighter } from '../../../packages/ui/src/code-block/highlighter/generic.js';

describe('genericHighlighter', () => {
	it('highlights keywords', () => {
		const tokens = genericHighlighter('const x = 1');
		expect(tokens).toContainEqual({ type: 'keyword', start: 0, end: 5 });
	});

	it('highlights strings', () => {
		const tokens = genericHighlighter('const x = "hello"');
		const str = tokens.find((t) => t.type === 'string');
		expect(str).toEqual({ type: 'string', start: 10, end: 17 });
	});

	it('highlights numbers', () => {
		const tokens = genericHighlighter('const x = 42');
		const num = tokens.find((t) => t.type === 'number');
		expect(num).toEqual({ type: 'number', start: 10, end: 12 });
	});

	it('highlights line comments', () => {
		const tokens = genericHighlighter('x = 1 // comment');
		const comment = tokens.find((t) => t.type === 'comment');
		expect(comment).toEqual({ type: 'comment', start: 6, end: 16 });
	});

	it('highlights template literals', () => {
		const tokens = genericHighlighter('const s = `hello`');
		const str = tokens.find((t) => t.type === 'string');
		expect(str).toBeDefined();
	});

	it('returns no tokens for plain text', () => {
		const tokens = genericHighlighter('hello world');
		expect(tokens).toEqual([]);
	});
});
