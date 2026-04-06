import type { LayoutNode, TreeLocation } from './types.js';

export function walkTree(
	node: LayoutNode,
	visit: (location: TreeLocation) => void,
	parent: LayoutNode | null = null,
	depth = 0
): void {
	const index = parent ? parent.children.findIndex((child) => child.id === node.id) : 0;
	visit({
		node,
		parent,
		index,
		depth
	});

	for (const child of node.children) {
		walkTree(child, visit, node, depth + 1);
	}
}

export function flattenTree(root: LayoutNode): TreeLocation[] {
	const locations: TreeLocation[] = [];
	walkTree(root, (location) => {
		locations.push(location);
	});
	return locations;
}

export function findNode(root: LayoutNode, nodeId: string): LayoutNode | null {
	if (root.id === nodeId) {
		return root;
	}

	for (const child of root.children) {
		const found = findNode(child, nodeId);
		if (found) {
			return found;
		}
	}

	return null;
}

export function findNodeLocation(root: LayoutNode, nodeId: string): TreeLocation | null {
	let match: TreeLocation | null = null;

	walkTree(root, (location) => {
		if (location.node.id === nodeId) {
			match = location;
		}
	});

	return match;
}

export function findParent(root: LayoutNode, nodeId: string): LayoutNode | null {
	return findNodeLocation(root, nodeId)?.parent ?? null;
}
