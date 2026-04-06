import {
	CommandBus,
	createTemplateForComponent,
	findNode,
	getComponentSpec,
	listComponentNames,
	semanticThemeTokens,
	type CanvasCommand,
	type LayoutDocument,
	type LayoutNode
} from '../../../../../packages/canvas/src/index';
import type { StudioCommandPreview } from './chat-store.svelte';

export interface CommandBridgeContext {
	document: LayoutDocument;
	selectedNodeId: string | null;
}

export interface CommandApplyResult {
	applied: boolean;
	message: string;
}

function matchComponent(prompt: string): string | null {
	const normalized = prompt.toLowerCase();
	return (
		listComponentNames()
			.slice()
			.sort((left, right) => right.length - left.length)
			.find((name) => normalized.includes(name.toLowerCase())) ?? null
	);
}

function readSelectedNode(
	document: LayoutDocument,
	selectedNodeId: string | null
): LayoutNode | null {
	return selectedNodeId ? findNode(document.root, selectedNodeId) : null;
}

function nextDimension(current: string | undefined): string {
	if (!current) {
		return '40rem';
	}

	const match = current.trim().match(/^(\d+(?:\.\d+)?)(px|rem|em|%)$/);
	if (!match) {
		return current;
	}

	const [, amount, unit] = match;
	const value = Number(amount);
	const next =
		unit === '%'
			? Math.min(value + 10, 100)
			: Number((value + Math.max(value * 0.2, 4)).toFixed(2));
	return `${next}${unit}`;
}

function describeCommand(command: CanvasCommand): string {
	switch (command.type) {
		case 'insert-node':
			return `Insert ${command.node.component} into the root canvas`;
		case 'select-node':
			return 'Focus the new selection';
		case 'set-style':
			return `Set ${command.property} to ${String(command.value)}`;
		case 'set-theme-var':
			return `Update ${command.varName}`;
		default:
			return command.type;
	}
}

function summarizeCommands(commands: CanvasCommand[]): string {
	if (commands.length === 0) {
		return 'Apply a studio command preview';
	}

	if (commands.length === 1) {
		return describeCommand(commands[0]!);
	}

	return `Apply ${commands.length} studio commands`;
}

function validateTemplateNode(node: LayoutNode): string[] {
	if (node.component === '__text__') {
		return [];
	}

	const component = getComponentSpec(node.component);
	if (!component) {
		return [`Unknown DryUI component "${node.component}".`];
	}

	return node.children.flatMap((child) => validateTemplateNode(child));
}

function validateCommands(document: LayoutDocument, commands: CanvasCommand[]): string[] {
	const errors: string[] = [];
	const previewBus = new CommandBus(structuredClone(document));

	for (const command of commands) {
		switch (command.type) {
			case 'insert-node':
				errors.push(...validateTemplateNode(command.node));
				if (!findNode(previewBus.document.root, command.parentId)) {
					errors.push(`Cannot insert into missing parent "${command.parentId}".`);
				}
				break;
			case 'set-style':
			case 'set-prop':
			case 'set-css-var':
			case 'set-text':
			case 'remove-node':
			case 'move-node':
			case 'duplicate-node':
				if (!findNode(previewBus.document.root, command.nodeId)) {
					errors.push(`Cannot target missing node "${command.nodeId}".`);
				}
				break;
			case 'set-theme-var':
				if (
					!semanticThemeTokens.includes(command.varName as (typeof semanticThemeTokens)[number])
				) {
					errors.push(`Unknown theme token "${command.varName}".`);
				}
				break;
			case 'batch':
				errors.push(...validateCommands(document, command.commands));
				break;
			default:
				break;
		}

		if (errors.length > 0) {
			continue;
		}

		const applied = previewBus.execute(structuredClone(command), 'ai');
		if (!applied) {
			errors.push(`The preview cannot apply "${command.type}" in its current sequence.`);
		}
	}

	return errors;
}

