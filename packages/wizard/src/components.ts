import spec from '@dryui/mcp/spec';
import type { WizardComponentDefinition, WizardComponentGroup, WizardRegionId } from './types.js';

type SpecComponent = {
	readonly description: string;
	readonly category: string;
	readonly tags: readonly string[];
	readonly compound?: boolean;
	readonly import?: string;
};

interface CuratedComponentSeed {
	readonly name: string;
	readonly regions: readonly WizardRegionId[];
}

const PLACEABLE_COMPONENTS: readonly CuratedComponentSeed[] = [
	{ name: 'Sidebar', regions: ['sidebar'] },
	{ name: 'PageHeader', regions: ['header'] },
	{ name: 'Breadcrumb', regions: ['header', 'main'] },
	{ name: 'Tabs', regions: ['header', 'main'] },
	{ name: 'Button', regions: ['header', 'sidebar', 'main', 'footer'] },
	{ name: 'Link', regions: ['header', 'sidebar', 'main', 'footer'] },
	{ name: 'Badge', regions: ['header', 'sidebar', 'main', 'footer'] },
	{ name: 'Heading', regions: ['header', 'sidebar', 'main', 'footer'] },
	{ name: 'Text', regions: ['header', 'sidebar', 'main', 'footer'] },
	{ name: 'Container', regions: ['header', 'sidebar', 'main', 'footer'] },
	{ name: 'Stack', regions: ['header', 'sidebar', 'main', 'footer'] },
	{ name: 'Flex', regions: ['header', 'sidebar', 'main', 'footer'] },
	{ name: 'Separator', regions: ['header', 'sidebar', 'main', 'footer'] },
	{ name: 'Card', regions: ['header', 'sidebar', 'main', 'footer'] },
	{ name: 'Alert', regions: ['header', 'main', 'footer'] },
	{ name: 'EmptyState', regions: ['main'] },
	{ name: 'List', regions: ['sidebar', 'main'] },
	{ name: 'Table', regions: ['main'] },
	{ name: 'DataGrid', regions: ['main'] },
	{ name: 'DescriptionList', regions: ['main', 'footer'] },
	{ name: 'StatCard', regions: ['main'] },
	{ name: 'ScrollArea', regions: ['sidebar', 'main'] },
	{ name: 'Field', regions: ['main', 'footer'] },
	{ name: 'Fieldset', regions: ['main', 'footer'] },
	{ name: 'Input', regions: ['header', 'main', 'footer'] },
	{ name: 'Textarea', regions: ['main', 'footer'] },
	{ name: 'Checkbox', regions: ['main', 'footer'] },
	{ name: 'Select', regions: ['main', 'footer'] },
	{ name: 'Combobox', regions: ['header', 'main'] }
] as const;

function getComponentSource(name: string): SpecComponent {
	const source = spec.components[name as keyof typeof spec.components] as SpecComponent | undefined;
	if (!source) {
		throw new Error(`Missing DryUI component metadata for ${name}`);
	}

	return source;
}

function capitalize(value: string): string {
	return value.slice(0, 1).toUpperCase() + value.slice(1);
}

function buildComponent(seed: CuratedComponentSeed): WizardComponentDefinition {
	const source = getComponentSource(seed.name);
	return {
		name: seed.name,
		category: source.category,
		description: source.description,
		tags: source.tags,
		compound: Boolean(source.compound),
		importPath: source.import ?? '@dryui/ui',
		regions: seed.regions,
		previewable: true
	};
}

function groupComponents(
	components: readonly WizardComponentDefinition[]
): readonly WizardComponentGroup[] {
	const groups = new Map<string, WizardComponentDefinition[]>();

	for (const component of components) {
		const bucket = groups.get(component.category) ?? [];
		bucket.push(component);
		groups.set(component.category, bucket);
	}

	return [...groups.entries()]
		.sort(([left], [right]) => left.localeCompare(right))
		.map(([category, bucket]) => ({
			category,
			label: capitalize(category),
			components: bucket.sort((left, right) => left.name.localeCompare(right.name))
		}));
}

function buildRegionIndex(
	components: readonly WizardComponentDefinition[]
): Readonly<Record<WizardRegionId, readonly string[]>> {
	const index: Record<WizardRegionId, string[]> = {
		header: [],
		sidebar: [],
		main: [],
		footer: []
	};

	for (const component of components) {
		for (const region of component.regions) {
			index[region].push(component.name);
		}
	}

	return {
		header: index.header.sort(),
		sidebar: index.sidebar.sort(),
		main: index.main.sort(),
		footer: index.footer.sort()
	};
}

const components = PLACEABLE_COMPONENTS.map(buildComponent).sort((left, right) =>
	left.name.localeCompare(right.name)
);

export const WIZARD_COMPONENTS = components;
export const WIZARD_COMPONENT_GROUPS = groupComponents(components);
export const WIZARD_COMPONENTS_BY_REGION = buildRegionIndex(components);

export function findWizardComponent(name: string): WizardComponentDefinition | undefined {
	return WIZARD_COMPONENTS.find((component) => component.name === name);
}

export function getWizardComponentsForRegion(
	region: WizardRegionId
): readonly WizardComponentDefinition[] {
	return WIZARD_COMPONENTS.filter((component) => component.regions.includes(region));
}

export function componentSupportsRegion(componentName: string, region: WizardRegionId): boolean {
	return WIZARD_COMPONENTS_BY_REGION[region].includes(componentName);
}

export function isWizardComponentName(name: string): boolean {
	return Boolean(findWizardComponent(name));
}

export function normalizeComponentSelection(selection: readonly string[]): readonly string[] {
	const known = new Set(WIZARD_COMPONENTS.map((component) => component.name));
	return [...new Set(selection)].filter((name) => known.has(name)).sort();
}
