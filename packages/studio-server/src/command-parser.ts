import type { CanvasCommand } from './types.js';

const JSON_FENCE_RE = /```(?:json|dryui)?\s*([\s\S]*?)```/gi;

export interface ParsedCommandBundle {
	readonly commands: CanvasCommand[];
	readonly rawJson: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isCanvasCommand(value: unknown): value is CanvasCommand {
	if (!isRecord(value) || typeof value.type !== 'string') {
		return false;
	}

	switch (value.type) {
		case 'insert-node':
			return (
				typeof value.parentId === 'string' &&
				typeof value.index === 'number' &&
				isRecord(value.node)
			);
		case 'remove-node':
			return typeof value.nodeId === 'string';
		case 'move-node':
			return (
				typeof value.nodeId === 'string' &&
				typeof value.newParentId === 'string' &&
				typeof value.newIndex === 'number'
			);
		case 'set-prop':
			return (
				typeof value.nodeId === 'string' && typeof value.propName === 'string' && 'value' in value
			);
		case 'set-css-var':
			return (
				typeof value.nodeId === 'string' &&
				typeof value.varName === 'string' &&
				typeof value.value === 'string'
			);
		case 'set-style':
			return (
				typeof value.nodeId === 'string' && typeof value.property === 'string' && 'value' in value
			);
		case 'set-text':
			return typeof value.nodeId === 'string' && typeof value.text === 'string';
		case 'set-theme-var':
			return typeof value.varName === 'string' && typeof value.value === 'string';
		case 'select-node':
			return typeof value.nodeId === 'string';
		case 'deselect-all':
			return true;
		case 'duplicate-node':
			return typeof value.nodeId === 'string';
		case 'batch':
			return (
				typeof value.label === 'string' &&
				Array.isArray(value.commands) &&
				value.commands.every(isCanvasCommand)
			);
		default:
			return false;
	}
}

function extractCandidateJson(source: string): string | null {
	const trimmed = source.trim();
	if (!trimmed) {
		return null;
	}

	if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
		return trimmed;
	}

	JSON_FENCE_RE.lastIndex = 0;
	const match = JSON_FENCE_RE.exec(source);
	return match ? match[1]!.trim() : null;
}

export function parseCommandOutput(source: string): ParsedCommandBundle {
	const candidate = extractCandidateJson(source);
	if (!candidate) {
		throw new Error('No DryUI command payload found in output.');
	}

	let parsed: unknown;
	try {
		parsed = JSON.parse(candidate);
	} catch (error) {
		throw new Error(`Invalid DryUI command JSON: ${(error as Error).message}`);
	}

	const commands = Array.isArray(parsed)
		? parsed
		: isRecord(parsed) && Array.isArray(parsed.commands)
			? parsed.commands
			: [parsed];

	if (!commands.every(isCanvasCommand)) {
		throw new Error('Parsed output contained an invalid DryUI command.');
	}

	return {
		commands,
		rawJson: candidate
	};
}

export function isDryuiCommand(value: unknown): value is CanvasCommand {
	return isCanvasCommand(value);
}
