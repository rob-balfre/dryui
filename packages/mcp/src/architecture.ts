import { readFileSync } from 'node:fs';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseCompoundParts } from './generate-spec.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '../../..');
const uiSrc = resolve(__dirname, '../../ui/src');
const primitivesSrc = resolve(__dirname, '../../primitives/src');
const uiPackagePath = resolve(__dirname, '../../ui/package.json');
const primitivesPackagePath = resolve(__dirname, '../../primitives/package.json');
const specPath = resolve(__dirname, 'spec.json');
const architectureJsonPath = resolve(__dirname, 'architecture.json');
const docsNavPath = resolve(__dirname, '../../../apps/docs/src/lib/nav.ts');
const reportPath = resolve(repoRoot, 'reports/architecture-audit.md');

const ARCHITECTURE_JSON_URL = new URL('./architecture.json', import.meta.url);

const DIR_OVERRIDES: Record<string, string> = {
	QRCode: 'qr-code'
};

const NAME_OVERRIDES: Record<string, string> = {
	'qr-code': 'QRCode'
};

const PACKAGE_NODE_LABELS = {
	primitives: 'Primitives',
	ui: 'UI',
	docs: 'Docs',
	audit: 'Audit'
} as const;

type PackageKind = 'primitives' | 'ui';

type RuntimeSpecComponent = {
	import: '@dryui/primitives' | '@dryui/ui';
	description: string;
	category: string;
	tags: string[];
	compound: boolean;
	parts?: Record<string, unknown>;
};

type RuntimeSpec = {
	version: string;
	package: string;
	components: Record<string, RuntimeSpecComponent>;
	composition?: {
		components?: Record<
			string,
			{
				component: string;
				combinesWith: string[];
				alternatives: Array<{ component: string }>;
			}
		>;
	};
};

type ClusterPriority = 'canonicalize-now' | 'document-decision-tree' | 'watch';

type ClusterDefinition = {
	id: string;
	title: string;
	priority: ClusterPriority;
	summary: string;
	components: string[];
	recommendations: string[];
};

const CLUSTER_DEFINITIONS: ClusterDefinition[] = [
	// Add only unresolved public duplication problems here.
];

export type DolphinNodeKind = 'component' | 'part' | 'cluster';
export type DolphinLayer = 'primitive' | 'ui-wrapper' | 'ui-composite' | 'part' | 'cluster';
export type DolphinVisibility = 'root' | 'subpath-only' | 'root+subpath';
export type DolphinEdgeType =
	| 'wraps'
	| 'composes'
	| 'compound_part'
	| 'related'
	| 'docs'
	| 'duplication_cluster';
export type DolphinMismatchKind =
	| 'missing-subpath-export'
	| 'subpath-only-export'
	| 'spec-missing'
	| 'docs-nav-missing'
	| 'docs-nav-orphan';

export interface DolphinNode {
	id: string;
	name: string;
	label: string;
	kind: DolphinNodeKind;
	package: keyof typeof PACKAGE_NODE_LABELS;
	layer: DolphinLayer;
	category: string;
	description: string;
	visibility?: DolphinVisibility;
	sourcePath?: string;
	publicImport?: string;
	tags: string[];
	compound: boolean;
	parts: string[];
	sourceFileCount?: number;
	primitivePartUsageCount?: number;
	componentImportCount?: number;
}

export interface DolphinEdge {
	id: string;
	type: DolphinEdgeType;
	from: string;
	to: string;
	label?: string;
}

export interface DolphinCluster {
	id: string;
	title: string;
	priority: ClusterPriority;
	summary: string;
	components: string[];
	recommendations: string[];
}

export interface DolphinMismatch {
	kind: DolphinMismatchKind;
	package: keyof typeof PACKAGE_NODE_LABELS;
	component: string;
	detail: string;
	sourcePath?: string;
}

export interface DolphinSignals {
	primitivePartComponents: string[];
	thinWrapperComponents: string[];
	subpathOnlyUi: string[];
	subpathOnlyPrimitives: string[];
	specMissingUi: string[];
	specMissingPrimitives: string[];
	docsNavMissing: string[];
	docsNavOrphan: string[];
}

export interface DolphinSummary {
	componentNodes: number;
	partNodes: number;
	catalogNodes: number;
	clusterNodes: number;
	primitiveComponents: number;
	uiComponents: number;
	uiWrappers: number;
	uiComposites: number;
	rootBarrelComponents: number;
	subpathOnlyComponents: number;
	compoundComponents: number;
	wrapEdges: number;
	composeEdges: number;
	docsEdges: number;
	relatedEdges: number;
	mismatches: number;
	primitivePartComponents: number;
	thinWrappers: number;
}

