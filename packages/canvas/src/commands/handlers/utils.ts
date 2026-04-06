import { cloneNode } from '../../ast/factory.js';
import { findNodeLocation } from '../../ast/query.js';
import type { LayoutDocument, LayoutNode } from '../../ast/types.js';
import type { SelectionState } from '../../selection/state.svelte.js';

export interface CommandTarget {
	document: LayoutDocument;
	selection: SelectionState;
}

export interface ApplyResult<TCommand> {
	inverse: TCommand;
	label: string;
}

export function touchDocument(document: LayoutDocument): void {
	document.updatedAt = new Date().toISOString();
}

export function insertNodeAt(
	document: LayoutDocument,
	parentId: string,
	index: number,
	node: LayoutNode
): LayoutNode {
	const location = findNodeLocation(document.root, parentId);

	if (!location) {
		throw new Error(`Cannot insert into missing parent "${parentId}".`);
	}

	const parent = location.node;
	const nextNode = cloneNode(node);
	const safeIndex = Math.max(0, Math.min(index, parent.children.length));
	parent.children.splice(safeIndex, 0, nextNode);
	touchDocument(document);
	return nextNode;
}

export function removeNodeAt(
	document: LayoutDocument,
	nodeId: string
): {
	node: LayoutNode;
	parentId: string;
	index: number;
} {
	const location = findNodeLocation(document.root, nodeId);

	if (!location?.parent) {
		throw new Error(`Cannot remove missing or root node "${nodeId}".`);
	}

	const [removed] = location.parent.children.splice(location.index, 1);

	if (!removed) {
		throw new Error(`Failed to remove node "${nodeId}".`);
	}

	touchDocument(document);
	return {
		node: removed,
		parentId: location.parent.id,
		index: location.index
	};
}
