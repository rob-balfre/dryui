import { cloneNodeWithFreshIds } from '../ast/factory.js';
import { findNodeLocation } from '../ast/query.js';
import type { LayoutDocument } from '../ast/types.js';
import { SelectionState } from '../selection/state.svelte.js';
import { applyInsertNode } from './handlers/insert.js';
import { applyMoveNode } from './handlers/move.js';
import { applySetCssVar, applySetProp, applySetStyle, applySetText } from './handlers/props.js';
import { applyRemoveNode } from './handlers/remove.js';
import { applySetThemeVar } from './handlers/theme.js';
import type {
	BatchCommand,
	CanvasCommand,
	CommandHistoryEntry,
	CommandLock,
	CommandSource,
	DeselectAllCommand,
	DuplicateNodeCommand,
	SelectNodeCommand
} from './types.js';

interface CommandBusState {
	document: LayoutDocument;
	undoStack: CommandHistoryEntry[];
	redoStack: CommandHistoryEntry[];
	lock: CommandLock | null;
	lastSource: CommandSource | null;
}

type CommandListener = (entry: CommandHistoryEntry, phase: 'execute' | 'undo' | 'redo') => void;

/** Higher number = higher trust = takes priority over lower sources. */
const SOURCE_TRUST: Record<CommandSource, number> = {
	ai: 1,
	gesture: 2,
	mouse: 3,
	keyboard: 4,
	system: 5
};

function cloneDocument(document: LayoutDocument): LayoutDocument {
	return structuredClone(document);
}

function createState(initialDocument: LayoutDocument): CommandBusState {
	return {
		document: cloneDocument(initialDocument),
		undoStack: [],
		redoStack: [],
		lock: null,
		lastSource: null
	};
}

function commandTargetNode(command: CanvasCommand): string | null {
	switch (command.type) {
		case 'insert-node':
			return command.parentId;
		case 'remove-node':
		case 'move-node':
		case 'set-prop':
		case 'set-css-var':
		case 'set-style':
		case 'set-text':
		case 'select-node':
		case 'duplicate-node':
			return command.nodeId;
		case 'batch':
			return command.commands.map((entry) => commandTargetNode(entry)).find(Boolean) ?? null;
		default:
			return null;
	}
}

export class CommandBus {
	#state: CommandBusState;
	#listeners = new Set<CommandListener>();
	readonly selection = new SelectionState();

	constructor(initialDocument: LayoutDocument) {
		this.#state = createState(initialDocument);
	}

	get document(): LayoutDocument {
		return this.#state.document;
	}

	get undoStack(): CommandHistoryEntry[] {
		return this.#state.undoStack;
	}

	get redoStack(): CommandHistoryEntry[] {
		return this.#state.redoStack;
	}

	get lock(): CommandLock | null {
		return this.#state.lock;
	}

	get canUndo(): boolean {
		return this.#state.undoStack.length > 0;
	}

	get canRedo(): boolean {
		return this.#state.redoStack.length > 0;
	}

	replaceDocument(document: LayoutDocument): void {
		this.#state.document = cloneDocument(document);
		this.#state.undoStack = [];
		this.#state.redoStack = [];
		this.selection.deselectAll();
		this.#state.lock = null;
	}

	subscribe(listener: CommandListener): () => void {
		this.#listeners.add(listener);
		return () => {
			this.#listeners.delete(listener);
		};
	}

	acquireLock(nodeId: string, source: CommandSource): boolean {
		const current = this.#state.lock;

		if (!current) {
			this.#state.lock = { nodeId, source };
			return true;
		}

		if (current.nodeId !== nodeId) {
			return false;
		}

		if (SOURCE_TRUST[source] < SOURCE_TRUST[current.source]) {
			return false;
		}

		this.#state.lock = { nodeId, source };
		return true;
	}

	releaseLock(nodeId?: string): void {
		if (!this.#state.lock) {
			return;
		}

		if (!nodeId || this.#state.lock.nodeId === nodeId) {
			this.#state.lock = null;
		}
	}

	execute(command: CanvasCommand, source: CommandSource = 'system'): boolean {
		const targetNodeId = commandTargetNode(command);

		if (targetNodeId && this.#state.lock) {
			const sameNode = this.#state.lock.nodeId === targetNodeId;
			const higherPriority = SOURCE_TRUST[source] >= SOURCE_TRUST[this.#state.lock.source];

			if (!sameNode || !higherPriority) {
				return false;
			}
		}

		const entry = this.#apply(command, source);
		if (!entry) {
			return false;
		}

		this.#state.undoStack = [...this.#state.undoStack, entry];
		this.#state.redoStack = [];
		this.#state.lastSource = source;
		this.#emit(entry, 'execute');
		return true;
	}

	undo(): boolean {
		const entry = this.#state.undoStack.at(-1);
		if (!entry) {
			return false;
		}

		this.#state.undoStack = this.#state.undoStack.slice(0, -1);
		const inverseEntry = this.#apply(entry.inverse, entry.source, entry.command);
		if (!inverseEntry) {
			return false;
		}

		this.#state.redoStack = [...this.#state.redoStack, entry];
		this.#emit(entry, 'undo');
		return true;
	}

	redo(): boolean {
		const entry = this.#state.redoStack.at(-1);
		if (!entry) {
			return false;
		}

		this.#state.redoStack = this.#state.redoStack.slice(0, -1);
		const redoEntry = this.#apply(entry.command, entry.source);
		if (!redoEntry) {
			return false;
		}

		this.#state.undoStack = [...this.#state.undoStack, redoEntry];
		this.#emit(entry, 'redo');
		return true;
	}

	#emit(entry: CommandHistoryEntry, phase: 'execute' | 'undo' | 'redo'): void {
		for (const listener of this.#listeners) {
			listener(entry, phase);
		}
	}

