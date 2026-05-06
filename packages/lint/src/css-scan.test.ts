import { describe, expect, test } from 'bun:test';
import {
	buildLineIndex,
	declarationEntries,
	lookupLine,
	parseCssBlocks,
	stripCssComments
} from './css-scan.js';

describe('css scan', () => {
	test('preserves line numbers when blanking comments', () => {
		const css = '/* display: grid;\n   color: red; */\n.card { display: flex; }';
		const scan = stripCssComments(css);
		const lineStarts = buildLineIndex(css);

		expect(scan).not.toContain('display: grid');
		expect(lookupLine(lineStarts, scan.indexOf('display: flex'))).toBe(3);
	});

	test('parses nested blocks and declarations with semicolons in values', () => {
		const css = `
@container (min-width: 40rem) {
  [data-layout='demo'] {
    grid-template-columns: minmax(0, 1fr);
    content: "a;b";
  }
}`;
		const [container] = parseCssBlocks(css);
		expect(container?.selector).toBe('@container (min-width: 40rem)');

		const [layout] = parseCssBlocks(css, container!.bodyStart, container!.bodyEnd);
		expect(layout?.selector).toBe("[data-layout='demo']");
		expect(declarationEntries(css, layout!.bodyStart, layout!.bodyEnd)).toEqual([
			expect.objectContaining({
				property: 'grid-template-columns',
				value: 'minmax(0, 1fr)'
			}),
			expect.objectContaining({
				property: 'content',
				value: '"a;b"'
			})
		]);
	});
});
