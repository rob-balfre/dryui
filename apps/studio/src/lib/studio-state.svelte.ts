import {
	CommandBus,
	createAutosave,
	createDocumentExportBlob,
	createTemplateForComponent,
	deserializeDocument,
	findNode,
	flattenTree,
	loadDocuments,
	saveDocuments,
	saveSnapshot,
	type CanvasStyle,
	type LayoutDocument,
	type LayoutNode
} from '@dryui/canvas';
import {
	applyThemePreference,
	buildInspectorNode,
	buildThemeTokens,
	createDemoDocument,
	createPaletteItems,
	readThemePreference,
	type InspectorControl,
	type InspectorNode,
	type PaletteItem,
	type ThemePreference,
	type ThemeToken
} from './studio-data';

export interface StudioLayerEntry {
	id: string;
	label: string;
	component: string;
	depth: number;
	selected: boolean;
	visible: boolean;
}

export interface StudioStateSnapshot {
	document: LayoutDocument;
	inspector: InspectorNode | null;
	themeTokens: ThemeToken[];
	layers: StudioLayerEntry[];
	selectedNodeIds: string[];
	hoveredNodeId: string | null;
	selectedPaletteId: string;
	selectedLabel: string;
	zoom: number;
	themePreference: ThemePreference;
	webcamEnabled: boolean;
	calibrationStep: number;
	canUndo: boolean;
	canRedo: boolean;
}

type StudioStateListener = (snapshot: StudioStateSnapshot) => void;

function buildLayerEntries(
	document: LayoutDocument,
	selectedNodeIds: string[]
): StudioLayerEntry[] {
	return flattenTree(document.root)
		.filter((location) => location.depth > 0)
		.map((location) => ({
			id: location.node.id,
			label:
				location.node.label ??
				(location.node.part
					? `${location.node.component}.${location.node.part}`
					: location.node.component),
			component: location.node.component,
			depth: location.depth - 1,
			selected: selectedNodeIds.includes(location.node.id),
			visible: location.node.visible
		}));
}

function createInitialDocument(): LayoutDocument {
	return loadDocuments()[0] ?? createDemoDocument();
}

export class StudioStateController {
	#listeners = new Set<StudioStateListener>();
	#unsubscribeBus: (() => void) | null = null;
	#selectedPaletteId = '';
	#zoom = 100;
	#themePreference: ThemePreference = readThemePreference();
	#webcamEnabled = false;
	#calibrationStep = 1;
	readonly paletteItems = createPaletteItems();
	readonly bus: CommandBus;
	readonly #autosave;

