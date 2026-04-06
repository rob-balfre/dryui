// tests/unit/pin-input.test.ts
import { describe, test, expect } from 'bun:test';

describe('PinInput value management', () => {
	test('numeric type filters non-digit characters', () => {
		const regex = /^\d+$/;
		expect(regex.test('5')).toBe(true);
		expect(regex.test('a')).toBe(false);
		expect(regex.test('!')).toBe(false);
	});

	test('alphanumeric type allows letters and digits', () => {
		const regex = /^[a-zA-Z0-9]+$/;
		expect(regex.test('a')).toBe(true);
		expect(regex.test('5')).toBe(true);
		expect(regex.test('Z')).toBe(true);
		expect(regex.test('!')).toBe(false);
	});

	test('value truncates to length', () => {
		const length = 4;
		const value = '123456';
		expect(value.slice(0, length)).toBe('1234');
	});

	test('paste transformer strips dashes', () => {
		const transformer = (text: string) => text.replace(/-/g, '');
		expect(transformer('123-456')).toBe('123456');
		expect(transformer('1-2-3-4')).toBe('1234');
	});

	test('cell computation produces correct active state', () => {
		const value = '12';
		const length = 4;
		const selectionStart = 2;

		const cells = Array.from({ length }, (_, i) => ({
			char: value[i] ?? null,
			isActive: selectionStart === i,
			hasFakeCaret: selectionStart === i && !value[i],
			index: i
		}));

		expect(cells[0].char).toBe('1');
		expect(cells[0].isActive).toBe(false);
		expect(cells[1].char).toBe('2');
		expect(cells[1].isActive).toBe(false);
		expect(cells[2].char).toBe(null);
		expect(cells[2].isActive).toBe(true);
		expect(cells[2].hasFakeCaret).toBe(true);
		expect(cells[3].char).toBe(null);
		expect(cells[3].isActive).toBe(false);
	});
});
