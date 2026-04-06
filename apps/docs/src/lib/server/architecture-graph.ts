import type { DolphinEdge, DolphinGraph, DolphinNode } from '@dryui/mcp/architecture';
import architectureGraph from '../../../../../packages/mcp/src/architecture.json';
import type {
	ArchitectureFocusData,
	ArchitectureFocusGroup,
	ArchitectureFocusItem,
	ArchitectureGraphData
} from '../architecture';
import { getComponentItem, toSlug } from '../nav';

let graphPromise: Promise<ArchitectureGraphData> | null = null;

function hrefFor(name: string): string | undefined {
	const item = getComponentItem(name);
	return item ? `/components/${toSlug(item.name)}` : undefined;
}

function findComponentNode(graph: DolphinGraph, component: string): DolphinNode | null {
	return (
		graph.nodes.find(
			(node) => node.kind === 'component' && node.package === 'ui' && node.name === component
		) ??
		graph.nodes.find(
			(node) =>
				node.kind === 'component' && node.package === 'primitives' && node.name === component
		) ??
		graph.nodes.find((node) => node.name === component) ??
		null
	);
}

function dedupeItems(items: ArchitectureFocusItem[]): ArchitectureFocusItem[] {
	const seen = new Set<string>();
	const unique: ArchitectureFocusItem[] = [];

	for (const item of items) {
		if (seen.has(item.id)) continue;
		seen.add(item.id);
		unique.push(item);
	}

	return unique.sort((left, right) => left.label.localeCompare(right.label));
}

function buildFocusGroup(
	id: string,
	title: string,
	description: string,
	items: ArchitectureFocusItem[]
): ArchitectureFocusGroup | null {
	const uniqueItems = dedupeItems(items);
	if (uniqueItems.length === 0) return null;

	return {
		id,
		title,
		description,
		items: uniqueItems
	};
}

function toFocusItems(
	edges: DolphinEdge[],
	nodeById: Map<string, DolphinNode>,
	currentNodeId: string,
	mode: 'target' | 'other'
): ArchitectureFocusItem[] {
	return edges.flatMap((edge) => {
		const targetId =
			mode === 'target' ? edge.to : edge.from === currentNodeId ? edge.to : edge.from;
		const target = nodeById.get(targetId);

		if (!target) return [];

		const item: ArchitectureFocusItem = {
			id: target.id,
			label: target.label,
			kind: edge.type,
			description: target.description
		};

		if (target.kind === 'component') {
			const href = hrefFor(target.name);
			if (href) item.href = href;
		}

		return [item];
	});
}

function degreeForNode(graph: DolphinGraph, nodeId: string): number {
	return graph.edges.reduce((count, edge) => {
		if (edge.from === nodeId || edge.to === nodeId) return count + 1;
		return count;
	}, 0);
}

export async function loadArchitectureGraph(): Promise<ArchitectureGraphData> {
	graphPromise ??= Promise.resolve(architectureGraph as ArchitectureGraphData);
	return graphPromise;
}

export function getArchitectureFocus(
	graph: ArchitectureGraphData,
	component: string
): ArchitectureFocusData | null {
	const node = findComponentNode(graph, component);
	if (!node) return null;

	const nodeById = new Map<string, DolphinNode>(
		graph.nodes.map((entry) => [entry.id, entry] as const)
	);
	const outgoing = graph.edges.filter((edge) => edge.from === node.id);
	const incoming = graph.edges.filter((edge) => edge.to === node.id);

	const parts = buildFocusGroup(
		'inside',
		'Inside this surface',
		'Compound parts exposed beneath the focused surface.',
		toFocusItems(
			outgoing.filter((edge) => edge.type === 'compound_part'),
			nodeById,
			node.id,
			'target'
		)
	);

	const buildsWith = buildFocusGroup(
		'builds-with',
		'Builds with',
		'Direct wrapper and composition relationships emitted by the architecture artifact.',
		toFocusItems(
			outgoing.filter((edge) => edge.type === 'wraps' || edge.type === 'composes'),
			nodeById,
			node.id,
			'target'
		)
	);

	const related = buildFocusGroup(
		'related',
		'Related choices',
		'Composition guidance that points to adjacent or alternative public surfaces.',
		toFocusItems(
			[...outgoing, ...incoming].filter((edge) => edge.type === 'related'),
			nodeById,
			node.id,
			'other'
		)
	);

	const watchlists = buildFocusGroup(
		'watchlists',
		'Audit watchlists',
		'Clusters that include this surface because the audit flagged overlap or a weak decision boundary.',
		toFocusItems(
			[...outgoing, ...incoming].filter((edge) => edge.type === 'duplication_cluster'),
			nodeById,
			node.id,
			'other'
		)
	);

	const usedBy = buildFocusGroup(
		'used-by',
		'Referenced by',
		'Other surfaces that point back to this component in the current map.',
		toFocusItems(
			incoming.filter((edge) => edge.type !== 'related' && edge.type !== 'duplication_cluster'),
			nodeById,
			node.id,
			'target'
		)
	);

	const groups = [parts, buildsWith, related, watchlists, usedBy].filter(
		(group): group is ArchitectureFocusGroup => Boolean(group)
	);

	if (groups.length === 0) return null;

	const summaries = groups.map((group) => `${group.items.length} ${group.title.toLowerCase()}`);

	return {
		component,
		summary: `This view shows ${summaries.join(', ')} around ${component}.`,
		groups
	};
}

export function getArchitectureFocusPanels(
	graph: ArchitectureGraphData,
	limit = 8
): ArchitectureFocusData[] {
	return graph.nodes
		.filter((node) => node.kind === 'component' && node.package === 'ui')
		.sort((left, right) => {
			const degreeDelta = degreeForNode(graph, right.id) - degreeForNode(graph, left.id);
			return degreeDelta !== 0 ? degreeDelta : left.label.localeCompare(right.label);
		})
		.slice(0, limit)
		.flatMap((node) => {
			const focus = getArchitectureFocus(graph, node.name);
			return focus ? [focus] : [];
		});
}
