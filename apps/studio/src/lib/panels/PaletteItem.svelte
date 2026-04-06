<script lang="ts">
	import { Badge, Button } from '@dryui/ui';
	import type { PaletteItem as PaletteItemData } from '../studio-data';

	interface Props {
		item: PaletteItemData;
		selected: boolean;
		onSelect: (item: PaletteItemData) => void;
		onDragStart: (event: DragEvent, item: PaletteItemData) => void;
	}

	let { item, selected, onSelect, onDragStart }: Props = $props();

	function toneVariant(tone: PaletteItemData['tone']) {
		if (tone === 'accent') return 'solid';
		if (tone === 'neutral') return 'outline';
		return 'soft';
	}
</script>

<div class="palette-item">
	<Button
		type="button"
		variant={selected ? 'solid' : toneVariant(item.tone)}
		color="primary"
		aria-pressed={selected}
		draggable="true"
		onclick={() => onSelect(item)}
		ondragstart={(event) => onDragStart(event, item)}
	>
		<span class="palette-item-copy">
			<span class="palette-item-name">{item.name}</span>
			<span class="palette-item-desc">{item.description}</span>
		</span>
		<Badge variant="outline" color="gray" size="sm">{item.badge}</Badge>
	</Button>
</div>

<style>
	.palette-item {
		width: 100%;
	}

	.palette-item button {
		justify-content: space-between;
		align-items: center;
		width: 100%;
		min-height: 72px;
		padding: var(--dry-space-3) var(--dry-space-4);
		text-align: left;
		display: flex;
		gap: var(--dry-space-3);
	}

	.palette-item-copy {
		display: grid;
		gap: 0.15rem;
		min-width: 0;
	}

	.palette-item-name {
		font-weight: 650;
	}

	.palette-item-desc {
		color: var(--dry-color-text-muted);
		font-size: var(--dry-text-sm-size);
		line-height: 1.35;
	}
</style>
