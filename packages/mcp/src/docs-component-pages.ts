import {
	componentDocsSlug,
	componentRootImport,
	componentSubpathImport
} from './component-identity.js';
import { docsNavComponentNames } from './component-catalog.js';
import type { ComponentDef, ForwardedPropsDef, PartDef, PropDef, Spec } from './spec-types.js';

export interface DocsComponentPageEntry {
	readonly name: string;
	readonly slug: string;
	readonly description: string;
	readonly category: string;
	readonly sourcePackage: ComponentDef['import'];
	readonly compound: boolean;
	readonly props: Record<string, PropDef> | null;
	readonly parts: Record<string, PartDef> | null;
	readonly forwardedProps: ForwardedPropsDef | null;
	readonly groups: ComponentDef['groups'] | null;
	readonly a11y: string[];
	readonly cssVars: ComponentDef['cssVars'];
	readonly dataAttributes: ComponentDef['dataAttributes'];
	readonly rootImport: string;
	readonly subpathImport: string;
	readonly quickStartCode: string;
}

export interface DocsComponentPagesManifest {
	readonly layoutHints: readonly string[];
	readonly components: Record<string, DocsComponentPageEntry>;
}

const DOCS_COMPONENT_PAGE_LAYOUT_HINTS = [
	'Keep page-level grid, flex, and container layout in src/layout.css, scoped under data-layout hooks.',
	'Use data-layout and data-layout-area attributes for page zones; component examples should stay focused on component-local markup.',
	'When a component page needs shared tracks, define grid-template-columns under the owning [data-layout] rule in src/layout.css.'
] as const;

function stripRootWrapper(name: string, source: string): string {
	const rootOpen = new RegExp(`^\\s*<${name}\\.Root>\\s*$`, 'gm');
	const rootClose = new RegExp(`^\\s*</${name}\\.Root>\\s*$`, 'gm');

	return source
		.replace(rootOpen, '')
		.replace(rootClose, '')
		.replace(/\n{3,}/g, '\n\n')
		.trim();
}

function collectExampleImports(example: string): string[] {
	const seen = new Set<string>();

	for (const match of example.matchAll(/<([A-Z][A-Za-z0-9]*)(?:\.[A-Z][A-Za-z0-9]*)?/g)) {
		const componentName = match[1];
		if (componentName) seen.add(componentName);
	}

	return [...seen];
}

function assertRouteableComponent(name: string, component: ComponentDef): void {
	if (component.import === '@dryui/ui') return;

	throw new Error(
		`Docs component page "${name}" is routeable but is not exported from @dryui/ui. ` +
			'Only /components/[slug] pages belong in the docs component page manifest.'
	);
}

function getRootImport(name: string, component: ComponentDef): string {
	return componentRootImport(name, component.import);
}

function getSubpathImport(name: string, component: ComponentDef): string {
	return componentSubpathImport(name, component.import);
}

function buildQuickStartCode(
	name: string,
	component: ComponentDef,
	themeImports: Spec['themeImports']
): string {
	const hasRootPart = Boolean(component.parts?.Root);
	const example = hasRootPart ? component.example : stripRootWrapper(name, component.example);
	const lines: string[] = ['<script lang="ts">'];
	const importNames = [name, ...collectExampleImports(example).filter((item) => item !== name)];

	lines.push(`  import '${themeImports.default}';`);
	lines.push(`  import '${themeImports.dark}';`);
	lines.push(`  import { ${importNames.join(', ')} } from '${component.import}';`);
	lines.push('</script>');
	lines.push('');
	lines.push(example);

	return lines.join('\n');
}

function buildDocsComponentPageEntry(
	name: string,
	component: ComponentDef,
	spec: Spec
): DocsComponentPageEntry {
	assertRouteableComponent(name, component);

	return {
		name,
		slug: componentDocsSlug(name),
		description: component.description,
		category: component.category,
		sourcePackage: component.import,
		compound: component.compound,
		props: component.props ?? null,
		parts: component.parts ?? null,
		forwardedProps: component.forwardedProps ?? null,
		groups: component.groups ?? null,
		a11y: component.a11y ?? [],
		cssVars: component.cssVars,
		dataAttributes: component.dataAttributes,
		rootImport: getRootImport(name, component),
		subpathImport: getSubpathImport(name, component),
		quickStartCode: buildQuickStartCode(name, component, spec.themeImports)
	};
}

export function buildDocsComponentPagesManifest(spec: Spec): DocsComponentPagesManifest {
	const routeableComponentNames = new Set(docsNavComponentNames);

	for (const name of docsNavComponentNames) {
		if (!spec.components[name]) {
			throw new Error(`Docs component page "${name}" is missing from spec.components.`);
		}
	}

	return {
		layoutHints: DOCS_COMPONENT_PAGE_LAYOUT_HINTS,
		components: Object.fromEntries(
			Object.entries(spec.components)
				.filter(([name]) => routeableComponentNames.has(name))
				.map(([name, component]) => [name, buildDocsComponentPageEntry(name, component, spec)])
		)
	};
}
