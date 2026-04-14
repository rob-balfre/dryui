import { describe, test, expect } from 'bun:test';
import { getList, getCategories, groupByCategory } from '../commands/list.js';

const mockSpec = {
	components: {
		Button: {
			import: '@dryui/ui',
			description: 'Interactive button',
			category: 'action',
			tags: ['action'],
			compound: false,
			props: {},
			cssVars: {},
			dataAttributes: [],
			example: ''
		},
		Input: {
			import: '@dryui/ui',
			description: 'Text input',
			category: 'input',
			tags: ['form'],
			compound: false,
			props: {},
			cssVars: {},
			dataAttributes: [],
			example: ''
		},
		Textarea: {
			import: '@dryui/ui',
			description: 'Multi-line text input',
			category: 'input',
			tags: ['form'],
			compound: false,
			props: {},
			cssVars: {},
			dataAttributes: [],
			example: ''
		},
		Card: {
			import: '@dryui/ui',
			description: 'Content container',
			category: 'display',
			tags: ['surface'],
			compound: true,
			parts: { Root: { props: {} } },
			cssVars: {},
			dataAttributes: [],
			example: ''
		},
		Badge: {
			import: '@dryui/ui',
			description: 'Status indicator',
			category: 'display',
			tags: ['status'],
			compound: false,
			props: {},
			cssVars: {},
			dataAttributes: [],
			example: ''
		}
	}
} as const;

describe('getCategories', () => {
	test('returns sorted unique categories', () => {
		const cats = getCategories(mockSpec);
		expect(cats).toEqual(['action', 'display', 'input']);
	});
});

describe('groupByCategory', () => {
	test('groups components correctly', () => {
		const groups = groupByCategory(mockSpec);
		expect(groups.get('action')?.length).toBe(1);
		expect(groups.get('action')?.[0]?.name).toBe('Button');
		expect(groups.get('input')?.length).toBe(2);
		expect(groups.get('display')?.length).toBe(2);
	});

	test('sorts components within category alphabetically', () => {
		const groups = groupByCategory(mockSpec);
		const display = groups.get('display');
		expect(display).toBeDefined();
		if (display) {
			const first = display[0];
			const second = display[1];
			expect(first).toBeDefined();
			expect(second).toBeDefined();
			if (first) expect(first.name).toBe('Badge');
			if (second) expect(second.name).toBe('Card');
		}
	});
});

describe('getList — all components', () => {
	test('lists all components when no category filter', () => {
		const { output, error, exitCode } = getList(null, mockSpec, 'text');
		expect(exitCode).toBe(0);
		expect(error).toBeNull();
		expect(output).toContain('Action:');
		expect(output).toContain('Button');
		expect(output).toContain('Display:');
		expect(output).toContain('Card');
		expect(output).toContain('Badge');
		expect(output).toContain('Input:');
		expect(output).toContain('Textarea');
	});

	test('includes descriptions', () => {
		const { output } = getList(null, mockSpec, 'text');
		expect(output).toContain('Interactive button');
		expect(output).toContain('Content container');
		expect(output).toContain('Text input');
	});

	test('categories are capitalized in output', () => {
		const { output } = getList(null, mockSpec, 'text');
		expect(output).toContain('Action:');
		expect(output).toContain('Display:');
		expect(output).toContain('Input:');
	});
});

describe('getList — filtered by category', () => {
	test('filters by category', () => {
		const { output, error, exitCode } = getList('input', mockSpec, 'text');
		expect(exitCode).toBe(0);
		expect(error).toBeNull();
		expect(output).toContain('Input:');
		expect(output).toContain('Textarea');
		expect(output).not.toContain('Button');
		expect(output).not.toContain('Card');
	});

	test('single category result contains all members', () => {
		const { output } = getList('display', mockSpec, 'text');
		expect(output).toContain('Badge');
		expect(output).toContain('Card');
		expect(output).toContain('Status indicator');
		expect(output).toContain('Content container');
	});
});

describe('getList — unknown category', () => {
	test('returns error for unknown category', () => {
		const { output, error, exitCode } = getList('nonexistent', mockSpec, 'text');
		expect(exitCode).toBe(1);
		expect(output).toBe('');
		expect(error).not.toBeNull();
		expect(error).toContain('Unknown category "nonexistent"');
	});

	test('error lists valid categories', () => {
		const { error } = getList('nonexistent', mockSpec, 'text');
		expect(error).toContain('Available:');
		expect(error).toContain('action');
		expect(error).toContain('display');
		expect(error).toContain('input');
	});

	test('emits toon error in toon mode', () => {
		const { output, error, exitCode } = getList('nonexistent', mockSpec, 'toon');
		expect(exitCode).toBe(1);
		expect(output).toBe('');
		expect(error).toContain('error[1]');
		expect(error).toContain('invalid-category');
	});
});
