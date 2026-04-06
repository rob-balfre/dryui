export type DolphinPackage = 'primitives' | 'ui' | 'docs' | 'audit';
export type DolphinNodeKind = 'component' | 'part' | 'catalog' | 'cluster';
export type DolphinLayer =
	| 'primitive'
	| 'ui-wrapper'
	| 'ui-composite'
	| 'part'
	| 'catalog'
	| 'cluster';
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
	package: DolphinPackage;
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
	priority: 'canonicalize-now' | 'document-decision-tree' | 'watch';
	summary: string;
	components: string[];
	recommendations: string[];
}
export interface DolphinMismatch {
	kind: DolphinMismatchKind;
	package: DolphinPackage;
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
	generatedAt: string;
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
export type SystemMapGraph = DolphinGraph;
export type SystemMapNode = DolphinNode;
export type SystemMapNodeKind = DolphinNodeKind;
export type SystemMapLayer = DolphinLayer;
export type SystemMapVisibility = DolphinVisibility;
export type SystemMapEdge = DolphinEdge;
export type SystemMapEdgeKind = DolphinEdgeType;
