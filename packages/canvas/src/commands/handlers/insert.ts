import { insertNodeAt, type ApplyResult, type CommandTarget } from './utils.js';
import type { InsertNodeCommand, RemoveNodeCommand } from '../types.js';

export function applyInsertNode(
	target: CommandTarget,
	command: InsertNodeCommand
): ApplyResult<RemoveNodeCommand> {
	const inserted = insertNodeAt(target.document, command.parentId, command.index, command.node);

	return {
		inverse: {
			type: 'remove-node',
			nodeId: inserted.id
		},
		label: `Insert ${inserted.label ?? inserted.component}`
	};
}
