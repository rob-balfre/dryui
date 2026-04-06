import type { DesignPlacement } from './types.js';

export interface History {
	push(placements: DesignPlacement[]): void;
	undo(): DesignPlacement[] | null;
	redo(): DesignPlacement[] | null;
	canUndo(): boolean;
	canRedo(): boolean;
	clear(): void;
}

function clonePlacements(placements: DesignPlacement[]): DesignPlacement[] {
	return placements.map((p) => ({ ...p }));
}

export function createHistory(maxEntries = 50): History {
	const undoStack: DesignPlacement[][] = [];
	const redoStack: DesignPlacement[][] = [];

	return {
		push(placements: DesignPlacement[]) {
			undoStack.push(clonePlacements(placements));
			redoStack.length = 0;
			if (undoStack.length > maxEntries + 1) {
				undoStack.shift();
			}
		},

		undo(): DesignPlacement[] | null {
			if (undoStack.length < 2) return null;
			const current = undoStack.pop();
			if (!current) return null;
			redoStack.push(current);
			const previous = undoStack[undoStack.length - 1];
			return previous ? clonePlacements(previous) : null;
		},

		redo(): DesignPlacement[] | null {
			if (redoStack.length === 0) return null;
			const next = redoStack.pop();
			if (!next) return null;
			undoStack.push(next);
			return clonePlacements(next);
		},

		canUndo(): boolean {
			return undoStack.length >= 2;
		},

		canRedo(): boolean {
			return redoStack.length > 0;
		},

		clear() {
			undoStack.length = 0;
			redoStack.length = 0;
		}
	};
}
