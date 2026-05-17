import { describe, expect, test } from 'bun:test';
import { formatViolationReport } from './violation-report.js';

describe('formatViolationReport', () => {
	test('adds compact source context for offending lines', () => {
		const report = formatViolationReport(
			'src/layout.css',
			[
				{
					rule: 'dryui/layout-css-property',
					line: 3,
					message: 'Invalid property: inline-size'
				},
				{
					rule: 'dryui/no-width',
					line: 3,
					message: 'Do not use width/inline-size'
				}
			],
			`[data-layout='compose-trip-block'] {
  display: grid;
  inline-size: 100%;
  color: var(--dry-color-text);
}`
		);

		expect(report).toContain(
			'[dryui/layout-css-property] src/layout.css:3 - Invalid property: inline-size'
		);
		expect(report).toContain('[dryui/no-width] src/layout.css:3 - Do not use width/inline-size');
		expect(report).toContain('Source context:');
		expect(report).toContain('  2 |   display: grid;');
		expect(report).toContain('> 3 |   inline-size: 100%;');
		expect(report).toContain('  4 |   color: var(--dry-color-text);');
	});

	test('merges nearby context ranges without repeating shared lines', () => {
		const report = formatViolationReport(
			'src/layout.css',
			[
				{ rule: 'one', line: 3, message: 'first' },
				{ rule: 'two', line: 4, message: 'second' }
			],
			['a', 'b', 'c', 'd', 'e'].join('\n')
		);

		expect(report.match(/\| c/g)).toHaveLength(1);
		expect(report.match(/\| d/g)).toHaveLength(1);
		expect(report).toContain('> 3 | c');
		expect(report).toContain('> 4 | d');
	});
});