	#apply(
		command: CanvasCommand,
		source: CommandSource,
		replayCommand?: CanvasCommand
	): CommandHistoryEntry | null {
		try {
			switch (command.type) {
				case 'insert-node': {
					const result = applyInsertNode(this, command);
					return this.#toHistory(replayCommand ?? command, result.inverse, result.label, source);
				}
				case 'remove-node': {
					const result = applyRemoveNode(this, command);
					return this.#toHistory(replayCommand ?? command, result.inverse, result.label, source);
				}
				case 'move-node': {
					const result = applyMoveNode(this, command);
					return this.#toHistory(replayCommand ?? command, result.inverse, result.label, source);
				}
				case 'set-prop': {
					const result = applySetProp(this, command);
					return this.#toHistory(replayCommand ?? command, result.inverse, result.label, source);
				}
				case 'set-css-var': {
					const result = applySetCssVar(this, command);
					return this.#toHistory(replayCommand ?? command, result.inverse, result.label, source);
				}
				case 'set-style': {
					const result = applySetStyle(this, command);
					return this.#toHistory(replayCommand ?? command, result.inverse, result.label, source);
				}
				case 'set-text': {
					const result = applySetText(this, command);
					return this.#toHistory(replayCommand ?? command, result.inverse, result.label, source);
				}
				case 'set-theme-var': {
					const result = applySetThemeVar(this, command);
					return this.#toHistory(replayCommand ?? command, result.inverse, result.label, source);
				}
				case 'select-node':
					return this.#applySelection(command, source, replayCommand);
				case 'deselect-all':
					return this.#applyDeselect(command, source, replayCommand);
				case 'duplicate-node':
					return this.#applyDuplicate(command, source, replayCommand);
				case 'batch':
					return this.#applyBatch(command, source, replayCommand);
				default:
					return null;
			}
		} catch {
			return null;
		}
	}

	#applySelection(
		command: SelectNodeCommand,
		source: CommandSource,
		replayCommand?: CanvasCommand
	): CommandHistoryEntry {
		const previous = [...this.selection.selectedNodeIds];
		this.selection.select(command.nodeId, command.append);

		const inverse: CanvasCommand =
			previous.length === 0
				? { type: 'deselect-all' }
				: {
						type: 'batch',
						label: 'restore selection',
						commands: previous.map((nodeId, index) => ({
							type: 'select-node',
							nodeId,
							append: index > 0
						}))
					};

		return this.#toHistory(replayCommand ?? command, inverse, 'Select node', source);
	}

	#applyDeselect(
		command: DeselectAllCommand,
		source: CommandSource,
		replayCommand?: CanvasCommand
	): CommandHistoryEntry {
		const previous = [...this.selection.selectedNodeIds];
		this.selection.deselectAll();
		const inverse: CanvasCommand = {
			type: 'batch',
			label: 'restore selection',
			commands: previous.map((nodeId, index) => ({
				type: 'select-node',
				nodeId,
				append: index > 0
			}))
		};

		return this.#toHistory(replayCommand ?? command, inverse, 'Deselect nodes', source);
	}

	#applyDuplicate(
		command: DuplicateNodeCommand,
		source: CommandSource,
		replayCommand?: CanvasCommand
	): CommandHistoryEntry {
		const location = findNodeLocation(this.document.root, command.nodeId);

		if (!location?.parent) {
			throw new Error(`Cannot duplicate missing or root node "${command.nodeId}".`);
		}

		const copy = cloneNodeWithFreshIds(location.node);
		const insertCommand: CanvasCommand = {
			type: 'insert-node',
			parentId: location.parent.id,
			index: location.index + 1,
			node: copy
		};

		const result = applyInsertNode(this, insertCommand);
		this.selection.replace([copy.id]);
		return this.#toHistory(replayCommand ?? command, result.inverse, 'Duplicate node', source);
	}

	#applyBatch(
		command: BatchCommand,
		source: CommandSource,
		replayCommand?: CanvasCommand
	): CommandHistoryEntry {
		const inverses: CanvasCommand[] = [];

		for (const nestedCommand of command.commands) {
			const entry = this.#apply(nestedCommand, source);
			if (!entry) {
				continue;
			}

			inverses.unshift(entry.inverse);
		}

		return this.#toHistory(
			replayCommand ?? command,
			{
				type: 'batch',
				label: `Undo ${command.label}`,
				commands: inverses
			},
			command.label,
			source
		);
	}

	#toHistory(
		command: CanvasCommand,
		inverse: CanvasCommand,
		label: string,
		source: CommandSource
	): CommandHistoryEntry {
		return {
			command,
			inverse,
			label,
			source,
			timestamp: new Date().toISOString()
		};
	}
}