export class CommandBridge {
	constructor(private readonly bus: CommandBus) {}

	buildPreviewFromCommands(
		prompt: string,
		commands: CanvasCommand[],
		assistantMessage = 'Prepared a preview from the studio server response.',
		summary?: string
	): StudioCommandPreview | null {
		const errors = validateCommands(this.bus.document, commands);
		if (errors.length > 0) {
			return null;
		}

		return {
			id: crypto.randomUUID(),
			prompt,
			summary: summary ?? summarizeCommands(commands),
			assistantMessage,
			lines: commands.map((command) => describeCommand(command)),
			commands,
			mode: 'commands'
		};
	}

	buildPreview(prompt: string, context: CommandBridgeContext): StudioCommandPreview | null {
		const normalized = prompt.trim().toLowerCase();
		if (!normalized) {
			return null;
		}

		if (/\bundo\b/.test(normalized) && this.bus.canUndo) {
			return {
				id: crypto.randomUUID(),
				prompt,
				summary: 'Undo the last canvas change',
				assistantMessage: 'Prepared an undo preview for the most recent canvas mutation.',
				lines: ['Undo the most recent command in the command bus'],
				commands: [],
				mode: 'undo'
			};
		}

		if (/\bredo\b/.test(normalized) && this.bus.canRedo) {
			return {
				id: crypto.randomUUID(),
				prompt,
				summary: 'Redo the previously reverted canvas change',
				assistantMessage: 'Prepared a redo preview for the previously reverted canvas mutation.',
				lines: ['Redo the next command in the command bus history'],
				commands: [],
				mode: 'redo'
			};
		}

		const component = matchComponent(prompt);
		if (component) {
			const template = createTemplateForComponent(component);
			const commands: CanvasCommand[] = [
				{
					type: 'insert-node',
					parentId: context.document.root.id,
					index: context.document.root.children.length,
					node: template
				},
				{
					type: 'select-node',
					nodeId: template.id
				}
			];

			return this.buildPreviewFromCommands(
				prompt,
				commands,
				`Prepared a preview that inserts ${component} and focuses it for editing.`,
				`Insert ${component} into the live canvas`
			);
		}

		const selectedNode = readSelectedNode(context.document, context.selectedNodeId);
		if (selectedNode && /\b(bigger|larger|wider)\b/.test(normalized)) {
			const width = nextDimension(selectedNode.style.width);
			const commands: CanvasCommand[] = [
				{
					type: 'set-style',
					nodeId: selectedNode.id,
					property: 'width',
					value: width
				}
			];

			return this.buildPreviewFromCommands(
				prompt,
				commands,
				`Prepared a preview that widens ${selectedNode.label ?? selectedNode.component}.`,
				`Increase ${selectedNode.label ?? selectedNode.component} width`
			);
		}

		return null;
	}

	applyPreview(preview: StudioCommandPreview): CommandApplyResult {
		if (preview.mode === 'undo') {
			return this.bus.undo()
				? { applied: true, message: 'Undid the last canvas mutation.' }
				: { applied: false, message: 'Nothing is available to undo.' };
		}

		if (preview.mode === 'redo') {
			return this.bus.redo()
				? { applied: true, message: 'Re-applied the previously reverted canvas mutation.' }
				: { applied: false, message: 'Nothing is available to redo.' };
		}

		const errors = validateCommands(this.bus.document, preview.commands);
		if (errors.length > 0) {
			return {
				applied: false,
				message: errors.join(' ')
			};
		}

		for (const command of preview.commands) {
			const applied = this.bus.execute(command, 'ai');
			if (!applied) {
				return {
					applied: false,
					message: `The command bus rejected "${command.type}" while applying the preview.`
				};
			}
		}

		return {
			applied: true,
			message: `Applied preview: ${preview.summary}.`
		};
	}
}

export function createCommandBridge(bus: CommandBus): CommandBridge {
	return new CommandBridge(bus);
}
