import {
	componentImplementationDir,
	componentRootImport,
	componentSubpathImport
} from './component-identity.js';
import type { ComponentDef, CompositionComponentDef, Spec } from './spec-types.js';

const REPO_URL = 'https://github.com/rob-balfre/dryui';

export interface DocsComponentPageEntry {
	readonly component: ComponentDef;
	readonly related: CompositionComponentDef | null;
	readonly hasRootPart: boolean;
	readonly sourceUrl: string;
	readonly rootImport: string;
	readonly subpathImport: string | null;
	readonly quickStartCode: string;
}

export interface DocsComponentPagesManifest {
	readonly themeImports: Spec['themeImports'];
	readonly components: Record<string, DocsComponentPageEntry>;
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

function collectExampleImports(example: string): string[] {
	const seen = new Set<string>();

	for (const match of example.matchAll(/<([A-Z][A-Za-z0-9]*)(?:\.[A-Z][A-Za-z0-9]*)?/g)) {
		const componentName = match[1];
		if (componentName) seen.add(componentName);
	}

	return [...seen];
}

function sourcePackage(component: ComponentDef): 'ui' | 'primitives' {
	return component.import === '@dryui/primitives' ? 'primitives' : 'ui';
}

function getRootImport(name: string, component: ComponentDef): string {
	return componentRootImport(name, component.import);
}

function getSubpathImport(name: string, component: ComponentDef): string | null {
	if (component.import !== '@dryui/ui') return null;
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

	if (component.import === '@dryui/ui') {
		lines.push(`  import '${themeImports.default}';`);
		lines.push(`  import '${themeImports.dark}';`);
	}

	lines.push(`  import { ${importNames.join(', ')} } from '${component.import}';`);
	lines.push('</script>');
	lines.push('');
	lines.push(example);

	return lines.join('\n');
}

function normalizeCompositionKey(name: string): string {
	return name.toLowerCase().replace(/[^a-z0-9]+/g, '');
}

function buildDocsComponentPageEntry(
	name: string,
	component: ComponentDef,
	spec: Spec
): DocsComponentPageEntry {
	return {
		component,
		related: spec.composition?.components[normalizeCompositionKey(name)] ?? null,
		hasRootPart: Boolean(component.parts?.Root),
		sourceUrl: `${REPO_URL}/tree/main/packages/${sourcePackage(component)}/src/${componentImplementationDir(name)}`,
		rootImport: getRootImport(name, component),
		subpathImport: getSubpathImport(name, component),
		quickStartCode: buildQuickStartCode(name, component, spec.themeImports)
	};
}

export function buildDocsComponentPagesManifest(spec: Spec): DocsComponentPagesManifest {
	return {
		themeImports: spec.themeImports,
		components: Object.fromEntries(
			Object.entries(spec.components).map(([name, component]) => [
				name,
				buildDocsComponentPageEntry(name, component, spec)
			])
		)
	};
}