export interface DolphinGraph {
	schema: 'DolphinGraph';
	packageVersion: string;
	summary: DolphinSummary;
	nodes: DolphinNode[];
	edges: DolphinEdge[];
	clusters: DolphinCluster[];
	mismatches: DolphinMismatch[];
	signals: DolphinSignals;
	mermaid: {
		packageOverview: string;
		clusterOverview: string;
	};
}

type PackageSurfaceEntry = {
	name: string;
	dir: string;
	indexPath: string;
	rootBarrel: boolean;
	subpathExport: boolean;
	specMeta: RuntimeSpecComponent | null;
};

type ScanStats = {
	sourceFileCount: number;
	primitivePartUsageCount: number;
	componentImportCount: number;
};

type PackageSurfaceMap = Map<string, PackageSurfaceEntry>;

async function readText(path: string): Promise<string> {
	return readFile(path, 'utf8');
}

function readArchitectureJson(): string {
	return readFileSync(ARCHITECTURE_JSON_URL, 'utf8');
}

function ensureArray<T>(value: Iterable<T>): T[] {
	return [...value];
}

function escapeRegExp(value: string): string {
	return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function sortNames(values: Iterable<string>): string[] {
	return ensureArray(new Set(values)).sort((left, right) => left.localeCompare(right));
}

function relativeRepoPath(path: string): string {
	return relative(repoRoot, path).replaceAll('\\', '/');
}

function pascalFromDir(dir: string): string {
	return (
		NAME_OVERRIDES[dir] ??
		dir
			.split('-')
			.map((part) => part[0]!.toUpperCase() + part.slice(1))
			.join('')
	);
}

function componentDir(name: string): string {
	return DIR_OVERRIDES[name] ?? name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

function visibility(rootBarrel: boolean, subpathExport: boolean): DolphinVisibility {
	if (rootBarrel && subpathExport) return 'root+subpath';
	if (rootBarrel) return 'root';
	return 'subpath-only';
}

function componentNodeId(pkg: PackageKind, name: string): string {
	return `${pkg}:${name}`;
}

function partNodeId(pkg: PackageKind, name: string, part: string): string {
	return `${pkg}:${name}.${part}`;
}

function clusterNodeId(id: string): string {
	return `audit:${id}`;
}

function normalizeComponentToken(token: string): string | null {
	const base = token
		.trim()
		.replace(/\s*\(.*?\)\s*$/u, '')
		.split('.')[0]
		?.trim();

	if (!base || !/^[A-Z]/u.test(base)) return null;
	return base;
}

function parseImportNames(clause: string): string[] {
	return clause
		.split(',')
		.map((part) => part.trim())
		.map((part) => part.replace(/^type\s+/u, ''))
		.map((part) => part.split(/\s+as\s+/u)[0]?.trim() ?? '')
		.filter((part) => /^[A-Z]/u.test(part));
}

function parseRootPackageImports(source: string, packageName: string): string[] {
	const names = new Set<string>();
	const pattern = new RegExp(
		`import\\s+(?:type\\s+)?\\{([\\s\\S]*?)\\}\\s+from\\s+['"]${escapeRegExp(packageName)}['"]`,
		'g'
	);

	for (const match of source.matchAll(pattern)) {
		const clause = match[1];
		if (!clause) continue;
		for (const name of parseImportNames(clause)) {
			names.add(name);
		}
	}

	return sortNames(names);
}

function parseSubpathImports(source: string, packageName: string): string[] {
	const names = new Set<string>();
	const pattern = new RegExp(`from\\s+['"]${escapeRegExp(packageName)}\\/([^'"]+)['"]`, 'g');

	for (const match of source.matchAll(pattern)) {
		const subpath = match[1];
		if (!subpath) continue;
		if (subpath.includes('/')) continue;
		names.add(pascalFromDir(subpath));
	}

	return sortNames(names);
}

function resolveSiblingComponentImport(
	filePath: string,
	sourceRoot: string,
	specifier: string
): string | null {
	if (!specifier.startsWith('.')) return null;

	const resolved = resolve(dirname(filePath), specifier);
	const relativePath = relative(sourceRoot, resolved).replaceAll('\\', '/');
	const segments = relativePath.split('/');

	if (segments.length < 2) return null;
	if (segments[1] !== 'index.js' && segments[1] !== 'index.ts') return null;
	if (segments[0] === 'internal' || segments[0] === 'thumbnail' || segments[0] === 'utils')
		return null;

	return pascalFromDir(segments[0] ?? '');
}

function parseRelativeImports(filePath: string, sourceRoot: string, source: string): string[] {
	const names = new Set<string>();

	for (const match of source.matchAll(/from\s+['"](\.{1,2}\/[^'"]+)['"]/g)) {
		const specifier = match[1];
		if (!specifier) continue;
		const name = resolveSiblingComponentImport(filePath, sourceRoot, specifier);
		if (name) names.add(name);
	}

	return sortNames(names);
}

async function collectSourceFiles(dirPath: string): Promise<string[]> {
	const files: string[] = [];
	const entries = await readdir(dirPath, { withFileTypes: true });

	for (const entry of entries) {
		const nextPath = join(dirPath, entry.name);
		if (entry.isDirectory()) {
			files.push(...(await collectSourceFiles(nextPath)));
			continue;
		}

		if (!entry.isFile()) continue;
		if (!entry.name.endsWith('.ts') && !entry.name.endsWith('.svelte')) continue;
		if (entry.name.endsWith('.d.ts')) continue;
		files.push(nextPath);
	}

	return files.sort();
}

async function parseRootBarrelNames(indexPath: string): Promise<Set<string>> {
	const source = await readText(indexPath);
	const names = new Set<string>();

	for (const match of source.matchAll(
		/export\s+\{\s*([A-Za-z0-9_]+)\b[^}]*\}\s+from\s+['"]\.\/[\w-]+\/index\.js['"]/g
	)) {
		const name = match[1];
		if (!name || !/^[A-Z]/u.test(name)) continue;
		names.add(name);
	}

	return names;
}

async function parseSubpathExports(packagePath: string): Promise<Map<string, string>> {
	const raw = JSON.parse(await readText(packagePath)) as {
		exports?: Record<string, unknown>;
		publishConfig?: {
			exports?: Record<string, unknown>;
		};
	};
	const names = new Map<string, string>();
	const exportMap = raw.publishConfig?.exports ?? raw.exports ?? {};

	for (const [key, value] of Object.entries(exportMap)) {
		if (key === '.') continue;
		if (!/^\.[/][a-z0-9-]+$/u.test(key)) continue;

		const target =
			typeof value === 'string'
				? value
				: typeof value === 'object' &&
					  value !== null &&
					  'default' in value &&
					  typeof value.default === 'string'
					? value.default
					: typeof value === 'object' &&
						  value !== null &&
						  'svelte' in value &&
						  typeof value.svelte === 'string'
						? value.svelte
						: null;

		if (!target) continue;

		const srcPrefix = './src/';
		const distPrefix = './dist/';
		const indexSuffix = target.endsWith('/index.ts')
			? '/index.ts'
			: target.endsWith('/index.js')
				? '/index.js'
				: null;

		if (!indexSuffix) continue;
		if (!target.startsWith(srcPrefix) && !target.startsWith(distPrefix)) continue;

		const basePrefix = target.startsWith(srcPrefix) ? srcPrefix : distPrefix;
		const dir = target.slice(basePrefix.length, -indexSuffix.length);
		if (dir.includes('/')) continue;
		names.set(pascalFromDir(dir), dir);
	}

	return names;
}

async function buildPackageSurface(
	pkg: PackageKind,
	sourceRoot: string,
	packagePath: string,
	spec: RuntimeSpec
): Promise<PackageSurfaceMap> {
	const rootBarrelNames = await parseRootBarrelNames(join(sourceRoot, 'index.ts'));
	const subpathNames = await parseSubpathExports(packagePath);
	const names = new Set<string>([...rootBarrelNames, ...subpathNames.keys()]);
	const surface = new Map<string, PackageSurfaceEntry>();

	for (const name of sortNames(names)) {
		const dir = subpathNames.get(name) ?? componentDir(name);
		const indexPath = join(sourceRoot, dir, 'index.ts');

		try {
			await readFile(indexPath);
		} catch {
			continue;
		}

		const exactSpec = spec.components[name];
		const fallbackSpec =
			Object.entries(spec.components).find(
				([componentName, component]) =>
					component.import === (pkg === 'ui' ? '@dryui/ui' : '@dryui/primitives') &&
					componentDir(componentName) === dir
			)?.[1] ?? null;

		surface.set(name, {
			name,
			dir,
			indexPath,
			rootBarrel: rootBarrelNames.has(name),
			subpathExport: subpathNames.has(name),
			specMeta: exactSpec ?? fallbackSpec
		});
	}

	return surface;
}

function readSpec(): RuntimeSpec {
	return JSON.parse(readFileSync(specPath, 'utf8')) as RuntimeSpec;
}

function readDocsNavNames(source: string): string[] {
	const names = new Set<string>();

	for (const match of source.matchAll(/ui\('([A-Za-z0-9_]+)'\)/g)) {
		const name = match[1];
		if (!name) continue;
		names.add(name);
	}

	return sortNames(names);
}

function sanitizeDescription(value: string | null | undefined, name: string): string {
	return value?.trim() || `${name} is exported publicly but is missing generated spec metadata.`;
}

function addEdge(
	edges: Map<string, DolphinEdge>,
	type: DolphinEdgeType,
	from: string,
	to: string,
	label?: string
): void {
	const id = [type, from, to, label ?? ''].join(':');
	if (edges.has(id)) return;
	edges.set(id, { id, type, from, to, ...(label ? { label } : {}) });
}

function buildPackageOverviewMermaid(summary: DolphinSummary): string {
	return [
		'flowchart LR',
		`  p_root["Primitives root: ${summary.primitiveComponents}"]`,
		`  u_wrap["UI wrappers: ${summary.uiWrappers}"]`,
		`  u_comp["UI composites: ${summary.uiComposites}"]`,
		`  audit["Audit clusters: ${summary.clusterNodes}"]`,
		'  p_root -->|wraps| u_wrap',
		'  u_wrap -->|feeds| u_comp',
		'  audit -->|highlights duplication in| u_comp',
		'  audit -->|highlights duplication in| u_wrap'
	].join('\n');
}

function mermaidId(value: string): string {
	return value.replace(/[^A-Za-z0-9_]/g, '_');
}

function buildClusterMermaid(clusters: DolphinCluster[]): string {
	const lines = ['flowchart TB'];

	for (const cluster of clusters) {
		const clusterId = mermaidId(`cluster_${cluster.id}`);
		lines.push(`  ${clusterId}["${cluster.title}"]`);
		for (const component of cluster.components) {
			const componentId = mermaidId(component);
			lines.push(`  ${componentId}["${component}"]`);
			lines.push(`  ${clusterId} --> ${componentId}`);
		}
	}

	return lines.join('\n');
}

function buildClusters(availableNames: Set<string>): DolphinCluster[] {
	return CLUSTER_DEFINITIONS.map((cluster) => ({
		...cluster,
		components: cluster.components.filter((name) => availableNames.has(name))
	})).filter((cluster) => cluster.components.length > 1);
}

function countEdges(edges: DolphinEdge[], type: DolphinEdgeType): number {
	return edges.filter((edge) => edge.type === type).length;
}

function listByPriority(clusters: DolphinCluster[], priority: ClusterPriority): DolphinCluster[] {
	return clusters.filter((cluster) => cluster.priority === priority);
}

function formatClusterSection(title: string, clusters: DolphinCluster[]): string {
	const lines = [`## ${title}`, ''];

	if (clusters.length === 0) {
		lines.push('No findings in this bucket.', '');
		return lines.join('\n');
	}

	for (const cluster of clusters) {
		lines.push(`### ${cluster.title}`);
		lines.push('');
		lines.push(`Components: ${cluster.components.map((name) => `\`${name}\``).join(', ')}`);
		lines.push('');
		lines.push(cluster.summary);
		lines.push('');
		for (const recommendation of cluster.recommendations) {
			lines.push(`- ${recommendation}`);
		}
		lines.push('');
	}

	return lines.join('\n');
}

function formatMismatchSummary(mismatches: DolphinMismatch[]): string {
	if (mismatches.length === 0) return '- No mismatches detected.';

	const counts = new Map<string, number>();
	for (const mismatch of mismatches) {
		const key = `${mismatch.package}:${mismatch.kind}`;
		counts.set(key, (counts.get(key) ?? 0) + 1);
	}

	return ensureArray(counts.entries())
		.sort(([left], [right]) => left.localeCompare(right))
		.map(([key, count]) => {
			const [pkg, kind] = key.split(':');
			return `- \`${kind}\` in \`${pkg}\`: ${count}`;
		})
		.join('\n');
}

