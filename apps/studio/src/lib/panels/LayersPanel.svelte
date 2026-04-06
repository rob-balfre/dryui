<script lang="ts">
	import { Badge, Button, Card } from '@dryui/ui';
	import type { StudioLayerEntry } from '../studio-state.svelte';

	interface Props {
		layers: StudioLayerEntry[];
		onSelect: (nodeId: string) => void;
	}

	let { layers, onSelect }: Props = $props();
</script>

<section class="panel">
	<Card.Root>
		<div class="panel-header">
			<Card.Header>
				<div class="header-copy">
					<Badge variant="outline" color="blue">Layers</Badge>
					<h2>Document tree</h2>
				</div>
				<p>Inspect the current AST and jump directly to any rendered node.</p>
			</Card.Header>
		</div>

		<div class="panel-body">
			<Card.Content>
				<div class="layer-stack" aria-label="Studio layers">
					{#each layers as layer (layer.id)}
						<Button
							type="button"
							variant={layer.selected ? 'solid' : 'outline'}
							color="primary"
							onclick={() => onSelect(layer.id)}
						>
							<span class="layer-copy" style={`padding-left: ${layer.depth * 1.1}rem`}>
								<strong>{layer.label}</strong>
								<span>{layer.component}</span>
							</span>
							<Badge variant="outline" color={layer.visible ? 'green' : 'gray'} size="sm">
								{layer.visible ? 'visible' : 'hidden'}
							</Badge>
						</Button>
					{/each}
				</div>
			</Card.Content>
		</div>
	</Card.Root>
</section>

<style>
	.panel {
		height: 100%;
	}

	.panel-header {
		display: grid;
		gap: var(--dry-space-2);
	}

	.header-copy {
		display: flex;
		align-items: center;
		gap: var(--dry-space-3);
	}

	.header-copy h2 {
		margin: 0;
	}

	.panel-header p {
		margin: 0;
		color: var(--dry-color-text-muted);
	}

	.panel-body {
		display: grid;
		gap: var(--dry-space-4);
	}

	.layer-stack {
		display: grid;
		gap: var(--dry-space-2);
	}

	.layer-stack button {
		width: 100%;
		justify-content: space-between;
		gap: var(--dry-space-3);
	}

	.layer-copy {
		display: grid;
		justify-items: start;
		text-align: left;
	}

	.layer-copy span {
		color: var(--dry-color-text-muted);
		font-size: var(--dry-text-sm-size);
	}
</style>
