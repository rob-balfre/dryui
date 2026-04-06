import { findNodeLocation } from '../../ast/query.js';
import { insertNodeAt, removeNodeAt, type ApplyResult, type CommandTarget } from './utils.js';
import type { MoveNodeCommand } from '../types.js';

export function applyMoveNode(
	target: CommandTarget,
	command: MoveNodeCommand
): ApplyResult<MoveNodeCommand> {
	const location = findNodeLocation(target.document.root, command.nodeId);

	if (!location?.parent) {
		throw new Error(`Cannot move missing or root node "${command.nodeId}".`);
	}

	const originalParentId = location.parent.id;
	const originalIndex = location.index;
	const { node } = removeNodeAt(target.document, command.nodeId);

	let nextIndex = command.newIndex;
	if (command.newParentId === originalParentId && command.newIndex > originalIndex) {
		nextIndex -= 1;
	}

	insertNodeAt(target.document, command.newParentId, nextIndex, node);

	return {
		inverse: {
			type: 'move-node',
			nodeId: node.id,
			newParentId: originalParentId,
			newIndex: originalIndex
		},
		label: `Move ${node.label ?? node.component}`
	};
}
