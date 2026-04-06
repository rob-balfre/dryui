import { describe, test, expect } from 'bun:test';
import { severityLabel, pad, formatCssVarList, indent } from '../format.js';

describe('severityLabel', () => {
	test('returns ERROR for error severity', () => {
		expect(severityLabel('error')).toBe('ERROR');
	});

	test('returns WARN  for warning severity', () => {
		expect(severityLabel('warning')).toBe('WARN ');
	});

	test('returns HINT  for suggestion severity', () => {
		expect(severityLabel('suggestion')).toBe('HINT ');
	});

	test('returns INFO  for info severity', () => {
		expect(severityLabel('info')).toBe('INFO ');
	});

	test('uppercases unknown severity', () => {
		expect(severityLabel('critical')).toBe('CRITICAL');
	});

	test('uppercases unknown severity with mixed case', () => {
		expect(severityLabel('myLevel')).toBe('MYLEVEL');
	});
});

describe('pad', () => {
	test('pads a string to the requested width', () => {
		expect(pad('hi', 5)).toBe('hi   ');
	});

	test('returns the string unchanged when it equals the width', () => {
		expect(pad('hello', 5)).toBe('hello');
	});

	test('returns the string unchanged when it exceeds the width', () => {
		expect(pad('toolong', 4)).toBe('toolong');
	});

	test('handles zero width', () => {
		expect(pad('x', 0)).toBe('x');
	});

	test('handles empty string', () => {
		expect(pad('', 3)).toBe('   ');
	});
});

describe('formatCssVarList', () => {
	test('returns (none) for an empty array', () => {
		expect(formatCssVarList([])).toBe('(none)');
	});

	test('returns the single item for a one-element array', () => {
		expect(formatCssVarList(['--dry-btn-bg'])).toBe('--dry-btn-bg');
	});

	test('joins a short list on one line when it fits within 80 chars', () => {
		const result = formatCssVarList(['--dry-btn-bg', '--dry-btn-color', '--dry-btn-border']);
		expect(result).toBe('--dry-btn-bg, --dry-btn-color, --dry-btn-border');
	});

	test('wraps a long list onto multiple lines', () => {
		const vars = [
			'--dry-card-bg',
			'--dry-card-border',
			'--dry-card-radius',
			'--dry-card-padding',
			'--dry-card-shadow'
		];
		const result = formatCssVarList(vars);
		const lines = result.split('\n');
		expect(lines.length).toBeGreaterThan(1);
		// Every line except the first must start with the 2-space indent
		for (const line of lines.slice(1)) {
			expect(line.startsWith('  ')).toBe(true);
		}
		// No line should exceed 80 chars (unless a single token is itself > 80)
		for (const line of lines) {
			expect(line.length).toBeLessThanOrEqual(80);
		}
		// Round-tripping: all vars appear in the output
		for (const v of vars) {
			expect(result).toContain(v);
		}
	});

	test('handles a single var longer than 80 chars without breaking', () => {
		const longVar = '--dry-' + 'x'.repeat(80);
		const result = formatCssVarList([longVar]);
		expect(result).toBe(longVar);
	});

	test('places a very long token on its own line when it cannot share a line', () => {
		const longVar = '--dry-' + 'x'.repeat(80);
		const result = formatCssVarList(['--dry-short', longVar]);
		const lines = result.split('\n');
		expect(lines.length).toBe(2);
		expect(lines[0]).toBe('--dry-short,');
		expect(lines[1]).toBe('  ' + longVar);
	});

	test('respects a custom maxWidth', () => {
		const vars = ['--dry-a', '--dry-b', '--dry-c', '--dry-d'];
		const result = formatCssVarList(vars, 20);
		const lines = result.split('\n');
		for (const line of lines) {
			expect(line.length).toBeLessThanOrEqual(20);
		}
	});
});

describe('indent', () => {
	test('indents a single line', () => {
		expect(indent('hello', 2)).toBe('  hello');
	});

	test('indents every line of a multi-line string', () => {
		const result = indent('line1\nline2\nline3', 4);
		expect(result).toBe('    line1\n    line2\n    line3');
	});

	test('zero spaces leaves the string unchanged (but still prepends empty string)', () => {
		expect(indent('hello', 0)).toBe('hello');
	});

	test('handles an empty string', () => {
		expect(indent('', 3)).toBe('   ');
	});

	test('indents lines that are themselves empty in a multi-line block', () => {
		const result = indent('a\n\nb', 2);
		expect(result).toBe('  a\n  \n  b');
	});
});
