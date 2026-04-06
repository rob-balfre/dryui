import { findNode } from '../../ast/query.js';
import { touchDocument, type ApplyResult, type CommandTarget } from './utils.js';
import type {
	SetCssVarCommand,
	SetPropCommand,
	SetStyleCommand,
	SetTextCommand
} from '../types.js';
import type { CanvasStyle, PropValue } from '../../ast/types.js';

function requireNode(target: CommandTarget, nodeId: string) {
	const node = findNode(target.document.root, nodeId);

	if (!node) {
		throw new Error(`Missing node "${nodeId}".`);
	}

	return node;
}

export function applySetProp(
	target: CommandTarget,
	command: SetPropCommand
): ApplyResult<SetPropCommand> {
	const node = requireNode(target, command.nodeId);
	const previousValue = (node.props[command.propName] ?? null) as PropValue;
	node.props[command.propName] = command.value;
	touchDocument(target.document);

	return {
		inverse: {
			...command,
			value: previousValue
		},
		label: `Set ${command.propName}`
	};
}

export function applySetCssVar(
	target: CommandTarget,
	command: SetCssVarCommand
): ApplyResult<SetCssVarCommand> {
	const node = requireNode(target, command.nodeId);
	const previousValue = node.cssVarOverrides[command.varName] ?? '';

	if (command.value) {
		node.cssVarOverrides[command.varName] = command.value;
	} else {
		delete node.cssVarOverrides[command.varName];
	}

	touchDocument(target.document);

	return {
		inverse: {
			...command,
			value: previousValue
		},
		label: `Set ${command.varName}`
	};
}

export function applySetStyle(
	target: CommandTarget,
	command: SetStyleCommand
): ApplyResult<SetStyleCommand> {
	const node = requireNode(target, command.nodeId);
	const previousValue = node.style[command.property] as CanvasStyle[keyof CanvasStyle];

	if (command.value === undefined) {
		delete node.style[command.property];
	} else {
		(node.style as Record<keyof CanvasStyle, CanvasStyle[keyof CanvasStyle] | undefined>)[
			command.property
		] = command.value;
	}

	touchDocument(target.document);

	return {
		inverse: {
			...command,
			value: previousValue
		},
		label: `Set ${command.property}`
	};
}

export function applySetText(
	target: CommandTarget,
	command: SetTextCommand
): ApplyResult<SetTextCommand> {
	const node = requireNode(target, command.nodeId);
	const previousValue = node.text ?? '';
	node.text = command.text;
	touchDocument(target.document);

	return {
		inverse: {
			...command,
			text: previousValue
		},
		label: 'Set text'
	};
}
