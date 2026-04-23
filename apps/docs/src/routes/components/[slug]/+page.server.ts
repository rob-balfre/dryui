import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { fromSlug, getCategoryLabel } from '../../../lib/nav';
import type { CatalogKind } from '../../../lib/nav';
import componentPages from '$lib/generated/component-pages.json';

interface PropDef {
	type: string;
	required?: boolean;
	default?: string;
	bindable?: boolean;
	acceptedValues?: string[];
	description?: string;
	note?: string;
}

interface DataAttributeDef {
	name: string;
	description?: string;
	values?: string[];
}

interface ForwardedPropsDef {
	note: string;
	examples?: string[];
	omitted?: string[];
}

interface StructureDef {
	tree: string[];
	note?: string;
}

interface ComponentPart {
	props?: Record<string, PropDef> | null;
	forwardedProps?: ForwardedPropsDef | null;
}

interface ComponentSpec {
	import: string;
	description: string;
	category: string;
	tags: string[];
	compound: boolean;
	props?: Record<string, PropDef> | null;
	parts?: Record<string, ComponentPart> | null;
	forwardedProps?: ForwardedPropsDef | null;
	structure?: StructureDef | null;
	groups?: { name: string; props: string[] }[];
	a11y?: string[];
	cssVars: Record<string, string>;
	dataAttributes: DataAttributeDef[];
	example: string;
}

interface CompositionAlternative {
	rank: number;
	component: string;
	useWhen: string;
	snippet: string;
}

interface CompositionAntiPattern {
	pattern: string;
	reason: string;
	fix: string;
}

interface CompositionComponent {
	component: string;
	useWhen: string;
	alternatives: CompositionAlternative[];
	antiPatterns: CompositionAntiPattern[];
	combinesWith: string[];
}

interface ComponentPageManifest {
	themeImports: {
		default: string;
		dark: string;
	};
	components: Record<string, { component: ComponentSpec; related: CompositionComponent | null }>;
}

interface ComponentPageData {
	name: string;
	kind: CatalogKind;
	description: string;
	category: string;
	tags: string[];
	compound: boolean;
	hasRootPart: boolean;
	props: Record<string, PropDef> | null;
	parts: Record<string, ComponentPart> | null;
	forwardedProps: ForwardedPropsDef | null;
	structure: StructureDef | null;
	groups?: { name: string; props: string[] }[] | null;
	a11y: string[];
	cssVars: Record<string, string>;
	dataAttributes: DataAttributeDef[];
	sourceUrl: string;
	related: CompositionComponent | null;
	example: string;
	rootImport: string;
	subpathImport: string | null;
	quickStartCode: string;
}

const componentPageManifest = componentPages as ComponentPageManifest;
const components = componentPageManifest.components;
const REPO_URL = 'https://github.com/rob-balfre/dryui';

function componentDir(name: string): string {
	const overrides: Record<string, string> = {
		QRCode: 'qr-code'
	};

	return overrides[name] ?? name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

function stripRootWrapper(name: string, source: string): string {
	const rootOpen = new RegExp(`^\\s*<${name}\\.Root>\\s*$`, 'gm');
	const rootClose = new RegExp(`^\\s*</${name}\\.Root>\\s*$`, 'gm');

	return source
		.replace(rootOpen, '')
		.replace(rootClose, '')
		.replace(/\n{3,}/g, '\n\n')
		.trim();
}

function sourcePackage(kind: CatalogKind): 'ui' | 'primitives' {
	return kind === 'primitive' ? 'primitives' : 'ui';
}

function collectExampleImports(example: string): string[] {
	const seen = new Set<string>();

	for (const match of example.matchAll(/<([A-Z][A-Za-z0-9]*)(?:\.[A-Z][A-Za-z0-9]*)?/g)) {
		const componentName = match[1];
		if (componentName) seen.add(componentName);
	}

	return [...seen];
}

function buildQuickStartCode(name: string, component: ComponentSpec, hasRootPart: boolean): string {
	const example = hasRootPart ? component.example : stripRootWrapper(name, component.example);
	const lines: string[] = ['<script lang="ts">'];
	const importNames = [name, ...collectExampleImports(example).filter((item) => item !== name)];

	if (component.import === '@dryui/ui') {
		lines.push(`  import '${componentPageManifest.themeImports.default}';`);
		lines.push(`  import '${componentPageManifest.themeImports.dark}';`);
	}

	lines.push(`  import { ${importNames.join(', ')} } from '${component.import}';`);
	lines.push('</script>');
	lines.push('');
	lines.push(example);

	return lines.join('\n');
}

export const load: PageServerLoad = async ({ params }) => {
	const entry = fromSlug(params.slug);
	if (!entry) {
		throw error(404, `Component "${params.slug}" not found`);
	}

	const manifestEntry = components[entry.name];
	if (!manifestEntry) {
		throw error(404, `Component "${params.slug}" not found`);
	}

	const { component, related } = manifestEntry;
	const hasRootPart = Boolean(component.parts?.Root);
	const data: ComponentPageData = {
		name: entry.name,
		kind: entry.kind,
		description: component.description,
		category: getCategoryLabel(entry.name) ?? component.category,
		tags: component.tags,
		compound: component.compound,
		hasRootPart,
		props: component.props ?? null,
		parts: component.parts ?? null,
		forwardedProps: component.forwardedProps ?? null,
		structure: component.structure ?? null,
		groups: component.groups ?? null,
		a11y: component.a11y ?? [],
		cssVars: component.cssVars,
		dataAttributes: component.dataAttributes,
		sourceUrl: `${REPO_URL}/tree/main/packages/${sourcePackage(entry.kind)}/src/${componentDir(entry.name)}`,
		related,
		example: component.example,
		rootImport: `import { ${entry.name} } from '${component.import}'`,
		subpathImport:
			component.import === '@dryui/ui'
				? `import { ${entry.name} } from '${component.import}/${componentDir(entry.name)}'`
				: null,
		quickStartCode: buildQuickStartCode(entry.name, component, hasRootPart)
	};

	return data;
};