	constructor(initialDocument = createInitialDocument()) {
		this.bus = new CommandBus(initialDocument);
		this.#selectedPaletteId = this.paletteItems[0]?.id ?? '';
		this.#autosave = createAutosave(() => {
			const document = structuredClone(this.bus.document);
			saveDocuments([document]);
			saveSnapshot(document);
		}, 1000);

		const firstNodeId = this.bus.document.root.children[0]?.id;
		if (firstNodeId) {
			this.bus.selection.select(firstNodeId);
		}
	}

	mount(): () => void {
		applyThemePreference(this.#themePreference);

		if (!this.#unsubscribeBus) {
			this.#unsubscribeBus = this.bus.subscribe(() => {
				this.#autosave.schedule();
				this.#emit();
			});
		}

		this.#emit();

		return () => {
			this.#unsubscribeBus?.();
			this.#unsubscribeBus = null;
			this.#autosave.flush();
		};
	}

	subscribe(listener: StudioStateListener): () => void {
		this.#listeners.add(listener);
		listener(this.snapshot());
		return () => {
			this.#listeners.delete(listener);
		};
	}

	snapshot(): StudioStateSnapshot {
		const document = structuredClone(this.bus.document);
		const selectedNodeIds = [...this.bus.selection.selectedNodeIds];
		const selectedNode = this.getSelectedNode(document);
		const inspector = buildInspectorNode(selectedNode);
		const activePaletteId =
			selectedNode?.component &&
			this.paletteItems.some((item) => item.id === selectedNode.component)
				? selectedNode.component
				: this.#selectedPaletteId;

		return {
			document,
			inspector,
			themeTokens: buildThemeTokens(document),
			layers: buildLayerEntries(document, selectedNodeIds),
			selectedNodeIds,
			hoveredNodeId: this.bus.selection.hoveredNodeId,
			selectedPaletteId: activePaletteId,
			selectedLabel: inspector?.title ?? 'Nothing selected',
			zoom: this.#zoom,
			themePreference: this.#themePreference,
			webcamEnabled: this.#webcamEnabled,
			calibrationStep: this.#calibrationStep,
			canUndo: this.bus.canUndo,
			canRedo: this.bus.canRedo
		};
	}

	getSelectedNode(document: LayoutDocument = this.bus.document): LayoutNode | null {
		const nodeId = this.bus.selection.activeNodeId;
		return nodeId ? findNode(document.root, nodeId) : null;
	}

	setThemePreference(preference: ThemePreference): void {
		this.#themePreference = preference;
		applyThemePreference(preference);
		this.#emit();
	}

	zoomIn(): void {
		this.#zoom = Math.min(this.#zoom + 10, 180);
		this.#emit();
	}

	zoomOut(): void {
		this.#zoom = Math.max(this.#zoom - 10, 60);
		this.#emit();
	}

	resetZoom(): void {
		this.#zoom = 100;
		this.#emit();
	}

	undo(): boolean {
		const applied = this.bus.undo();
		if (applied) {
			this.#emit();
		}
		return applied;
	}

	redo(): boolean {
		const applied = this.bus.redo();
		if (applied) {
			this.#emit();
		}
		return applied;
	}

	exportDocument(): void {
		if (typeof document === 'undefined') {
			return;
		}

		const blob = createDocumentExportBlob(this.bus.document);
		const url = URL.createObjectURL(blob);
		const anchor = document.createElement('a');
		anchor.href = url;
		anchor.download = `${this.bus.document.name.toLowerCase().replace(/\s+/g, '-')}.dryui.json`;
		anchor.click();
		setTimeout(() => {
			URL.revokeObjectURL(url);
		}, 0);
	}

	importDocument(source: string): void {
		this.bus.replaceDocument(deserializeDocument(source));
		this.#autosave.schedule();
		this.#emit();
	}

	selectPaletteItem(item: PaletteItem): void {
		this.#selectedPaletteId = item.id;
		this.#emit();
	}

	insertPaletteItem(item: PaletteItem): void {
		const template = createTemplateForComponent(item.component);
		this.bus.execute(
			{
				type: 'insert-node',
				parentId: this.bus.document.root.id,
				index: this.bus.document.root.children.length,
				node: template
			},
			'mouse'
		);
		this.bus.execute({ type: 'select-node', nodeId: template.id }, 'mouse');
		this.#emit();
	}

	insertPaletteComponent(component: string): void {
		const item = this.paletteItems.find((entry) => entry.component === component);
		if (!item) {
			return;
		}

		this.#selectedPaletteId = item.id;
		this.insertPaletteItem(item);
	}

	selectCanvasNode(nodeId: string): void {
		this.bus.execute({ type: 'select-node', nodeId }, 'mouse');
		this.#emit();
	}

	clearSelection(): void {
		this.bus.execute({ type: 'deselect-all' }, 'mouse');
		this.#emit();
	}

	setHoveredNode(nodeId: string | null): void {
		this.bus.selection.setHovered(nodeId);
		this.#emit();
	}

	setWebcamEnabled(enabled: boolean): void {
		this.#webcamEnabled = enabled;
		this.#emit();
	}

	setZoom(zoom: number): void {
		this.#zoom = Math.max(60, Math.min(180, Math.round(zoom)));
		this.#emit();
	}

	advanceCalibration(): void {
		this.#webcamEnabled = true;
		this.#calibrationStep = Math.min(this.#calibrationStep + 1, 4);
		this.#emit();
	}

	updateNodeControl(control: InspectorControl, value: string | boolean): void {
		const selectedNode = this.getSelectedNode();
		if (!selectedNode) {
			return;
		}

		if (control.scope === 'text') {
			this.bus.execute({ type: 'set-text', nodeId: selectedNode.id, text: String(value) }, 'mouse');
			return;
		}

		if (control.scope === 'cssVar') {
			this.bus.execute(
				{
					type: 'set-css-var',
					nodeId: selectedNode.id,
					varName: control.key,
					value: String(value)
				},
				'mouse'
			);
			return;
		}

		if (control.scope === 'style') {
			if (control.key === 'visible') {
				const node = findNode(this.bus.document.root, selectedNode.id);
				if (!node) {
					return;
				}

				node.visible = Boolean(value);
				this.#touchDocument();
				this.#autosave.schedule();
				this.#emit();
				return;
			}

			this.bus.execute(
				{
					type: 'set-style',
					nodeId: selectedNode.id,
					property: control.key as keyof CanvasStyle,
					value: value as CanvasStyle[keyof CanvasStyle]
				},
				'mouse'
			);
			return;
		}

		this.bus.execute(
			{
				type: 'set-prop',
				nodeId: selectedNode.id,
				propName: control.key,
				value
			},
			'mouse'
		);
	}

	updateThemeToken(name: `--dry-${string}`, value: string): void {
		this.bus.execute({ type: 'set-theme-var', varName: name, value }, 'mouse');
	}

	#touchDocument(): void {
		this.bus.document.updatedAt = new Date().toISOString();
	}

	#emit(): void {
		const snapshot = this.snapshot();
		for (const listener of this.#listeners) {
			listener(snapshot);
		}
	}
}

export function createStudioState(initialDocument?: LayoutDocument): StudioStateController {
	return new StudioStateController(initialDocument);
}
