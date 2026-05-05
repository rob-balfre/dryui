import { describe, expect, test } from 'bun:test';
import { fileURLToPath } from 'node:url';
import {
	generateExample as generateExampleCompat,
	parseCompoundParts,
	parsePartContract
} from '../../../packages/mcp/src/generate-spec.ts';
import { buildCompositionSpec } from '../../../packages/mcp/src/spec-composition.ts';
import { generateExample } from '../../../packages/mcp/src/spec-examples.ts';
import {
	applyPropSourceFacts,
	type PropShape
} from '../../../packages/mcp/src/spec-source-extraction.ts';
import {
	createStyleSurfaceAccumulator,
	addStyleSurfaceSource,
	finalizeStyleSurface
} from '../../../packages/mcp/src/spec-style-surface.ts';
import { deriveStructure, describeDataAttribute } from '../../../packages/mcp/src/spec-prose.ts';

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
		expect(
			generateExampleCompat('Typography', true, ['Heading', 'Text', 'Code', 'Blockquote'])
		).toBe(example);
	});

	test('generated spec includes accessibility notes for every component', () => {
		for (const [name, def] of Object.entries(spec.components)) {
			expect(def.a11y?.length, `${name} is missing accessibility guidance`).toBeGreaterThan(0);
		}
	});
});

describe('generate-spec extracted facts', () => {
	test('applies default and bindable source facts only to known props', () => {
		const props: Record<string, PropShape> = {
			value: { type: 'string' },
			label: { type: 'string' }
		};

		applyPropSourceFacts(props, {
			defaults: { value: "''", missing: 'true' },
			bindableProps: ['value', 'missing']
		});

		expect(props.value).toEqual({ type: 'string', default: "''", bindable: true });
		expect(props.label).toEqual({ type: 'string' });
	});

	test('derives structure and describes data attributes from prose facts', () => {
		const structure = deriveStructure(
			'<Tabs.Root>\n  <Tabs.List><Tabs.Trigger /></Tabs.List>\n  <Tabs.Content />\n</Tabs.Root>',
			'Tabs'
		);

		expect(structure?.tree).toEqual([
			'Tabs.Root',
			'  Tabs.List',
			'    Tabs.Trigger',
			'  Tabs.Content'
		]);
		expect(structure?.note).toContain('Tabs.List');
		expect(describeDataAttribute('Tabs', 'data-state')).toEqual({
			name: 'data-state',
			description: 'Reflects whether the tab trigger or panel is active.',
			values: ['active', 'inactive']
		});
	});

	test('extracts filtered style surface facts from source text', () => {
		const surface = createStyleSurfaceAccumulator();

		addStyleSurfaceSource(
			surface,
			`
			.card {
				--dry-card-bg: red;
				--dry-dialog-bg: blue;
				--_dry-card-padding: var(--dry-card-padding-block, var(--dry-card-padding, 0));
			}
			.card[data-card-state='open'] [data-side='top'] {}
		`,
			{
				cssVarPrefixes: ['--dry-card-'],
				dataAttrPrefixes: ['data-card-']
			}
		);

		expect(finalizeStyleSurface(surface)).toEqual({
			cssVars: {
				'--dry-card-bg': 'Background color',
				'--dry-card-padding': 'Padding',
				'--dry-card-padding-block': 'Padding Block'
			},
			dataAttributes: ['data-card-state']
		});
	});

	test('indexes composition data and rejects duplicate component keys', () => {
		const composition = {
			component: 'Button',
			useWhen: 'Need an action',
			alternatives: [],
			antiPatterns: [],
			combinesWith: []
		};
		const recipe = {
			name: 'button-action',
			description: 'Button recipe',
			tags: [],
			components: ['Button'],
			snippet: '<Button>Save</Button>'
		};

		expect(
			buildCompositionSpec({
				componentCompositions: [composition],
				compositionRecipes: [recipe]
			}).components.button
		).toEqual(composition);
		expect(() =>
			buildCompositionSpec({
				componentCompositions: [composition, { ...composition, component: 'button' }],
				compositionRecipes: [recipe]
			})
		).toThrow('composition component names must be unique: button');
	});
});
