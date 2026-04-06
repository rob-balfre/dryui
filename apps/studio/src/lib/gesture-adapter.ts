import type { CanvasCommand } from '@dryui/canvas';
import type { GestureEvent } from '@dryui/hand-tracking';

export interface GestureAdapterContext {
	hoveredNodeId?: string | null;
	selectedNodeId?: string | null;
	zoom?: number;
	activePanelIndex?: number;
}

export interface GestureAdapterResult {
	commands: CanvasCommand[];
	hoveredNodeId?: string | null;
	nextZoom?: number;
	nextPanelIndex?: number;
}

export function mapGestureToStudioMutation(
	event: GestureEvent,
	context: GestureAdapterContext = {}
): GestureAdapterResult {
	switch (event.type) {
		case 'hover':
			return {
				commands: [],
				hoveredNodeId:
					typeof event.details.nodeId === 'string'
						? String(event.details.nodeId)
						: (context.hoveredNodeId ?? null)
			};
		case 'pinch':
			return context.hoveredNodeId
				? {
						commands: [{ type: 'select-node', nodeId: context.hoveredNodeId }]
					}
				: { commands: [] };
		case 'drag':
			return context.selectedNodeId &&
				typeof event.details.parentId === 'string' &&
				typeof event.details.index === 'number'
				? {
						commands: [
							{
								type: 'move-node',
								nodeId: context.selectedNodeId,
								newParentId: String(event.details.parentId),
								newIndex: Number(event.details.index)
							}
						]
					}
				: { commands: [] };
		case 'resize':
			return context.selectedNodeId && typeof event.details.width === 'string'
				? {
						commands: [
							{
								type: 'set-style',
								nodeId: context.selectedNodeId,
								property: 'width',
								value: String(event.details.width)
							}
						]
					}
				: { commands: [] };
		case 'two-hand-pinch':
			return {
				commands: [],
				nextZoom: Math.max(
					60,
					Math.min(180, (context.zoom ?? 100) + Number(event.details.delta ?? 0))
				)
			};
		case 'open-palm':
			return {
				commands: [{ type: 'deselect-all' }]
			};
		case 'swipe':
			return {
				commands: [],
				nextPanelIndex:
					(context.activePanelIndex ?? 0) + (event.details.direction === 'left' ? -1 : 1)
			};
		default:
			return { commands: [] };
	}
}
