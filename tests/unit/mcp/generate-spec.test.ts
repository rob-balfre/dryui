import { describe, expect, test } from 'bun:test';
import { fileURLToPath } from 'node:url';
import {
	generateExample,
	parseCompoundParts,
	parsePartContract
} from '../../../packages/mcp/src/generate-spec.ts';

const typographyIndexUrl = new URL('../../../packages/ui/src/typography/index.ts', import.meta.url);
const typographyIndexPath = fileURLToPath(typographyIndexUrl);
const typographyIndex = await Bun.file(typographyIndexUrl).text();
const primitiveTypographyIndexUrl = new URL(
	'../../../packages/primitives/src/typography/index.ts',
	import.meta.url
);
const primitiveTypographyIndexPath = fileURLToPath(primitiveTypographyIndexUrl);
const primitiveTypographyIndex = await Bun.file(primitiveTypographyIndexUrl).text();
const spec = (await Bun.file(
	new URL('../../../packages/mcp/src/spec.json', import.meta.url)
).json()) as {
	components: Record<string, { a11y?: string[] }>;
};

describe('generate-spec typography parsing', () => {
	test('captures primitive typography heading props and accepted values', () => {
		const parts = parseCompoundParts(primitiveTypographyIndex, 'Typography');
		expect(parts).toEqual(['Heading', 'Text', 'Code', 'Blockquote']);

		const heading = parsePartContract(
			primitiveTypographyIndex,
			'Typography',
			'Heading',
			primitiveTypographyIndexPath
		);
		expect(Object.keys(heading.props)).toContain('level');
		expect(heading.props.level?.acceptedValues).toEqual(['1', '2', '3', '4', '5', '6']);
	});

	test('captures ui typography text overrides', () => {
		const text = parsePartContract(typographyIndex, 'Typography', 'Text', typographyIndexPath);

		expect(Object.keys(text.props)).toEqual(expect.arrayContaining(['color', 'size', 'variant']));
		expect(text.props.color?.acceptedValues).toEqual(['default', 'muted', 'secondary']);
		expect(text.props.size?.acceptedValues).toEqual(['xs', 'sm', 'md', 'lg']);
		expect(text.forwardedProps?.baseType).toBe("Omit<HTMLAttributes<HTMLElement>, 'class'>");
	});

	test('captures ui typography heading props through export type re-exports', () => {
		const heading = parsePartContract(
			typographyIndex,
			'Typography',
			'Heading',
			typographyIndexPath
		);

		expect(Object.keys(heading.props)).toEqual(
			expect.arrayContaining(['level', 'variant', 'className'])
		);
		expect(heading.props.variant?.acceptedValues).toEqual(['default', 'display']);
	});

	test('generates rootless examples when a namespace has no Root part', () => {
		const example = generateExample('Typography', true, ['Heading', 'Text', 'Code', 'Blockquote']);

		expect(example).toContain('<Typography.Heading');
		expect(example).not.toContain('.Root');
	});

	test('generated spec includes accessibility notes for every component', () => {
		for (const [name, def] of Object.entries(spec.components)) {
			expect(def.a11y?.length, `${name} is missing accessibility guidance`).toBeGreaterThan(0);
		}
	});
});