function formatPriorityMismatchList(mismatches: DolphinMismatch[]): string {
	const priorityKinds = new Set<DolphinMismatchKind>(['spec-missing', 'docs-nav-missing']);
	const prioritized = mismatches.filter((mismatch) => priorityKinds.has(mismatch.kind));

	if (prioritized.length === 0) return 'No priority mismatches detected.\n';

	return prioritized
		.map((mismatch) => {
			const location = mismatch.sourcePath ? ` (${mismatch.sourcePath})` : '';
			return `- \`${mismatch.kind}\` on \`${mismatch.component}\` in \`${mismatch.package}\`${location}: ${mismatch.detail}`;
		})
		.join('\n');
}

export function buildArchitectureReport(graph: DolphinGraph): string {
	const metrics = [
		['Primitive component nodes', String(graph.summary.primitiveComponents)],
		['UI component nodes', String(graph.summary.uiComponents)],
		['UI wrappers', String(graph.summary.uiWrappers)],
		['UI composites', String(graph.summary.uiComposites)],
		['Compound parts', String(graph.summary.partNodes)],
		['Mismatch count', String(graph.summary.mismatches)],
		['PrimitivePart components', String(graph.summary.primitivePartComponents)],
		['Thin wrapper count', String(graph.summary.thinWrappers)]
	];

	return [
		'# DryUI Architecture Audit',
		'',
		'## Metrics',
		'',
		'| Metric | Count |',
		'| --- | ---: |',
		...metrics.map(([label, value]) => `| ${label} | ${value} |`),
		'',
		'## Package Overview',
		'',
		'```mermaid',
		graph.mermaid.packageOverview,
		'```',
		'',
		'## Duplication Clusters',
		'',
		'```mermaid',
		graph.mermaid.clusterOverview,
		'```',
		'',
		formatClusterSection('Canonicalize Now', listByPriority(graph.clusters, 'canonicalize-now')),
		formatClusterSection(
			'Document Decision Tree',
			listByPriority(graph.clusters, 'document-decision-tree')
		),
		formatClusterSection('Watch', listByPriority(graph.clusters, 'watch')),
		'## Structural Signals',
		'',
		`- \`PrimitivePart\` appears in ${graph.summary.primitivePartComponents} UI components: ${graph.signals.primitivePartComponents.map((name) => `\`${name}\``).join(', ') || 'none'}.`,
		`- Thin wrapper candidates: ${graph.signals.thinWrapperComponents.map((name) => `\`${name}\``).join(', ') || 'none'}.`,
		`- UI subpath-only exports: ${graph.signals.subpathOnlyUi.map((name) => `\`${name}\``).join(', ') || 'none'}.`,
		`- Primitive subpath-only exports: ${graph.signals.subpathOnlyPrimitives.map((name) => `\`${name}\``).join(', ') || 'none'}.`,
		`- UI exports missing spec metadata: ${graph.signals.specMissingUi.map((name) => `\`${name}\``).join(', ') || 'none'}.`,
		`- Primitive exports missing spec metadata: ${graph.signals.specMissingPrimitives.map((name) => `\`${name}\``).join(', ') || 'none'}.`,
		`- Docs nav missing components: ${graph.signals.docsNavMissing.map((name) => `\`${name}\``).join(', ') || 'none'}.`,
		`- Docs nav orphan entries: ${graph.signals.docsNavOrphan.map((name) => `\`${name}\``).join(', ') || 'none'}.`,
		'',
		'## Mismatch Summary',
		'',
		formatMismatchSummary(graph.mismatches),
		'',
		'## Priority Mismatches',
		'',
		formatPriorityMismatchList(graph.mismatches),
		''
	].join('\n');
}

export async function writeArchitectureArtifacts(graph: DolphinGraph): Promise<void> {
	await writeFile(architectureJsonPath, JSON.stringify(graph, null, 2));
	await mkdir(dirname(reportPath), { recursive: true });
	await writeFile(reportPath, buildArchitectureReport(graph));
}

export async function buildDolphinGraph(): Promise<DolphinGraph> {
	const spec = readSpec();
	const docsNavSource = await readText(docsNavPath);
	const docsNavNames = new Set(readDocsNavNames(docsNavSource));
	const primitiveSurface = await buildPackageSurface(
		'primitives',
		primitivesSrc,
		primitivesPackagePath,
		spec
	);
	const uiSurface = await buildPackageSurface('ui', uiSrc, uiPackagePath, spec);
	const componentNames = new Set<string>([
		...primitiveSurface.keys(),
		...uiSurface.keys(),
		...Object.keys(spec.components)
	]);
	const nodes: DolphinNode[] = [];
	const edges = new Map<string, DolphinEdge>();
	const mismatches: DolphinMismatch[] = [];
	const nodeIdsByName = new Map<string, { ui?: string; primitives?: string }>();
	const primitivePartComponents = new Set<string>();
	const thinWrapperComponents = new Set<string>();
	const availableNames = new Set<string>();

	for (const name of sortNames(componentNames)) {
		const primitiveEntry = primitiveSurface.get(name) ?? null;
		const uiEntry = uiSurface.get(name) ?? null;

		if (primitiveEntry) {
			const indexSource = await readText(primitiveEntry.indexPath);
			const parts = parseCompoundParts(indexSource, name) ?? [];
			const sourceFiles = await collectSourceFiles(join(primitivesSrc, primitiveEntry.dir));
			const node: DolphinNode = {
				id: componentNodeId('primitives', name),
				name,
				label: name,
				kind: 'component',
				package: 'primitives',
				layer: 'primitive',
				category: primitiveEntry.specMeta?.category ?? 'uncategorized',
				description: sanitizeDescription(primitiveEntry.specMeta?.description, name),
				visibility: visibility(primitiveEntry.rootBarrel, primitiveEntry.subpathExport),
				sourcePath: relativeRepoPath(primitiveEntry.indexPath),
				publicImport: primitiveEntry.rootBarrel
					? '@dryui/primitives'
					: `@dryui/primitives/${primitiveEntry.dir}`,
				tags: primitiveEntry.specMeta?.tags ?? [],
				compound: parts.length > 0,
				parts,
				sourceFileCount: sourceFiles.length,
				primitivePartUsageCount: 0,
				componentImportCount: 0
			};

			nodes.push(node);
			availableNames.add(name);
			nodeIdsByName.set(name, { ...(nodeIdsByName.get(name) ?? {}), primitives: node.id });

			if (!primitiveEntry.subpathExport) {
				mismatches.push({
					kind: 'missing-subpath-export',
					package: 'primitives',
					component: name,
					detail: 'Root barrel export is missing a matching package subpath export.',
					sourcePath: relativeRepoPath(primitiveEntry.indexPath)
				});
			}

			if (!primitiveEntry.specMeta) {
				mismatches.push({
					kind: 'spec-missing',
					package: 'primitives',
					component: name,
					detail: 'Public export exists without generated spec metadata.',
					sourcePath: relativeRepoPath(primitiveEntry.indexPath)
				});
			}
		}

		if (uiEntry) {
			const indexSource = await readText(uiEntry.indexPath);
			const parts = parseCompoundParts(indexSource, name) ?? [];
			const sourceDir = join(uiSrc, uiEntry.dir);
			const sourceFiles = await collectSourceFiles(sourceDir);
			let primitivePartUsageCount = 0;
			const componentImports = new Set<string>();

			for (const filePath of sourceFiles) {
				const source = await readText(filePath);
				if (source.includes('PrimitivePart')) primitivePartUsageCount += 1;

				for (const importedName of parseRootPackageImports(source, '@dryui/primitives')) {
					if (importedName !== name && primitiveSurface.has(importedName))
						componentImports.add(importedName);
				}

				for (const importedName of parseSubpathImports(source, '@dryui/primitives')) {
					if (importedName !== name && primitiveSurface.has(importedName))
						componentImports.add(importedName);
				}

				for (const importedName of parseRelativeImports(filePath, uiSrc, source)) {
					if (importedName !== name && uiSurface.has(importedName))
						componentImports.add(importedName);
				}
			}

			const hasPrimitivePeer = primitiveSurface.has(name);
			const node: DolphinNode = {
				id: componentNodeId('ui', name),
				name,
				label: name,
				kind: 'component',
				package: 'ui',
				layer: hasPrimitivePeer ? 'ui-wrapper' : 'ui-composite',
				category:
					uiEntry.specMeta?.category ?? primitiveEntry?.specMeta?.category ?? 'uncategorized',
				description: sanitizeDescription(
					uiEntry.specMeta?.description ?? primitiveEntry?.specMeta?.description,
					name
				),
				visibility: visibility(uiEntry.rootBarrel, uiEntry.subpathExport),
				sourcePath: relativeRepoPath(uiEntry.indexPath),
				publicImport: uiEntry.rootBarrel ? '@dryui/ui' : `@dryui/ui/${uiEntry.dir}`,
				tags: uiEntry.specMeta?.tags ?? primitiveEntry?.specMeta?.tags ?? [],
				compound: parts.length > 0,
				parts,
				sourceFileCount: sourceFiles.length,
				primitivePartUsageCount,
				componentImportCount: componentImports.size
			};

			nodes.push(node);
			availableNames.add(name);
			nodeIdsByName.set(name, { ...(nodeIdsByName.get(name) ?? {}), ui: node.id });

			if (primitivePartUsageCount > 0) {
				primitivePartComponents.add(name);
			}

			if (hasPrimitivePeer && componentImports.size === 0 && sourceFiles.length <= 3) {
				thinWrapperComponents.add(name);
			}

			if (!uiEntry.subpathExport) {
				mismatches.push({
					kind: 'missing-subpath-export',
					package: 'ui',
					component: name,
					detail: 'Root barrel export is missing a matching package subpath export.',
					sourcePath: relativeRepoPath(uiEntry.indexPath)
				});
			}

			if (!uiEntry.specMeta) {
				mismatches.push({
					kind: 'spec-missing',
					package: 'ui',
					component: name,
					detail: 'Public export exists without generated spec metadata.',
					sourcePath: relativeRepoPath(uiEntry.indexPath)
				});
			}
		}
	}

	for (const [name, entry] of primitiveSurface) {
		if (!entry.rootBarrel && entry.subpathExport) {
			mismatches.push({
				kind: 'subpath-only-export',
				package: 'primitives',
				component: name,
				detail: 'Package subpath export is public but missing from the root barrel.',
				sourcePath: relativeRepoPath(entry.indexPath)
			});
		}
	}

	for (const [name, entry] of uiSurface) {
		if (!entry.rootBarrel && entry.subpathExport) {
			mismatches.push({
				kind: 'subpath-only-export',
				package: 'ui',
				component: name,
				detail: 'Package subpath export is public but missing from the root barrel.',
				sourcePath: relativeRepoPath(entry.indexPath)
			});
		}
	}

	const componentNodes = nodes.filter((node) => node.kind === 'component');
	const componentNodeIds = new Set(componentNodes.map((node) => node.id));

	for (const node of componentNodes) {
		for (const part of node.parts) {
			const id = partNodeId(node.package as PackageKind, node.name, part);
			nodes.push({
				id,
				name: `${node.name}.${part}`,
				label: part,
				kind: 'part',
				package: node.package,
				layer: 'part',
				category: node.category,
				description: `${part} part for ${node.name}.`,
				tags: [],
				compound: false,
				parts: []
			});
			addEdge(edges, 'compound_part', node.id, id, part);
		}
	}

	for (const name of availableNames) {
		const ids = nodeIdsByName.get(name);
		if (ids?.ui && ids.primitives) {
			addEdge(edges, 'wraps', ids.ui, ids.primitives);
		}
	}

	for (const node of componentNodes) {
		if (node.package !== 'ui' && node.package !== 'primitives') continue;

		const surface = node.package === 'ui' ? uiSurface : primitiveSurface;
		const sourceRoot = node.package === 'ui' ? uiSrc : primitivesSrc;
		const entry = surface.get(node.name);
		if (!entry) continue;
		const sourceFiles = await collectSourceFiles(join(sourceRoot, entry.dir));

		for (const filePath of sourceFiles) {
			const source = await readText(filePath);
			const localImports = parseRelativeImports(filePath, sourceRoot, source);
			const subpathImports = parseSubpathImports(
				source,
				node.package === 'ui' ? '@dryui/ui' : '@dryui/primitives'
			);
			const crossPackageImports =
				node.package === 'ui' ? parseSubpathImports(source, '@dryui/primitives') : [];

			for (const importedName of [...localImports, ...subpathImports]) {
				if (importedName === node.name) continue;
				const targetId = componentNodeId(node.package as PackageKind, importedName);
				if (componentNodeIds.has(targetId)) addEdge(edges, 'composes', node.id, targetId);
			}

			for (const importedName of crossPackageImports) {
				if (importedName === node.name) continue;
				const targetId = componentNodeId('primitives', importedName);
				if (componentNodeIds.has(targetId)) addEdge(edges, 'composes', node.id, targetId);
			}
		}
	}

	for (const component of Object.values(spec.composition?.components ?? {})) {
		const sourceName = normalizeComponentToken(component.component);
		if (!sourceName) continue;
		const sourceIds = nodeIdsByName.get(sourceName);
		const sourceId = sourceIds?.ui ?? sourceIds?.primitives;
		if (!sourceId) continue;

		for (const token of component.combinesWith) {
			const targetName = normalizeComponentToken(token);
			if (!targetName || targetName === sourceName) continue;
			const targetIds = nodeIdsByName.get(targetName);
			const targetId = targetIds?.ui ?? targetIds?.primitives;
			if (!targetId) continue;
			addEdge(edges, 'related', sourceId, targetId, 'combines_with');
		}
	}

	const clusters = buildClusters(availableNames);
	for (const cluster of clusters) {
		nodes.push({
			id: clusterNodeId(cluster.id),
			name: cluster.title,
			label: cluster.title,
			kind: 'cluster',
			package: 'audit',
			layer: 'cluster',
			category: cluster.priority,
			description: cluster.summary,
			tags: [],
			compound: false,
			parts: []
		});

		for (const component of cluster.components) {
			const targetId = nodeIdsByName.get(component)?.ui ?? nodeIdsByName.get(component)?.primitives;
			if (!targetId) continue;
			addEdge(edges, 'duplication_cluster', clusterNodeId(cluster.id), targetId);
		}
	}

	const uiRootNames = sortNames(
		[...uiSurface.values()].filter((entry) => entry.rootBarrel).map((entry) => entry.name)
	);
	for (const name of uiRootNames) {
		if (!docsNavNames.has(name)) {
			const entry = uiSurface.get(name);
			mismatches.push({
				kind: 'docs-nav-missing',
				package: 'docs',
				component: name,
				detail: 'Public UI export is missing from the docs component navigation.',
				...(entry ? { sourcePath: relativeRepoPath(entry.indexPath) } : {})
			});
		}
	}

	for (const name of docsNavNames) {
		if (!uiRootNames.includes(name)) {
			mismatches.push({
				kind: 'docs-nav-orphan',
				package: 'docs',
				component: name,
				detail: 'Docs navigation lists a component that is not exported from the UI root barrel.'
			});
		}
	}

	const dedupedMismatches = sortNames(
		new Set(mismatches.map((mismatch) => JSON.stringify(mismatch)))
	).map((value) => JSON.parse(value) as DolphinMismatch);
	const sortedNodes = nodes.sort((left, right) => left.id.localeCompare(right.id));
	const sortedEdges = ensureArray(edges.values()).sort((left, right) =>
		left.id.localeCompare(right.id)
	);
	const summary: DolphinSummary = {
		componentNodes: componentNodes.length,
		partNodes: sortedNodes.filter((node) => node.kind === 'part').length,
		catalogNodes: 0,
		clusterNodes: sortedNodes.filter((node) => node.kind === 'cluster').length,
		primitiveComponents: componentNodes.filter((node) => node.package === 'primitives').length,
		uiComponents: componentNodes.filter((node) => node.package === 'ui').length,
		uiWrappers: componentNodes.filter((node) => node.layer === 'ui-wrapper').length,
		uiComposites: componentNodes.filter((node) => node.layer === 'ui-composite').length,
		rootBarrelComponents: componentNodes.filter(
			(node) => node.visibility === 'root' || node.visibility === 'root+subpath'
		).length,
		subpathOnlyComponents: componentNodes.filter((node) => node.visibility === 'subpath-only')
			.length,
		compoundComponents: componentNodes.filter((node) => node.compound).length,
		wrapEdges: countEdges(sortedEdges, 'wraps'),
		composeEdges: countEdges(sortedEdges, 'composes'),
		docsEdges: countEdges(sortedEdges, 'docs'),
		relatedEdges: countEdges(sortedEdges, 'related'),
		mismatches: dedupedMismatches.length,
		primitivePartComponents: primitivePartComponents.size,
		thinWrappers: thinWrapperComponents.size
	};

	return {
		schema: 'DolphinGraph',
		packageVersion: spec.version,
		summary,
		nodes: sortedNodes,
		edges: sortedEdges,
		clusters,
		mismatches: dedupedMismatches,
		signals: {
			primitivePartComponents: sortNames(primitivePartComponents),
			thinWrapperComponents: sortNames(thinWrapperComponents),
			subpathOnlyUi: sortNames(
				[...uiSurface.values()]
					.filter((entry) => !entry.rootBarrel && entry.subpathExport)
					.map((entry) => entry.name)
			),
			subpathOnlyPrimitives: sortNames(
				[...primitiveSurface.values()]
					.filter((entry) => !entry.rootBarrel && entry.subpathExport)
					.map((entry) => entry.name)
			),
			specMissingUi: sortNames(
				[...uiSurface.values()].filter((entry) => !entry.specMeta).map((entry) => entry.name)
			),
			specMissingPrimitives: sortNames(
				[...primitiveSurface.values()].filter((entry) => !entry.specMeta).map((entry) => entry.name)
			),
			docsNavMissing: sortNames(uiRootNames.filter((name) => !docsNavNames.has(name))),
			docsNavOrphan: sortNames([...docsNavNames].filter((name) => !uiRootNames.includes(name)))
		},
		mermaid: {
			packageOverview: buildPackageOverviewMermaid(summary),
			clusterOverview: buildClusterMermaid(clusters)
		}
	};
}

export function loadArchitectureGraph(): DolphinGraph {
	return JSON.parse(readArchitectureJson()) as DolphinGraph;
}
