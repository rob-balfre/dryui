export class SelectionState {
	#selectedNodeIds: string[] = [];
	#hoveredNodeId: string | null = null;

	get selectedNodeIds(): string[] {
		return this.#selectedNodeIds;
	}

	get hoveredNodeId(): string | null {
		return this.#hoveredNodeId;
	}

	get activeNodeId(): string | null {
		return this.#selectedNodeIds.at(-1) ?? null;
	}

	setHovered(nodeId: string | null): void {
		this.#hoveredNodeId = nodeId;
	}

	select(nodeId: string, append = false): void {
		if (!append) {
			this.#selectedNodeIds = [nodeId];
			return;
		}

		if (!this.#selectedNodeIds.includes(nodeId)) {
			this.#selectedNodeIds = [...this.#selectedNodeIds, nodeId];
		}
	}

	remove(nodeId: string): void {
		this.#selectedNodeIds = this.#selectedNodeIds.filter((entry) => entry !== nodeId);

		if (this.#hoveredNodeId === nodeId) {
			this.#hoveredNodeId = null;
		}
	}

	replace(nodeIds: string[]): void {
		this.#selectedNodeIds = [...nodeIds];
	}

	deselectAll(): void {
		this.#selectedNodeIds = [];
		this.#hoveredNodeId = null;
	}
}
