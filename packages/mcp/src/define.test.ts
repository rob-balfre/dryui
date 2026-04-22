import { describe, expect, test } from 'bun:test';
import { componentMetaSchema, createLibrary, defineComponent } from './define.ts';

describe('defineComponent', () => {
	test('validates and returns a well-formed config', () => {
		const meta = defineComponent({
			name: 'Button',
			description: 'Interactive button',
			category: 'action',
			tags: ['form', 'action']
		});
		expect(meta.name).toBe('Button');
		expect(meta.surface).toBeUndefined();
		expect(meta.tags).toEqual(['form', 'action']);
	});

	test('accepts a primitive surface', () => {
		const meta = defineComponent({
			name: 'Hero',
			description: 'Primitive hero',
			category: 'layout',
			tags: [],
			surface: 'primitive'
		});
		expect(meta.surface).toBe('primitive');
	});

	test('rejects an empty name', () => {
		expect(() =>
			defineComponent({ name: '', description: 'x', category: 'y', tags: [] })
		).toThrow();
	});

	test('rejects an invalid surface', () => {
		const parsed = componentMetaSchema.safeParse({
			name: 'X',
			description: 'x',
			category: 'y',
			tags: [],
			surface: 'bogus'
		});
		expect(parsed.success).toBe(false);
	});
});

describe('createLibrary', () => {
	const metas = [
		defineComponent({ name: 'Button', description: 'b', category: 'action', tags: ['a'] }),
		defineComponent({
			name: 'Hero',
			description: 'h',
			category: 'layout',
			tags: ['a', 'b'],
			surface: 'primitive'
		}),
		defineComponent({ name: 'Alert', description: 'al', category: 'feedback', tags: ['a'] })
	];

	test('indexes by name, category, and tag', () => {
		const lib = createLibrary(metas);
		expect(lib.byName.get('Button')?.description).toBe('b');
		expect(lib.byCategory.get('action')?.map((m) => m.name)).toEqual(['Button']);
		expect(
			lib.byTag
				.get('a')
				?.map((m) => m.name)
				.sort()
		).toEqual(['Alert', 'Button', 'Hero']);
	});

	test('collects primitive names sorted', () => {
		const lib = createLibrary(metas);
		expect(lib.primitiveNames).toEqual(['Hero']);
	});

	test('throws on duplicate names', () => {
		expect(() => createLibrary([metas[0], metas[0]])).toThrow(/duplicate/);
	});
});
