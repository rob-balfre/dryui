import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { fromSlug, getCategoryLabel } from '../../../lib/nav';
import type { CatalogKind } from '../../../lib/nav';
import componentPages from '$lib/generated/component-pages.json';
import type { DocsComponentPagesManifest } from '../../../../../../packages/mcp/src/docs-component-pages.js';
import type {
	ComponentDef,
	CompositionComponentDef,
	ForwardedPropsDef,
	PartDef,
	PropDef,
	StructureDef
} from '../../../../../../packages/mcp/src/spec-types.js';

interface ComponentPageData {
	name: string;
	kind: CatalogKind;
	description: string;
	category: string;
	tags: string[];
	compound: boolean;
	hasRootPart: boolean;
	props: Record<string, PropDef> | null;
	parts: Record<string, PartDef> | null;
	forwardedProps: ForwardedPropsDef | null;
	structure: StructureDef | null;
	groups?: ComponentDef['groups'] | null;
	a11y: string[];
	cssVars: Record<string, string>;
	dataAttributes: ComponentDef['dataAttributes'];
	sourceUrl: string;
	related: CompositionComponentDef | null;
	example: string;
	rootImport: string;
	subpathImport: string | null;
	quickStartCode: string;
}

const componentPageManifest = componentPages as DocsComponentPagesManifest;
const components = componentPageManifest.components;

export const load: PageServerLoad = async ({ params }) => {
	const entry = fromSlug(params.slug);
	if (!entry) {
		throw error(404, `Component "${params.slug}" not found`);
	}

	const manifestEntry = components[entry.name];
	if (!manifestEntry) {
		throw error(404, `Component "${params.slug}" not found`);
	}

	const { component } = manifestEntry;
	const data: ComponentPageData = {
		name: entry.name,
		kind: entry.kind,
		description: component.description,
		category: getCategoryLabel(entry.name) ?? component.category,
		tags: component.tags,
		compound: component.compound,
		hasRootPart: manifestEntry.hasRootPart,
		props: component.props ?? null,
		parts: component.parts ?? null,
		forwardedProps: component.forwardedProps ?? null,
		structure: component.structure ?? null,
		groups: component.groups ?? null,
		a11y: component.a11y ?? [],
		cssVars: component.cssVars,
		dataAttributes: component.dataAttributes,
		sourceUrl: manifestEntry.sourceUrl,
		related: manifestEntry.related,
		example: component.example,
		rootImport: manifestEntry.rootImport,
		subpathImport: manifestEntry.subpathImport,
		quickStartCode: manifestEntry.quickStartCode
	};

	return data;
};
