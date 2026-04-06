import { removeNodeAt, type ApplyResult, type CommandTarget } from './utils.js';
import type { InsertNodeCommand, RemoveNodeCommand } from '../types.js';

export function applyRemoveNode(
	target: CommandTarget,
	command: RemoveNodeCommand
): ApplyResult<InsertNodeCommand> {
	const removed = removeNodeAt(target.document, command.nodeId);
	target.selection.remove(command.nodeId);

	return {
		inverse: {
			type: 'insert-node',
			parentId: removed.parentId,
			index: removed.index,
			node: removed.node
		},
		label: `Remove ${removed.node.label ?? removed.node.component}`
	};
}
