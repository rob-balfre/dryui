import { describe, expect, it } from 'bun:test';
import { mapGestureToStudioMutation } from '../../../apps/studio/src/lib/gesture-adapter.ts';
import type { GestureEvent } from '../../../packages/hand-tracking/src/index.ts';

function createGestureEvent(
	overrides: Partial<GestureEvent> & Pick<GestureEvent, 'type'>
): GestureEvent {
	return {
		type: overrides.type,
		handId: overrides.handId ?? 'hand-1',
		handIndex: overrides.handIndex ?? 0,
		confidence: overrides.confidence ?? 0.9,
		cursor: overrides.cursor ?? null,
		details: overrides.details ?? {}
	};
}

describe('gesture adapter', () => {
	it('maps pinch gestures to selection commands', () => {
		const result = mapGestureToStudioMutation(createGestureEvent({ type: 'pinch' }), {
			hoveredNodeId: 'node-1'
		});

		expect(result.commands).toEqual([{ type: 'select-node', nodeId: 'node-1' }]);
	});

	it('maps drag gestures to move commands', () => {
		const result = mapGestureToStudioMutation(
			createGestureEvent({
				type: 'drag',
				details: {
					parentId: 'parent-2',
					index: 3
				}
			}),
			{
				selectedNodeId: 'node-4'
			}
		);

		expect(result.commands).toEqual([
			{
				type: 'move-node',
				nodeId: 'node-4',
				newParentId: 'parent-2',
				newIndex: 3
			}
		]);
	});

	it('maps open palm gestures to deselect-all', () => {
		const result = mapGestureToStudioMutation(createGestureEvent({ type: 'open-palm' }));

		expect(result.commands).toEqual([{ type: 'deselect-all' }]);
	});
});
