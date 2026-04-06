<script lang="ts">
	import { CanvasViewport, type LayoutDocument } from '@dryui/canvas';
	import { Badge, Card } from '@dryui/ui';

	interface Props {
		document: LayoutDocument;
		selectedNodeIds: string[];
		hoveredNodeId: string | null;
		zoom: number;
		onSelectNode: (nodeId: string) => void;
		onClearSelection: () => void;
		onDropComponent: (component: string) => void;
	}

	let {
		document,
		selectedNodeIds,
		hoveredNodeId,
		zoom,
		onSelectNode,
		onClearSelection,
		onDropComponent
	}: Props = $props();
</script>

<section class="preview-shell">
	<div class="preview-head">
		<div>
			<Badge variant="outline" color="gray">Canvas</Badge>
			<h2>Live preview</h2>
		</div>
		<p>
			Click any node to inspect it, use the palette to insert new components, and zoom from the
			toolbar.
		</p>
	</div>

	<Card.Root>
		<Card.Content>
			<CanvasViewport
				{document}
				scale={zoom / 100}
				{selectedNodeIds}
				{hoveredNodeId}
				onnodeclick={onSelectNode}
				oncanvasclick={onClearSelection}
				ondropcomponent={onDropComponent}
			/>
		</Card.Content>
	</Card.Root>
</section>

<style>
	.preview-shell {
		display: grid;
		gap: var(--dry-space-4);
	}

	.preview-head {
		display: flex;
		align-items: end;
		justify-content: space-between;
		gap: var(--dry-space-4);
	}

	.preview-head h2 {
		margin: 0;
	}

	.preview-head p {
		margin: 0;
		color: var(--dry-color-text-muted);
		max-width: 48ch;
	}
</style>
